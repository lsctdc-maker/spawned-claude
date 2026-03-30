'use client';

import { useCallback, useRef } from 'react';
import { ManuscriptSection, ProductInfo, USP } from '@/lib/types';
import { useCanvasEditorStore, SECTION_IMAGE_MAP } from '../state/canvasStore';
import { authFetch } from '@/lib/auth-fetch';

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

    store.setGenerating(section.id, true);
    try {
      const res = await authFetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: imageType,
          productName: ctx.productInfo.name || '제품',
          category: ctx.productInfo.category || 'others',
          usps: ctx.extractedUSPs.map(u => u.title).slice(0, 3),
          tone: ctx.selectedTone || 'trust',
        }),
      });

      const data = await res.json();

      if (data.success && data.imageUrl) {
        store.setImage(section.id, data.imageUrl, !!data.isPlaceholder);
        return data.imageUrl;
      }

      return null;
    } catch (e) {
      console.error(`Image generation failed for section ${section.id}:`, e);
      return null;
    } finally {
      store.setGenerating(section.id, false);
    }
  }, [ctx.productInfo, ctx.extractedUSPs, ctx.selectedTone]);

  const generateAll = useCallback(async (sections: ManuscriptSection[]) => {
    abortRef.current = false;

    for (const section of sections) {
      if (abortRef.current) break;
      if (store.hasImage(section.id)) continue;

      await generateForSection(section);

      // Small delay between requests to avoid rate limiting
      if (!abortRef.current) {
        await new Promise(r => setTimeout(r, 500));
      }
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
