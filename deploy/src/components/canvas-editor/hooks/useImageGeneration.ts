'use client';

import { useCallback, useRef } from 'react';
import { ManuscriptSection, ProductInfo, USP } from '@/lib/types';
import { useCanvasEditorStore, SECTION_IMAGE_MAP } from '../state/canvasStore';
import { authFetch } from '@/lib/auth-fetch';
import { getTemplate } from '../templates/sections';

interface GenerationContext {
  productInfo: ProductInfo;
  extractedUSPs: USP[];
  selectedTone: string;
}

export function useImageGeneration(ctx: GenerationContext) {
  const store = useCanvasEditorStore();
  const abortRef = useRef(false);

  const generateForSection = useCallback(async (section: ManuscriptSection): Promise<string | null> => {
    const imageType = SECTION_IMAGE_MAP[section.sectionType] || 'background';
    const requestBody = JSON.stringify({
      type: imageType,
      productName: ctx.productInfo.name || '제품',
      category: ctx.productInfo.category || 'others',
      usps: ctx.extractedUSPs.map(u => u.title).slice(0, 3),
      tone: ctx.selectedTone || 'trust',
      imageGuide: section.imageGuide || '',
    });

    store.setGenerating(section.id, true);
    store.setGenerateError(section.id, false);
    try {
      let data: any = null;

      // Try authenticated fetch first, then check response, fallback to direct fetch
      try {
        const res = await authFetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });
        // authFetch returns 401 as normal Response (not throw) — must check status
        if (res.ok) {
          data = await res.json();
        } else {
          // Auth returned 401/403 — fallback to direct fetch without auth header
          console.warn(`authFetch returned ${res.status}, falling back to direct fetch`);
          const res2 = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
          });
          data = await res2.json();
        }
      } catch {
        // Network error or supabase client crash — try direct fetch
        try {
          const res = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
          });
          data = await res.json();
        } catch (e2) {
          console.error('Direct image fetch also failed:', e2);
        }
      }

      if (data?.success && data.imageUrl) {
        store.setImage(section.id, data.imageUrl, !!data.isPlaceholder);
        return data.imageUrl;
      }

      store.setGenerateError(section.id, true);
      return null;
    } catch (e) {
      console.error(`Image generation failed for section ${section.id}:`, e);
      store.setGenerateError(section.id, true);
      return null;
    } finally {
      store.setGenerating(section.id, false);
    }
  }, [ctx.productInfo, ctx.extractedUSPs, ctx.selectedTone]);

  const generateAll = useCallback(async (sections: ManuscriptSection[]) => {
    abortRef.current = false;

    // Filter to only sections that need image generation
    const needsImage = sections.filter(section => {
      if (store.hasImage(section.id)) return false;
      const template = getTemplate(section.sectionType, section.order, ctx.productInfo.category);
      return !template.solidBackground;
    });

    // Generate 5 at a time (parallel batches for faster initial load)
    for (let i = 0; i < needsImage.length; i += 5) {
      if (abortRef.current) break;
      const batch = needsImage.slice(i, i + 5);
      await Promise.allSettled(batch.map(s => generateForSection(s)));
    }
  }, [generateForSection]);

  const regenerateSection = useCallback(async (section: ManuscriptSection): Promise<string | null> => {
    // Force regenerate by generating regardless of existing image
    return await generateForSection(section);
  }, [generateForSection]);

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { generateAll, regenerateSection, abort };
}
