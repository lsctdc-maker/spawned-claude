'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useFabricCanvas } from './hooks/useFabricCanvas';
import { useCanvasHistory } from './hooks/useCanvasHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useCanvasEditorStore } from './state/canvasStore';
import { composeSectionCanvas } from './templates';
import { ManuscriptSection } from '@/lib/types';
import { CanvasColors, CanvasFonts } from './templates/types';
import { Undo2, Redo2, RefreshCw } from 'lucide-react';

const CANVAS_W = 860;

interface CanvasWorkspaceProps {
  section: ManuscriptSection;
  colors: CanvasColors;
  fonts: CanvasFonts;
  productPhotoUrl: string | null;
  onSelectionChange: (obj: any | null) => void;
  onCanvasReady?: (canvasRef: React.MutableRefObject<any>, getFabricModule: () => any) => void;
  category?: string;
}

export default function CanvasWorkspace({
  section,
  colors,
  fonts,
  productPhotoUrl,
  onSelectionChange,
  onCanvasReady,
  category,
}: CanvasWorkspaceProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const store = useCanvasEditorStore();
  const sectionId = section.id;
  const [canvasHeight, setCanvasHeight] = useState(520);
  const [composing, setComposing] = useState(true);

  const { fabricCanvas, ready, getFabricModule } = useFabricCanvas(canvasElRef, CANVAS_W, canvasHeight);
  const { undo, redo, canUndo, canRedo } = useCanvasHistory(fabricCanvas, sectionId, ready);

  useKeyboardShortcuts(fabricCanvas, ready, { onUndo: undo, onRedo: redo });

  // Notify parent when canvas is ready
  useEffect(() => {
    if (ready && onCanvasReady) {
      onCanvasReady(fabricCanvas, getFabricModule);
    }
  }, [ready, onCanvasReady]);

  // Track whether user has manually edited the canvas
  const userEditedRef = useRef(false);
  const lastImageUrlRef = useRef<string | null>(null);

  // Compose (or recompose) the canvas
  const composeCanvas = useCallback(async (imageUrl: string | null) => {
    const canvas = fabricCanvas.current;
    const fabricModule = getFabricModule();
    if (!canvas || !ready || !fabricModule) return;

    await composeSectionCanvas(
      canvas,
      fabricModule,
      section,
      imageUrl,
      colors,
      fonts,
      productPhotoUrl,
      category,
    );
    setCanvasHeight(canvas.getHeight());

    // Save state
    const json = JSON.stringify(canvas.toJSON(['name', 'locked', 'selectable', 'evented']));
    store.saveCanvasState(sectionId, json, canvas.getHeight());
    store.pushHistory(sectionId, json);

    // Generate thumbnail (delayed to avoid blocking compose)
    setTimeout(() => {
      try {
        const thumb = canvas.toDataURL({ format: 'png', multiplier: 0.2, quality: 0.7 });
        store.setThumbnail(sectionId, thumb);
      } catch {}
    }, 300);

    lastImageUrlRef.current = imageUrl;
  }, [fabricCanvas, getFabricModule, ready, section, sectionId, colors, fonts, productPhotoUrl, category]);

  // Load or compose canvas when section changes
  useEffect(() => {
    const canvas = fabricCanvas.current;
    const fabricModule = getFabricModule();
    if (!canvas || !ready || !fabricModule) return;

    const loadCanvas = async () => {
      setComposing(true);
      try {
        const saved = store.getCanvasState(sectionId);
        userEditedRef.current = false;

        if (saved && saved.canvasJSON && saved.dirty) {
          // Load saved canvas state
          setCanvasHeight(saved.canvasHeight);
          canvas.setDimensions({ width: CANVAS_W, height: saved.canvasHeight });
          await new Promise<void>(resolve => {
            canvas.loadFromJSON(saved.canvasJSON, () => {
              canvas.renderAll();
              resolve();
            });
          });
          lastImageUrlRef.current = saved.imageUrl;
        } else {
          // Compose new canvas from template + AI image
          const imageUrl = store.sections[sectionId]?.imageUrl || null;
          await composeCanvas(imageUrl);
        }
      } finally {
        setComposing(false);
      }
    };

    loadCanvas();
  }, [sectionId, ready]);

  // Recompose when AI image URL arrives (fixes race condition)
  const currentImageUrl = store.sections[sectionId]?.imageUrl || null;
  useEffect(() => {
    if (!ready) return;
    // Only recompose if imageUrl actually changed AND canvas hasn't been user-edited
    if (currentImageUrl && currentImageUrl !== lastImageUrlRef.current && !userEditedRef.current) {
      setComposing(true);
      composeCanvas(currentImageUrl).finally(() => setComposing(false));
    }
  }, [currentImageUrl, ready, composeCanvas]);

  // Track user edits (so we don't overwrite manual changes)
  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas || !ready) return;
    const markEdited = () => { userEditedRef.current = true; };
    canvas.on('object:modified', markEdited);
    return () => { canvas.off('object:modified', markEdited); };
  }, [ready]);

  // Wire selection events
  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas || !ready) return;

    const handleSelect = () => onSelectionChange(canvas.getActiveObject() || null);
    const handleClear = () => onSelectionChange(null);

    canvas.on('selection:created', handleSelect);
    canvas.on('selection:updated', handleSelect);
    canvas.on('selection:cleared', handleClear);

    return () => {
      canvas.off('selection:created', handleSelect);
      canvas.off('selection:updated', handleSelect);
      canvas.off('selection:cleared', handleClear);
    };
  }, [ready, onSelectionChange]);

  // Save thumbnail on modification
  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas || !ready) return;

    let thumbTimer: ReturnType<typeof setTimeout> | null = null;
    const updateThumb = () => {
      if (thumbTimer) clearTimeout(thumbTimer);
      thumbTimer = setTimeout(() => {
        if (!canvas) return;
        try {
          const thumb = canvas.toDataURL({ format: 'png', multiplier: 0.2, quality: 0.7 });
          store.setThumbnail(sectionId, thumb);
        } catch {}
      }, 800);
    };

    canvas.on('object:modified', updateThumb);
    return () => { canvas.off('object:modified', updateThumb); };
  }, [ready, sectionId]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Undo/Redo bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4E5968] bg-white border border-[#E5E8EB] rounded-lg disabled:opacity-30 hover:border-[#3182F6]/30 transition-all"
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
          실행 취소
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4E5968] bg-white border border-[#E5E8EB] rounded-lg disabled:opacity-30 hover:border-[#3182F6]/30 transition-all"
          title="다시 실행 (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
          다시 실행
        </button>
      </div>

      {/* Canvas container */}
      <div
        className="relative rounded-xl overflow-hidden border border-[#E5E8EB] shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
        style={{ width: CANVAS_W }}
      >
        {(!ready || composing) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] z-10 rounded-xl"
            style={{ minHeight: canvasHeight }}
          >
            <RefreshCw className="w-6 h-6 text-[#3182F6]/40 animate-spin mb-2" />
            <span className="text-[10px] text-[#8B95A1]">캔버스 로딩 중...</span>
          </div>
        )}
        <canvas ref={canvasElRef} />
      </div>

      {/* Width badge */}
      <div className="text-[10px] text-[#D1D6DB] tracking-wider">
        860px — 네이버 스마트스토어 기준 폭
      </div>
    </div>
  );
}
