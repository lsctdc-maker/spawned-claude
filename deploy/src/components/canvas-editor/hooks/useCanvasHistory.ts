'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCanvasEditorStore } from '../state/canvasStore';

export function useCanvasHistory(
  fabricCanvas: React.MutableRefObject<any>,
  sectionId: string,
  ready: boolean
) {
  const store = useCanvasEditorStore();
  const isLoadingRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas || !ready || !sectionId) return;

    const saveState = () => {
      if (isLoadingRef.current) return;

      // Debounce to avoid excessive saves
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const json = JSON.stringify(canvas.toJSON(['name', 'locked', 'selectable', 'evented']));
        store.pushHistory(sectionId, json);
        store.saveCanvasState(sectionId, json, canvas.getHeight());
      }, 150);
    };

    canvas.on('object:modified', saveState);
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);

    return () => {
      canvas.off('object:modified', saveState);
      canvas.off('object:added', saveState);
      canvas.off('object:removed', saveState);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [ready, sectionId]);

  const undo = useCallback(() => {
    const entry = store.undo(sectionId);
    if (entry && fabricCanvas.current) {
      isLoadingRef.current = true;
      fabricCanvas.current.loadFromJSON(entry.json, () => {
        fabricCanvas.current?.renderAll();
        isLoadingRef.current = false;
      });
    }
  }, [sectionId]);

  const redo = useCallback(() => {
    const entry = store.redo(sectionId);
    if (entry && fabricCanvas.current) {
      isLoadingRef.current = true;
      fabricCanvas.current.loadFromJSON(entry.json, () => {
        fabricCanvas.current?.renderAll();
        isLoadingRef.current = false;
      });
    }
  }, [sectionId]);

  const canUndo = store.canUndo(sectionId);
  const canRedo = store.canRedo(sectionId);

  return { undo, redo, canUndo, canRedo };
}
