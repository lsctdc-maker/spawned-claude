'use client';

import { useEffect, useRef, useCallback } from 'react';
import { ManuscriptSection } from '@/lib/types';
import { useCanvasEditorStore } from '../state/canvasStore';
import { composeSectionCanvas } from '../templates';
import { getTemplate } from '../templates/sections';
import { CanvasColors, CanvasFonts } from '../templates/types';

/**
 * 백그라운드 pre-compose: 첫 섹션 로드 후 나머지 섹션을
 * offscreen fabric.Canvas에서 미리 compose하여 JSON 저장.
 * → 사용자가 섹션 클릭 시 loadFromJSON으로 즉시 복원.
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
  // Track: sectionId → imageUrl (or '__solid__') used during composition
  const composedRef = useRef<Map<string, string>>(new Map());

  const runPreCompose = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      const fabricModule = await import('fabric');

      for (const section of visibleSections) {
        // Skip active section (CanvasWorkspace handles it)
        if (section.id === store.activeSectionId) continue;

        const state = store.sections[section.id];
        const template = getTemplate(section.sectionType, section.order, category);
        const imageUrl = state?.imageUrl || null;

        // Skip if section needs AI image but doesn't have one yet
        if (!template.solidBackground && !imageUrl) continue;

        // Skip if already composed with same imageUrl
        const currentKey = imageUrl || '__solid__';
        if (composedRef.current.get(section.id) === currentKey) continue;

        try {
          // Create offscreen canvas (not added to DOM)
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

        // Yield to main thread between sections
        await new Promise(r => setTimeout(r, 50));
      }
    } finally {
      runningRef.current = false;
    }
  }, [visibleSections, colors, fonts, productPhotoUrl, category]);

  // Derive stable key from image URLs to detect when new images arrive
  const imageUrlsKey = useCanvasEditorStore(state =>
    visibleSections.map(s => state.sections[s.id]?.imageUrl || '').join('|')
  );

  // Run pre-compose on mount (800ms delay) and when new images arrive
  useEffect(() => {
    const timer = setTimeout(runPreCompose, 800);
    return () => clearTimeout(timer);
  }, [runPreCompose, imageUrlsKey]);
}
