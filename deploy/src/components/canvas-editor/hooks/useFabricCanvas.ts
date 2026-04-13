'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * fabric.js Canvas를 React DOM과 격리하여 초기화.
 * canvas 엘리먼트를 document.createElement로 생성해서
 * React reconciler가 fabric.js wrapper DOM을 건드리지 않도록 함.
 * → insertBefore 에러 방지
 */
export function useFabricCanvas(
  containerRef: React.RefObject<HTMLDivElement | null>,
  width: number,
  height: number
) {
  const fabricRef = useRef<any>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const fabricModuleRef = useRef<any>(null);

  useEffect(() => {
    let disposed = false;

    const init = async () => {
      const fabricModule = await import('fabric');
      fabricModuleRef.current = fabricModule;

      if (disposed || !containerRef.current) return;

      // DOM API로 canvas 생성 — React reconciler에서 격리
      const canvasEl = document.createElement('canvas');
      canvasEl.width = width;
      canvasEl.height = height;
      containerRef.current.appendChild(canvasEl);
      canvasElRef.current = canvasEl;

      const canvas = new fabricModule.Canvas(canvasEl, {
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
      // fabric.js dispose가 wrapper를 남길 수 있으므로 컨테이너 정리
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      canvasElRef.current = null;
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
