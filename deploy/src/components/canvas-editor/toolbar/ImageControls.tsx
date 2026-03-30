'use client';

import { useState, useCallback, useRef } from 'react';
import { useDetailPage } from '@/hooks/useDetailPage';
import { useCanvasEditorStore } from '../state/canvasStore';
import { authFetch } from '@/lib/auth-fetch';
import {
  Image as ImageIcon, Upload, RefreshCw, Scissors, Trash2,
} from 'lucide-react';

interface ImageControlsProps {
  fabricCanvas: React.MutableRefObject<any>;
  selectedObj: any;
  sectionId: string;
}

export default function ImageControls({ fabricCanvas, selectedObj, sectionId }: ImageControlsProps) {
  const { state } = useDetailPage();
  const store = useCanvasEditorStore();
  const [removingBg, setRemovingBg] = useState(false);
  const [bgError, setBgError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas.current) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const fabricModule = await import('fabric');
      const canvas = fabricCanvas.current;
      if (!canvas) return;

      const img = await fabricModule.Image.fromURL(dataUrl, { crossOrigin: 'anonymous' });
      if (!img) return;
      const scale = Math.min(400 / img.width!, 300 / img.height!);
      img.set({
        left: 200,
        top: 100,
        scaleX: scale,
        scaleY: scale,
        name: '업로드 이미지',
      } as any);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [fabricCanvas]);

  // Handle background removal (누끼)
  const handleRemoveBg = useCallback(async () => {
    if (!selectedObj || selectedObj.type !== 'image') return;

    setRemovingBg(true);
    setBgError(null);

    try {
      // Get image source
      const imgElement = selectedObj.getElement?.();
      const imgSrc = imgElement?.src || selectedObj.getSrc?.();
      if (!imgSrc) throw new Error('이미지 소스를 찾을 수 없습니다');

      // Try server-side API first
      const blob = await (await fetch(imgSrc)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'product.png');

      let resultUrl: string | null = null;

      try {
        const res = await authFetch('/api/image/remove-bg', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.method !== 'passthrough') {
          resultUrl = data.imageUrl;
        }
      } catch {}

      // Fallback to client-side WASM
      if (!resultUrl) {
        try {
          const { removeBackground } = await import('@imgly/background-removal');
          const resultBlob = await removeBackground(blob, {
            publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/',
            debug: false,
          });
          resultUrl = URL.createObjectURL(resultBlob);
        } catch (e) {
          throw new Error('배경 제거에 실패했습니다');
        }
      }

      if (resultUrl) {
        // Replace image source (fabric.js v6 API)
        await selectedObj.setSrc(resultUrl, { crossOrigin: 'anonymous' });
        fabricCanvas.current?.renderAll();
        fabricCanvas.current?.fire('object:modified', { target: selectedObj });
      }
    } catch (e: any) {
      setBgError(e.message || '배경 제거 실패');
    } finally {
      setRemovingBg(false);
    }
  }, [selectedObj, fabricCanvas]);

  // Delete selected
  const handleDelete = useCallback(() => {
    const canvas = fabricCanvas.current;
    if (!canvas || !selectedObj) return;
    canvas.remove(selectedObj);
    canvas.discardActiveObject();
    canvas.renderAll();
  }, [fabricCanvas, selectedObj]);

  // Change opacity
  const handleOpacity = useCallback((val: number) => {
    if (!selectedObj || !fabricCanvas.current) return;
    selectedObj.set('opacity', val);
    fabricCanvas.current.renderAll();
    fabricCanvas.current.fire('object:modified', { target: selectedObj });
  }, [selectedObj, fabricCanvas]);

  const isImage = selectedObj?.type === 'image';

  return (
    <div className="space-y-3">
      <div className="text-[9px] uppercase tracking-widest text-[#e5e2e1]/30 flex items-center gap-1.5">
        <ImageIcon className="w-3 h-3" />
        이미지
      </div>

      {/* Upload new image */}
      <button
        onClick={handleUpload}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] text-[#c7c4d8] bg-[#1c1b1b] border border-[#464555]/20 rounded-lg hover:border-[#c3c0ff]/30 transition-all"
      >
        <Upload className="w-3.5 h-3.5" />
        이미지 추가
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Image-specific controls */}
      {isImage && (
        <>
          {/* Background removal */}
          <button
            onClick={handleRemoveBg}
            disabled={removingBg}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] text-[#c7c4d8] bg-[#1c1b1b] border border-[#464555]/20 rounded-lg hover:border-[#c3c0ff]/30 transition-all disabled:opacity-40"
          >
            {removingBg ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Scissors className="w-3.5 h-3.5" />
            )}
            {removingBg ? '누끼 처리 중...' : '누끼 (배경 제거)'}
          </button>

          {bgError && (
            <p className="text-[9px] text-red-400/70">{bgError}</p>
          )}

          {/* Opacity */}
          <div className="flex items-center gap-2">
            <label className="text-[9px] text-[#c7c4d8]/50 w-10">투명도</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selectedObj.opacity ?? 1}
              onChange={e => handleOpacity(Number(e.target.value))}
              className="flex-1 h-1 appearance-none bg-[#464555]/30 rounded-full"
            />
            <span className="text-[9px] text-[#c7c4d8]/40 w-8 text-right">
              {Math.round((selectedObj.opacity ?? 1) * 100)}%
            </span>
          </div>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] text-red-400/70 bg-[#1c1b1b] border border-red-400/15 rounded-lg hover:border-red-400/30 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            삭제
          </button>
        </>
      )}
    </div>
  );
}
