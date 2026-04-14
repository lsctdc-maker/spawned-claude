'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useFabricCanvas } from './hooks/useFabricCanvas';
import { useCanvasHistory } from './hooks/useCanvasHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useCanvasEditorStore } from './state/canvasStore';
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

/**
 * Phase 5: loadFromJSON-only workspace.
 *
 * 파이프라인이 모든 섹션을 사전 compose해둠 (canvasJSON 저장).
 * Workspace는 단순히 섹션 전환 시 loadFromJSON만 수행.
 * - compose 없음 (레이스 없음)
 * - 이미지 도착 effect 없음
 * - 오직 loadFromJSON + 사용자 편집
 */
export default function CanvasWorkspace({
  section,
  colors,
  fonts,
  productPhotoUrl,
  onSelectionChange,
  onCanvasReady,
  category,
}: CanvasWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const store = useCanvasEditorStore();
  const sectionId = section.id;
  const [canvasHeight, setCanvasHeight] = useState(520);
  const [loading, setLoading] = useState(true);

  const { fabricCanvas, ready, getFabricModule } = useFabricCanvas(containerRef, CANVAS_W, canvasHeight);
  const { undo, redo, canUndo, canRedo } = useCanvasHistory(fabricCanvas, sectionId, ready);

  useKeyboardShortcuts(fabricCanvas, ready, { onUndo: undo, onRedo: redo });

  // Notify parent when canvas is ready
  useEffect(() => {
    if (ready && onCanvasReady) {
      onCanvasReady(fabricCanvas, getFabricModule);
    }
  }, [ready, onCanvasReady]);

  const prevSectionIdRef = useRef<string>('');

  // Save current canvas state to store (for outgoing section)
  const saveCurrentState = useCallback(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    const currentId = prevSectionIdRef.current;
    if (!currentId) return;
    try {
      const json = JSON.stringify(canvas.toJSON(['name', 'locked', 'selectable', 'evented']));
      store.saveCanvasState(currentId, json, canvas.getHeight());
      try {
        const thumb = canvas.toDataURL({ format: 'png', multiplier: 0.2, quality: 0.7 });
        store.setThumbnail(currentId, thumb);
      } catch {}
    } catch (e) {
      console.warn('Failed to save current state:', e);
    }
  }, [fabricCanvas, store]);

  // === Main effect: load section JSON from store (no compose) ===
  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas || !ready) return;

    let cancelled = false;

    const loadSection = async () => {
      setLoading(true);

      // 1. Save outgoing section's current state
      if (prevSectionIdRef.current && prevSectionIdRef.current !== sectionId) {
        saveCurrentState();
        canvas.discardActiveObject();
        onSelectionChange(null);
      }

      // 2. Load incoming section's JSON (파이프라인이 이미 준비해둠)
      const saved = store.getCanvasState(sectionId);
      if (!cancelled && saved?.canvasJSON) {
        try {
          setCanvasHeight(saved.canvasHeight);
          canvas.setDimensions({ width: CANVAS_W, height: saved.canvasHeight });
          await new Promise<void>((resolve) => {
            canvas.loadFromJSON(saved.canvasJSON, () => {
              if (!cancelled) canvas.renderAll();
              resolve();
            });
          });
        } catch (e) {
          console.warn(`Failed to load section ${sectionId}:`, e);
        }
      } else if (!cancelled) {
        // No saved JSON — empty canvas (파이프라인 미완성 or 에러)
        canvas.clear();
        canvas.backgroundColor = colors.bg;
        canvas.renderAll();
      }

      prevSectionIdRef.current = sectionId;
      if (!cancelled) setLoading(false);
    };

    loadSection();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, ready]);

  // Track user edits (for history marking)
  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas || !ready) return;
    const markEdited = () => {
      // Save current state to store on every edit (for auto-save)
      const json = JSON.stringify(canvas.toJSON(['name', 'locked', 'selectable', 'evented']));
      store.saveCanvasState(sectionId, json, canvas.getHeight());
    };
    canvas.on('object:modified', markEdited);
    canvas.on('object:added', markEdited);
    canvas.on('object:removed', markEdited);
    return () => {
      canvas.off('object:modified', markEdited);
      canvas.off('object:added', markEdited);
      canvas.off('object:removed', markEdited);
    };
  }, [ready, sectionId, store]);

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

  // Update thumbnail on edit (debounced)
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
    return () => {
      canvas.off('object:modified', updateThumb);
      if (thumbTimer) clearTimeout(thumbTimer);
    };
  }, [ready, sectionId, store]);

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
        {(!ready || loading) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] z-10 rounded-xl"
            style={{ minHeight: canvasHeight }}
          >
            <RefreshCw className="w-6 h-6 text-[#3182F6]/40 animate-spin mb-2" />
            <span className="text-[10px] text-[#8B95A1]">섹션 로딩 중...</span>
          </div>
        )}
        <div ref={containerRef} />
      </div>

      {/* Width badge */}
      <div className="text-[10px] text-[#D1D6DB] tracking-wider">
        860px — 네이버 스마트스토어 기준 폭
      </div>
    </div>
  );
}
