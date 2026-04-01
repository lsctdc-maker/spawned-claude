'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useFabricCanvas(
  canvasElRef: React.RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number
) {
  const fabricRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const fabricModuleRef = useRef<any>(null);

  useEffect(() => {
    let disposed = false;

    const init = async () => {
      const fabricModule = await import('fabric');
      fabricModuleRef.current = fabricModule;

      if (disposed || !canvasElRef.current) return;

      const canvas = new fabricModule.Canvas(canvasElRef.current, {
        width,
        height,
        backgroundColor: '#1a1a1a',
        preserveObjectStacking: true,
        selection: true,
        controlsAboveOverlay: true,
      });

      // Style selection controls
      canvas.selectionColor = 'rgba(49, 130, 246, 0.15)';
      canvas.selectionBorderColor = '#3182F6';
      canvas.selectionLineWidth = 1;

      // Default object control styling
      const defaultControls = {
        cornerColor: '#3182F6',
        cornerStrokeColor: '#3182F6',
        cornerSize: 8,
        cornerStyle: 'circle' as const,
        borderColor: '#3182F6',
        borderScaleFactor: 1.5,
        transparentCorners: false,
        padding: 4,
      };

      // Apply default controls to new objects
      canvas.on('object:added', (e: any) => {
        const obj = e.target;
        if (obj && !obj._defaultControlsSet) {
          obj.set(defaultControls);
          obj._defaultControlsSet = true;
        }
      });

      fabricRef.current = canvas;
      setReady(true);
    };

    init();

    return () => {
      disposed = true;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
        setReady(false);
      }
    };
  }, []); // Initialize once

  // Resize canvas when dimensions change
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !ready) return;
    canvas.setDimensions({ width, height });
    canvas.renderAll();
  }, [width, height, ready]);

  const getFabricModule = useCallback(() => fabricModuleRef.current, []);

  return { fabricCanvas: fabricRef, ready, getFabricModule };
}
