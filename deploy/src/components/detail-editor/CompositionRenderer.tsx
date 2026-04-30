'use client';

import { useState, useRef, useCallback } from 'react';

// Import types (will be at @/lib/composition-types)
interface CompositionElement {
  id: string;
  type: 'rect' | 'circle' | 'text' | 'image' | 'line' | 'badge';
  x: number; y: number; width: number; height: number;
  fill?: string; opacity?: number; cornerRadius?: number; rotation?: number;
  text?: string; fontSize?: number; fontWeight?: number; fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right'; lineHeight?: number; color?: string;
  src?: string; objectFit?: 'cover' | 'contain';
  stroke?: string; strokeWidth?: number; shadow?: boolean;
  gradient?: { from: string; to: string; direction?: string };
  draggable?: boolean; editable?: boolean; locked?: boolean; name?: string;
}

interface SectionComposition {
  sectionType: string; variantId: string; width: number; height: number;
  background: string; elements: CompositionElement[];
}

interface CompositionRendererProps {
  composition: SectionComposition;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CompositionElement>) => void;
  onDoubleClickText?: (id: string) => void;
}

export default function CompositionRenderer({
  composition, selectedElementId, onSelectElement, onUpdateElement, onDoubleClickText,
}: CompositionRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, el: CompositionElement) => {
    if (el.locked || !el.draggable) return;
    e.stopPropagation();
    onSelectElement(el.id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragState({ id: el.id, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y });
  }, [onSelectElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    onUpdateElement(dragState.id, { x: dragState.elX + dx, y: dragState.elY + dy });
  }, [dragState, onUpdateElement]);

  const handleMouseUp = useCallback(() => { setDragState(null); }, []);

  const renderElement = (el: CompositionElement) => {
    const isSelected = el.id === selectedElementId;
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: el.x, top: el.y,
      width: el.width, height: el.height,
      opacity: el.opacity ?? 1,
      borderRadius: el.type === 'circle' ? '50%' : (el.cornerRadius || 0),
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      cursor: el.draggable ? 'move' : (el.locked ? 'default' : 'pointer'),
      outline: isSelected ? '2px solid #3182F6' : 'none',
      outlineOffset: isSelected ? 2 : 0,
      userSelect: 'none',
      transition: dragState?.id === el.id ? 'none' : 'outline 0.1s',
    };

    // Background/fill
    if (el.gradient) {
      baseStyle.background = `linear-gradient(${el.gradient.direction || 'to bottom'}, ${el.gradient.from}, ${el.gradient.to})`;
    } else if (el.fill) {
      baseStyle.background = el.fill;
    }

    // Border
    if (el.stroke) {
      baseStyle.border = `${el.strokeWidth || 1}px solid ${el.stroke}`;
    }

    // Shadow
    if (el.shadow) {
      baseStyle.boxShadow = '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)';
    }

    // Render by type
    switch (el.type) {
      case 'text':
        return (
          <div
            key={el.id}
            style={{
              ...baseStyle,
              fontSize: el.fontSize || 14,
              fontWeight: el.fontWeight || 400,
              fontFamily: el.fontFamily || "'Noto Sans KR', sans-serif",
              color: el.color || el.fill || '#000',
              background: 'none',
              textAlign: el.textAlign || 'left',
              lineHeight: el.lineHeight || 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
            onMouseDown={e => handleMouseDown(e, el)}
            onDoubleClick={() => onDoubleClickText?.(el.id)}
          >
            {el.text || '텍스트'}
          </div>
        );

      case 'image':
        return (
          <div
            key={el.id}
            style={baseStyle}
            onMouseDown={e => handleMouseDown(e, el)}
          >
            {el.src ? (
              <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: el.objectFit || 'contain', borderRadius: 'inherit' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 'inherit', background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>이미지</span>
              </div>
            )}
          </div>
        );

      case 'line':
        return (
          <div key={el.id} style={{ ...baseStyle, height: el.height || 2 }} onMouseDown={e => handleMouseDown(e, el)} />
        );

      case 'badge':
        return (
          <div key={el.id} style={{ ...baseStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={e => handleMouseDown(e, el)}>
            {el.text && <span style={{ fontSize: el.fontSize || 14, fontWeight: 700, color: el.color || '#fff' }}>{el.text}</span>}
          </div>
        );

      default: // rect, circle
        return (
          <div key={el.id} style={baseStyle} onMouseDown={e => handleMouseDown(e, el)} />
        );
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: composition.width,
        height: composition.height,
        background: composition.background,
        overflow: 'hidden',
      }}
      onClick={e => { if (e.target === e.currentTarget) onSelectElement(null); }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {composition.elements.map(el => renderElement(el))}

      {/* Resize handles for selected element */}
      {selectedElementId && (() => {
        const el = composition.elements.find(e => e.id === selectedElementId);
        if (!el || el.locked) return null;
        const handles = [
          { cursor: 'nw-resize', x: el.x - 4, y: el.y - 4 },
          { cursor: 'ne-resize', x: el.x + el.width - 4, y: el.y - 4 },
          { cursor: 'sw-resize', x: el.x - 4, y: el.y + el.height - 4 },
          { cursor: 'se-resize', x: el.x + el.width - 4, y: el.y + el.height - 4 },
        ];
        return handles.map((h, i) => (
          <div key={`handle-${i}`} style={{
            position: 'absolute', left: h.x, top: h.y,
            width: 8, height: 8, background: '#3182F6', borderRadius: 2,
            cursor: h.cursor, zIndex: 999,
          }} />
        ));
      })()}
    </div>
  );
}
