'use client';

import { useCallback, useRef } from 'react';
import { useCanvasEditorStore, SECTION_LABEL_MAP } from '../state/canvasStore';
import { ManuscriptSection } from '@/lib/types';

export function useCanvasExport(
  fabricCanvas: React.MutableRefObject<any>,
  productName: string
) {
  const store = useCanvasEditorStore();
  const isExportingRef = useRef(false);

  const exportCurrentSection = useCallback(async (section: ManuscriptSection) => {
    const canvas = fabricCanvas.current;
    if (!canvas || isExportingRef.current) return;

    isExportingRef.current = true;
    try {
      // Wait for fonts
      await document.fonts.ready;

      const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: store.resolution,
        quality: 1,
      });

      const link = document.createElement('a');
      link.download = `${productName || 'detail'}_${SECTION_LABEL_MAP[section.sectionType] || section.sectionType}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      isExportingRef.current = false;
    }
  }, [productName]);

  const exportAllSections = useCallback(async (
    sections: ManuscriptSection[],
    onProgress: (pct: number) => void
  ) => {
    const canvas = fabricCanvas.current;
    if (!canvas || isExportingRef.current) return;

    isExportingRef.current = true;
    onProgress(0);

    try {
      await document.fonts.ready;

      const images: { dataUrl: string; width: number; height: number }[] = [];

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const saved = store.getCanvasState(section.id);

        onProgress(Math.round((i / sections.length) * 85));

        if (saved && saved.canvasJSON) {
          // Load section canvas (fabric v6 Promise API)
          canvas.setDimensions({ width: 860, height: saved.canvasHeight });
          await canvas.loadFromJSON(saved.canvasJSON);
          canvas.renderAll();

          // Wait for images to load
          await new Promise(r => setTimeout(r, 200));

          const dataUrl = canvas.toDataURL({
            format: 'png',
            multiplier: store.resolution,
            quality: 1,
          });

          images.push({
            dataUrl,
            width: 860 * store.resolution,
            height: saved.canvasHeight * store.resolution,
          });
        }
      }

      if (images.length === 0) return;

      // Merge all images vertically
      onProgress(90);
      const totalHeight = images.reduce((sum, img) => sum + img.height, 0);
      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = images[0].width;
      mergedCanvas.height = totalHeight;
      const ctx = mergedCanvas.getContext('2d')!;

      let y = 0;
      for (const img of images) {
        const imgEl = new Image();
        imgEl.src = img.dataUrl;
        await new Promise(r => { imgEl.onload = r; });
        ctx.drawImage(imgEl, 0, y);
        y += img.height;
      }

      onProgress(100);

      const link = document.createElement('a');
      link.download = `${productName || 'detail'}_상세페이지_전체.png`;
      link.href = mergedCanvas.toDataURL('image/png');
      link.click();

      // Restore current section (fabric v6 Promise API)
      const currentSection = store.activeSectionId;
      const currentState = store.getCanvasState(currentSection);
      if (currentState?.canvasJSON) {
        canvas.setDimensions({ width: 860, height: currentState.canvasHeight });
        await canvas.loadFromJSON(currentState.canvasJSON);
        canvas.renderAll();
      }
    } finally {
      isExportingRef.current = false;
      onProgress(0);
    }
  }, [productName]);

  return { exportCurrentSection, exportAllSections };
}
