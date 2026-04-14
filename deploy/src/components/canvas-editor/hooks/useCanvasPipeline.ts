'use client';

import { useEffect, useRef, useCallback } from 'react';
import { ManuscriptSection, ProductInfo, USP } from '@/lib/types';
import { useCanvasEditorStore } from '../state/canvasStore';
import { composeSectionCanvas } from '../templates';
import { CanvasColors, CanvasFonts } from '../templates/types';
import { authFetch } from '@/lib/auth-fetch';
import { generateGeminiPrompt, DesignContext } from '@/lib/gemini-prompts';
import { SECTION_IMAGE_MAP } from '../state/canvasStore';

interface PipelineContext {
  productInfo: ProductInfo;
  extractedUSPs: USP[];
  selectedTone: string;
  colors: CanvasColors;
  fonts: CanvasFonts;
  productPhotoUrl: string | null;
  category?: string;
  projectId?: string;
}

const IMAGE_BATCH = 3;   // Gemini 병렬 호출 수
const COMPOSE_BATCH = 3; // offscreen compose 병렬 수

async function batchedParallel<T>(
  items: T[],
  batchSize: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(worker));
  }
}

/**
 * "Generate Once, Load Many" 파이프라인.
 *
 * 초기 1회만 실행:
 * 1) Gemini 이미지 전체 병렬 생성
 * 2) 각 섹션 offscreen compose → canvasJSON 저장
 * 3) ready 상태 발행
 *
 * 이후 섹션 전환은 workspace에서 loadFromJSON만 수행 (재-compose 없음).
 */
export function useCanvasPipeline(
  visibleSections: ManuscriptSection[],
  ctx: PipelineContext,
) {
  const store = useCanvasEditorStore();
  const ranRef = useRef(false);
  const abortRef = useRef(false);

  const generateImageForSection = useCallback(async (section: ManuscriptSection): Promise<string | null> => {
    const designCtx: DesignContext = {
      productInfo: ctx.productInfo,
      usps: ctx.extractedUSPs,
      tone: ctx.selectedTone || 'trust',
      colors: {
        primary: ctx.colors.bg,
        accent: ctx.colors.accent,
        bg: ctx.colors.bg,
        text: ctx.colors.text,
      },
    };
    const { prompt, width, height } = generateGeminiPrompt(section, designCtx);

    // 1) Gemini 시도
    try {
      const res = await authFetch('/api/generate-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width, height }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.imageUrl) return data.imageUrl;
      }
    } catch (e) {
      console.warn(`[pipeline] Gemini failed for ${section.id}:`, e);
    }

    // 2) 스톡 이미지 폴백
    try {
      const imageType = SECTION_IMAGE_MAP[section.sectionType] || 'background';
      const body = JSON.stringify({
        type: imageType,
        productName: ctx.productInfo.name || '제품',
        category: ctx.productInfo.category || 'others',
        usps: ctx.extractedUSPs.map(u => u.title).slice(0, 3),
        tone: ctx.selectedTone || 'trust',
        imageGuide: section.imageGuide || '',
      });
      const res = await authFetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.imageUrl) return data.imageUrl;
      }
    } catch (e) {
      console.warn(`[pipeline] Stock image failed for ${section.id}:`, e);
    }

    return null;
  }, [ctx.productInfo, ctx.extractedUSPs, ctx.selectedTone, ctx.colors]);

  const composeOffscreen = useCallback(async (
    section: ManuscriptSection,
    imageUrl: string | null,
    fabricModule: any,
  ): Promise<{ json: string; height: number; thumbnail: string } | null> => {
    try {
      const el = document.createElement('canvas');
      const offscreen = new fabricModule.Canvas(el, {
        width: 860,
        height: 520,
        backgroundColor: ctx.colors.bg,
      });

      await composeSectionCanvas(
        offscreen, fabricModule, section, imageUrl,
        ctx.colors, ctx.fonts, ctx.productPhotoUrl, ctx.category,
      );

      const json = JSON.stringify(offscreen.toJSON(['name', 'locked', 'selectable', 'evented']));
      const height = offscreen.getHeight();
      let thumbnail = '';
      try {
        thumbnail = offscreen.toDataURL({ format: 'png', multiplier: 0.2, quality: 0.7 });
      } catch {}

      offscreen.dispose();
      return { json, height, thumbnail };
    } catch (e) {
      console.error(`[pipeline] Compose failed for ${section.id}:`, e);
      return null;
    }
  }, [ctx.colors, ctx.fonts, ctx.productPhotoUrl, ctx.category]);

  const runPipeline = useCallback(async () => {
    if (ranRef.current) return;
    ranRef.current = true;
    abortRef.current = false;

    const total = visibleSections.length;
    store.setStatus('generating');
    store.setProgress({ imaged: 0, composed: 0, total });

    try {
      const fabricModule = await import('fabric');

      // === Phase A: Gemini 이미지 병렬 생성 ===
      const imagesBySection: Record<string, string | null> = {};
      await batchedParallel(visibleSections, IMAGE_BATCH, async (section) => {
        if (abortRef.current) return;
        const url = await generateImageForSection(section);
        imagesBySection[section.id] = url;
        if (url) store.setImage(section.id, url, false);
        const cur = useCanvasEditorStore.getState().progress;
        store.setProgress({ imaged: cur.imaged + 1 });
      });

      if (abortRef.current) return;

      // === Phase B: offscreen compose 병렬 ===
      store.setStatus('composing');
      await batchedParallel(visibleSections, COMPOSE_BATCH, async (section) => {
        if (abortRef.current) return;
        const url = imagesBySection[section.id] ?? null;
        const result = await composeOffscreen(section, url, fabricModule);
        if (result) {
          store.saveCanvasState(section.id, result.json, result.height);
          if (result.thumbnail) store.setThumbnail(section.id, result.thumbnail);
        }
        const cur = useCanvasEditorStore.getState().progress;
        store.setProgress({ composed: cur.composed + 1 });
      });

      if (abortRef.current) return;

      // === Phase C: 준비 완료 ===
      store.setStatus('ready');
    } catch (e) {
      console.error('[pipeline] Fatal error:', e);
      store.setStatus('error', (e as Error).message);
      ranRef.current = false; // 재시도 허용
    }
  }, [visibleSections, generateImageForSection, composeOffscreen]);

  const retry = useCallback(() => {
    ranRef.current = false;
    abortRef.current = false;
    store.setStatus('idle');
    store.setProgress({ imaged: 0, composed: 0, total: visibleSections.length });
    runPipeline();
  }, [runPipeline, visibleSections.length]);

  // 마운트 시 1회 실행
  useEffect(() => {
    if (visibleSections.length === 0) return;
    // 이미 ready 상태면 재실행 안 함 (DB 로드 후 바로 ready 등)
    if (useCanvasEditorStore.getState().status === 'ready') return;
    runPipeline();

    return () => {
      abortRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSections.length]);

  return { retry };
}
