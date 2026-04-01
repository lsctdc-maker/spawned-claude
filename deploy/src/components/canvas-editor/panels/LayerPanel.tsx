'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Layers, Lock, Unlock, Eye, EyeOff, ChevronUp, ChevronDown, Trash2,
  Type as TypeIcon, Image as ImageIcon, Square,
} from 'lucide-react';

interface LayerPanelProps {
  fabricCanvas: React.MutableRefObject<any>;
  ready: boolean;
  onSelectionChange: (obj: any | null) => void;
}

interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  selected: boolean;
}

export default function LayerPanel({ fabricCanvas, ready, onSelectionChange }: LayerPanelProps) {
  const [layers, setLayers] = useState<LayerItem[]>([]);

  const refreshLayers = useCallback(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const activeObj = canvas.getActiveObject();

    const items: LayerItem[] = objects
      .map((obj: any, index: number) => ({
        id: `obj-${index}`,
        name: obj.name || `${obj.type} ${index + 1}`,
        type: obj.type || 'object',
        visible: obj.visible !== false,
        locked: obj.selectable === false && obj.evented === false,
        selected: obj === activeObj,
        _fabricObj: obj,
      }))
      .reverse(); // Top layers first

    setLayers(items);
  }, [fabricCanvas]);

  // Refresh on mount and canvas events
  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas || !ready) return;

    refreshLayers();

    canvas.on('object:added', refreshLayers);
    canvas.on('object:removed', refreshLayers);
    canvas.on('object:modified', refreshLayers);
    canvas.on('selection:created', refreshLayers);
    canvas.on('selection:updated', refreshLayers);
    canvas.on('selection:cleared', refreshLayers);

    return () => {
      canvas.off('object:added', refreshLayers);
      canvas.off('object:removed', refreshLayers);
      canvas.off('object:modified', refreshLayers);
      canvas.off('selection:created', refreshLayers);
      canvas.off('selection:updated', refreshLayers);
      canvas.off('selection:cleared', refreshLayers);
    };
  }, [ready, refreshLayers]);

  const getObject = useCallback((index: number) => {
    const canvas = fabricCanvas.current;
    if (!canvas) return null;
    const objects = canvas.getObjects();
    // layers are reversed, so convert back
    const objIndex = objects.length - 1 - index;
    return objects[objIndex] || null;
  }, [fabricCanvas]);

  const handleSelect = useCallback((index: number) => {
    const canvas = fabricCanvas.current;
    const obj = getObject(index);
    if (!canvas || !obj) return;
    if (obj.selectable === false) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
    onSelectionChange(obj);
  }, [getObject, onSelectionChange, fabricCanvas]);

  const handleToggleVisible = useCallback((index: number) => {
    const canvas = fabricCanvas.current;
    const obj = getObject(index);
    if (!canvas || !obj) return;
    obj.set('visible', !obj.visible);
    canvas.renderAll();
    canvas.fire('object:modified', { target: obj });
    refreshLayers();
  }, [getObject, fabricCanvas, refreshLayers]);

  const handleToggleLock = useCallback((index: number) => {
    const canvas = fabricCanvas.current;
    const obj = getObject(index);
    if (!canvas || !obj) return;
    const isLocked = obj.selectable === false && obj.evented === false;
    obj.set({
      selectable: isLocked,
      evented: isLocked,
    });
    if (!isLocked) {
      canvas.discardActiveObject();
    }
    canvas.renderAll();
    refreshLayers();
  }, [getObject, fabricCanvas, refreshLayers]);

  const handleMoveUp = useCallback((index: number) => {
    const canvas = fabricCanvas.current;
    const obj = getObject(index);
    if (!canvas || !obj) return;
    canvas.bringObjectForward(obj);
    canvas.renderAll();
    canvas.fire('object:modified', { target: obj });
    refreshLayers();
  }, [getObject, fabricCanvas, refreshLayers]);

  const handleMoveDown = useCallback((index: number) => {
    const canvas = fabricCanvas.current;
    const obj = getObject(index);
    if (!canvas || !obj) return;
    canvas.sendObjectBackwards(obj);
    canvas.renderAll();
    canvas.fire('object:modified', { target: obj });
    refreshLayers();
  }, [getObject, fabricCanvas, refreshLayers]);

  const handleDelete = useCallback((index: number) => {
    const canvas = fabricCanvas.current;
    const obj = getObject(index);
    if (!canvas || !obj) return;
    if (obj.selectable === false) return; // Don't delete locked objects
    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.renderAll();
    onSelectionChange(null);
  }, [getObject, fabricCanvas, onSelectionChange]);

  const getTypeIcon = (type: string) => {
    if (type === 'i-text' || type === 'textbox' || type === 'text') return TypeIcon;
    if (type === 'image') return ImageIcon;
    return Square;
  };

  if (layers.length === 0) {
    return (
      <div>
        <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-2 flex items-center gap-1.5">
          <Layers className="w-3 h-3" />
          레이어
        </div>
        <p className="text-[9px] text-[#8B95A1]">레이어 없음</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-2 flex items-center gap-1.5">
        <Layers className="w-3 h-3" />
        레이어 ({layers.length})
      </div>

      <div className="space-y-0.5 max-h-64 overflow-y-auto">
        {layers.map((layer, i) => {
          const Icon = getTypeIcon(layer.type);
          return (
            <div
              key={layer.id}
              onClick={() => handleSelect(i)}
              className={`flex items-center gap-1 px-1.5 py-1 rounded-lg cursor-pointer transition-all group ${
                layer.selected
                  ? 'bg-[#EBF4FF] border border-[#3182F6]/25'
                  : 'hover:bg-[#F4F5F7] border border-transparent'
              }`}
            >
              <Icon className={`w-3 h-3 flex-shrink-0 ${
                layer.selected ? 'text-[#3182F6]' : 'text-[#D1D6DB]'
              }`} />

              <span className={`flex-1 text-[9px] truncate ${
                layer.selected ? 'text-[#3182F6]' : 'text-[#4E5968]'
              } ${!layer.visible ? 'line-through opacity-40' : ''}`}>
                {layer.name}
              </span>

              {/* Controls (show on hover or selected) */}
              <div className={`flex items-center gap-0.5 ${
                layer.selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } transition-opacity`}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveUp(i); }}
                  className="p-0.5 text-[#D1D6DB] hover:text-[#191F28] rounded"
                  title="위로"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveDown(i); }}
                  className="p-0.5 text-[#D1D6DB] hover:text-[#191F28] rounded"
                  title="아래로"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleVisible(i); }}
                  className="p-0.5 text-[#D1D6DB] hover:text-[#191F28] rounded"
                  title={layer.visible ? '숨기기' : '보이기'}
                >
                  {layer.visible
                    ? <Eye className="w-2.5 h-2.5" />
                    : <EyeOff className="w-2.5 h-2.5" />
                  }
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleLock(i); }}
                  className="p-0.5 text-[#D1D6DB] hover:text-[#191F28] rounded"
                  title={layer.locked ? '잠금 해제' : '잠금'}
                >
                  {layer.locked
                    ? <Lock className="w-2.5 h-2.5" />
                    : <Unlock className="w-2.5 h-2.5" />
                  }
                </button>
                {!layer.locked && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(i); }}
                    className="p-0.5 text-red-400/40 hover:text-red-400 rounded"
                    title="삭제"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
