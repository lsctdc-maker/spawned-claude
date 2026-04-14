'use client';

import { useCallback, useRef } from 'react';
import { ManuscriptSection, ProductInfo, USP } from '@/lib/types';
import { useCanvasEditorStore, SECTION_IMAGE_MAP } from '../state/canvasStore';
import { authFetch } from '@/lib/auth-fetch';
import { getTemplate } from '../templates/sections';
import { generateGeminiPrompt, DesignContext } from '@/lib/gemini-prompts';

interface GenerationContext {
  productInfo: ProductInfo;
  extractedUSPs: USP[];
  selectedTone: string;
  colors?: { primary: string; accent: string; bg: string; text: string };
}

export function useImageGeneration(ctx: GenerationContext) {
  const store = useCanvasEditorStore();
  const abortRef = useRef(false);

  const generateForSection = useCallback(async (section: ManuscriptSection): Promise<string | null> => {
    store.setGenerating(section.id, true);
    store.setGenerateError(section.id, false);

    try {
      // 1st: Try Gemini (complete section images with text+design baked in)
      try {
        const designCtx: DesignContext = {
          productInfo: ctx.productInfo,
          usps: ctx.extractedUSPs,
          tone: ctx.selectedTone || 'trust',
          colors: ctx.colors || { primary: '#0f1729', accent: '#3182F6', bg: '#0f1729', text: '#f0f0f0' },
        };
        const { prompt, width, height } = generateGeminiPrompt(section, designCtx);

        const res = await authFetch('/api/generate-gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, width, height }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.imageUrl) {
            store.setImage(section.id, data.imageUrl, false);
            return data.imageUrl;
          }
        }
        // Non-OK (401, 500, etc.) — fall through to stock image fallback
      } catch (e) {
        console.warn('Gemini generation failed, falling back to stock:', e);
      }

      // 2nd: Fallback to stock images (no DALL-E)
      const imageType = SECTION_IMAGE_MAP[section.sectionType] || 'background';
      const stockBody = JSON.stringify({
        type: imageType,
        productName: ctx.productInfo.name || '제품',
        category: ctx.productInfo.category || 'others',
        usps: ctx.extractedUSPs.map(u => u.title).slice(0, 3),
        tone: ctx.selectedTone || 'trust',
        imageGuide: section.imageGuide || '',
      });

      let data: any = null;
      try {
        const res = await authFetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: stockBody,
        });
        if (res.ok) {
          data = await res.json();
        } else {
          const res2 = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: stockBody,
          });
          data = await res2.json();
        }
      } catch {
        try {
          const res = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: stockBody,
          });
          data = await res.json();
        } catch (e2) {
          console.error('Stock image fetch also failed:', e2);
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
  }, [ctx.productInfo, ctx.extractedUSPs, ctx.selectedTone, ctx.colors]);

  const generateAll = useCallback(async (sections: ManuscriptSection[]) => {
    abortRef.current = false;

    // Filter to only sections that need image generation
    const needsImage = sections.filter(section => {
      if (store.hasImage(section.id)) return false;
      const template = getTemplate(section.sectionType, section.order, ctx.productInfo.category);
      return !template.solidBackground;
    });

    // Generate 3 at a time (Gemini is slower, smaller batches)
    for (let i = 0; i < needsImage.length; i += 3) {
      if (abortRef.current) break;
      const batch = needsImage.slice(i, i + 3);
      await Promise.allSettled(batch.map(s => generateForSection(s)));
    }
  }, [generateForSection]);

  const regenerateSection = useCallback(async (section: ManuscriptSection): Promise<string | null> => {
    return await generateForSection(section);
  }, [generateForSection]);

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { generateAll, regenerateSection, abort };
}
