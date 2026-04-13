'use client';

import { useEffect, useRef, useCallback } from 'react';
import { ManuscriptSection } from '@/lib/types';
import { useCanvasEditorStore } from '../state/canvasStore';
import { composeSectionCanvas } from '../templates';
import { CanvasColors, CanvasFonts } from '../templates/types';

const BATCH_SIZE = 3; // 동시에 compose할 섹션 수

/**
 * 백그라운드 pre-compose: 첫 섹션 로드 후 나머지 섹션을
 * offscreen fabric.Canvas에서 미리 compose하여 JSON 저장.
 * → 사용자가 섹션 클릭 시 loadFromJSON으로 즉시 복원.
 *
 * 병렬 배치 처리: BATCH_SIZE개씩 동시 compose → 전체 시간 ~1/3로 단축.
 */
export function usePreCompose(
  visibleSections: ManuscriptSection[],
  colors: CanvasColors,
  fonts: CanvasFonts,
  productPhotoUrl: string | null,
  category?: string,
) {
  const store = useCanvasEditorStore();
  const runningRef = useRef(false);
  // Track: sectionId → imageUrl (or '__no_image__') used during composition
  const composedRef = useRef<Map<string, string>>(new Map());

  const runPreCompose = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      const fabricModule = await import('fabric');

      // 1) Compose할 섹션 목록 필터링
      const toCompose = visibleSections.filter(section => {
        if (section.id === store.activeSectionId) return false;
        const state = store.sections[section.id];
        const imageUrl = state?.imageUrl || null;
        const currentKey = imageUrl || '__no_image__';
        return composedRef.current.get(section.id) !== currentKey;
      });

      // 2) 배치 단위로 병렬 처리
      for (let i = 0; i < toCompose.length; i += BATCH_SIZE) {
        const batch = toCompose.slice(i, i + BATCH_SIZE);

        await Promise.allSettled(batch.map(async (section) => {
          const state = store.sections[section.id];
          const imageUrl = state?.imageUrl || null;
          const currentKey = imageUrl || '__no_image__';

          try {
            const el = document.createElement('canvas');
            const offscreen = new fabricModule.Canvas(el, {
              width: 860,
              height: 800,
              backgroundColor: '#1a1a1a',
            });

            await composeSectionCanvas(
              offscreen, fabricModule, section, imageUrl,
              colors, fonts, productPhotoUrl, category,
            );

            const json = JSON.stringify(
              (offscreen as any).toJSON(['name', 'locked', 'selectable', 'evented'])
            );
            store.saveCanvasState(section.id, json, offscreen.getHeight());

            // Thumbnail for sidebar
            try {
              const thumb = offscreen.toDataURL({
                format: 'png', multiplier: 0.2, quality: 0.7,
              });
              store.setThumbnail(section.id, thumb);
            } catch {}

            composedRef.current.set(section.id, currentKey);
            offscreen.dispose();
          } catch (e) {
            console.warn(`Pre-compose failed for ${section.id}:`, e);
          }
        }));

        // Yield to main thread between batches
        await new Promise(r => setTimeout(r, 30));
      }
    } finally {
      runningRef.current = false;
    }
  }, [visibleSections, colors, fonts, productPhotoUrl, category]);

  // Derive stable key from image URLs to detect when new images arrive
  const imageUrlsKey = useCanvasEditorStore(state =>
    visibleSections.map(s => state.sections[s.id]?.imageUrl || '').join('|')
  );

  // Run pre-compose on mount (300ms delay) and when new images arrive
  useEffect(() => {
    const timer = setTimeout(runPreCompose, 300);
    return () => clearTimeout(timer);
  }, [runPreCompose, imageUrlsKey]);
}
