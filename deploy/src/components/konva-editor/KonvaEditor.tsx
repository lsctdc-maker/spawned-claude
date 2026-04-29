'use client';

import { useMemo, useRef, useCallback, useState } from 'react';
import { Stage, Layer, Transformer } from 'react-konva';
import { useDetailPage } from '@/hooks/useDetailPage';
import { ManuscriptSection } from '@/lib/types';
import { ChevronLeft, Download, ZoomIn, ZoomOut } from 'lucide-react';
import SectionList from '../page-editor/SectionList';
import {
  HeroSection, ProblemSection, FeaturesSection, SolutionSection,
  SpecsSection, CTASection, GenericSection, getSectionHeight,
} from './KonvaSections';

const W = 860;

export default function KonvaEditor() {
  const { state, dispatch } = useDetailPage();
  const { manuscriptSections, productPhotos, colorPalette, productInfo, extractedUSPs } = state;
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const selectedShapeRef = useRef<any>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.7);
  const [exporting, setExporting] = useState(false);
  const [selectedNodeAttrs, setSelectedNodeAttrs] = useState<any>(null);
  const [, forceUpdate] = useState(0);

  const colors = useMemo(() => ({
    primary: colorPalette?.colors[0]?.hex || '#1a1a2e',
    secondary: colorPalette?.colors[1]?.hex || '#16213e',
    text: colorPalette?.colors[2]?.hex || '#e0e0e0',
    accent: colorPalette?.accent?.hex || '#e94560',
  }), [colorPalette]);

  const visibleSections = useMemo(() =>
    [...manuscriptSections].sort((a, b) => a.order - b.order).filter(s => s.visible),
    [manuscriptSections]
  );

  const allSections = useMemo(() =>
    [...manuscriptSections].sort((a, b) => a.order - b.order),
    [manuscriptSections]
  );

  const sectionPositions = useMemo(() => {
    let y = 0;
    return visibleSections.map(s => {
      const pos = { id: s.id, y, height: getSectionHeight(s.sectionType) };
      y += pos.height;
      return pos;
    });
  }, [visibleSections]);

  const totalHeight = sectionPositions.length > 0
    ? sectionPositions[sectionPositions.length - 1].y + sectionPositions[sectionPositions.length - 1].height
    : 600;

  const handleAddSection = useCallback((type: any) => {
    dispatch({ type: 'ADD_MANUSCRIPT_SECTION', payload: { id: `ms-${type}-${Date.now()}`, sectionType: type, title: '', body: '', imageGuide: '', visible: true, order: manuscriptSections.length } });
  }, [dispatch, manuscriptSections.length]);

  const handleDeleteSection = useCallback((id: string) => { dispatch({ type: 'REMOVE_MANUSCRIPT_SECTION', payload: id }); }, [dispatch]);
  const handleReorder = useCallback((r: ManuscriptSection[]) => { dispatch({ type: 'REORDER_MANUSCRIPT', payload: r }); }, [dispatch]);
  const handleToggleVisibility = useCallback((id: string) => { dispatch({ type: 'TOGGLE_MANUSCRIPT_VISIBILITY', payload: id }); }, [dispatch]);

  const handleExport = useCallback(() => {
    if (!stageRef.current) return;
    setExporting(true);
    try {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${productInfo.name || 'detail'}_상세페이지.png`;
      link.href = uri;
      link.click();
    } catch (e) { console.error('Export failed:', e); }
    setExporting(false);
  }, [productInfo.name]);

  const productPhotoUrl = productPhotos.length > 0 ? productPhotos[0].dataUrl : null;

  const renderSection = useCallback((section: ManuscriptSection, y: number) => {
    const p = { y, title: section.title, body: section.body, colors, sectionId: section.id, onSelect: setSelectedSectionId, productImageUrl: productPhotoUrl };
    switch (section.sectionType) {
      case 'hooking': case 'hero': return <HeroSection key={section.id} {...p} />;
      case 'problem': return <ProblemSection key={section.id} {...p} />;
      case 'features': return <FeaturesSection key={section.id} {...p} />;
      case 'solution': return <SolutionSection key={section.id} {...p} />;
      case 'specs': return <SpecsSection key={section.id} {...p} />;
      case 'cta': return <CTASection key={section.id} {...p} />;
      default: return <GenericSection key={section.id} {...p} />;
    }
  }, [colors]);

  if (visibleSections.length === 0) {
    return <div className="flex flex-col items-center justify-center h-screen bg-white gap-4"><p className="text-[#8B95A1] text-sm">편집할 섹션이 없습니다.</p></div>;
  }

  return (
    <div className="flex flex-col bg-[#E5E8EB] fixed inset-0 z-50">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#E5E8EB] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => { if (window.confirm('메인으로?')) window.location.href = '/'; }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F4F5F7] text-xs"><ChevronLeft className="w-4 h-4" /> 메인</button>
          <div className="w-px h-5 bg-[#E5E8EB]" />
          <div>
            <h1 className="text-sm font-bold text-[#191F28]">상세페이지 에디터</h1>
            <p className="text-[10px] text-[#8B95A1]">{visibleSections.length}개 섹션</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 rounded border border-[#E5E8EB] text-[#8B95A1]"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-[11px] text-[#8B95A1] w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1.5 rounded border border-[#E5E8EB] text-[#8B95A1]"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3182F6] text-white rounded-lg text-xs font-semibold disabled:opacity-50"><Download className="w-3.5 h-3.5" /> PNG</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SectionList sections={visibleSections} allSections={allSections} selectedId={selectedSectionId} onSelect={setSelectedSectionId} onAdd={handleAddSection} onDelete={handleDeleteSection} onReorder={handleReorder} onToggleVisibility={handleToggleVisibility} />

        <div className="flex-1 overflow-auto flex justify-center py-8 bg-[#E5E8EB]">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            <Stage
              ref={stageRef}
              width={W}
              height={totalHeight}
              onClick={(e: any) => {
                const target = e.target;
                // Clicking empty area or background rect → deselect
                if (target === e.target.getStage() || !target.draggable()) {
                  transformerRef.current?.nodes([]);
                  selectedShapeRef.current = null;
                  forceUpdate(n => n + 1);
                  return;
                }
                // Select the clicked element
                selectedShapeRef.current = target;
                transformerRef.current?.nodes([target]);
                transformerRef.current?.getLayer()?.batchDraw();
                forceUpdate(n => n + 1);
              }}
              onDblClick={(e: any) => {
                // 더블클릭 텍스트 편집
                const target = e.target;
                if (target.className !== 'Text') return;
                const textNode = target;
                const stageBox = stageRef.current.container().getBoundingClientRect();
                const textPos = textNode.absolutePosition();

                const textarea = document.createElement('textarea');
                textarea.value = textNode.text();
                textarea.style.position = 'absolute';
                textarea.style.left = `${stageBox.left + textPos.x * zoom}px`;
                textarea.style.top = `${stageBox.top + textPos.y * zoom}px`;
                textarea.style.width = `${textNode.width() * zoom}px`;
                textarea.style.minHeight = `${textNode.height() * zoom}px`;
                textarea.style.fontSize = `${textNode.fontSize() * zoom}px`;
                textarea.style.fontFamily = textNode.fontFamily();
                textarea.style.color = textNode.fill();
                textarea.style.background = 'rgba(255,255,255,0.95)';
                textarea.style.border = '2px solid #3182F6';
                textarea.style.borderRadius = '8px';
                textarea.style.padding = '8px';
                textarea.style.zIndex = '9999';
                textarea.style.resize = 'none';
                textarea.style.outline = 'none';
                textarea.style.lineHeight = String(textNode.lineHeight());
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();

                const removeTextarea = () => {
                  textNode.text(textarea.value);
                  document.body.removeChild(textarea);
                };
                textarea.addEventListener('blur', removeTextarea);
                textarea.addEventListener('keydown', (ev) => {
                  if (ev.key === 'Escape') { removeTextarea(); }
                });
              }}
            >
              <Layer>
                {sectionPositions.map((pos, i) => renderSection(visibleSections[i], pos.y))}
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox: any, newBox: any) => {
                    // Minimum size
                    if (newBox.width < 20 || newBox.height < 20) return oldBox;
                    return newBox;
                  }}
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
                />
              </Layer>
            </Stage>
          </div>
        </div>

        <div className="w-56 bg-white border-l border-[#E5E8EB] overflow-y-auto flex-shrink-0 p-4 space-y-4">
          <div className="text-[9px] uppercase tracking-widest text-[#8B95A1]">속성</div>

          {selectedShapeRef.current ? (
            <>
              <div className="text-[11px] font-bold text-[#191F28] mb-2">
                {selectedShapeRef.current.className === 'Text' ? '텍스트' : '도형'}
              </div>

              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-[#8B95A1]">X</label>
                  <input type="number" value={Math.round(selectedShapeRef.current.x())}
                    onChange={e => { selectedShapeRef.current.x(+e.target.value); selectedShapeRef.current.getLayer().batchDraw(); forceUpdate(n => n + 1); }}
                    className="w-full px-2 py-1 text-xs border rounded" />
                </div>
                <div>
                  <label className="text-[9px] text-[#8B95A1]">Y</label>
                  <input type="number" value={Math.round(selectedShapeRef.current.y())}
                    onChange={e => { selectedShapeRef.current.y(+e.target.value); selectedShapeRef.current.getLayer().batchDraw(); forceUpdate(n => n + 1); }}
                    className="w-full px-2 py-1 text-xs border rounded" />
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-[#8B95A1]">너비</label>
                  <input type="number" value={Math.round(selectedShapeRef.current.width())}
                    onChange={e => { selectedShapeRef.current.width(+e.target.value); selectedShapeRef.current.getLayer().batchDraw(); forceUpdate(n => n + 1); }}
                    className="w-full px-2 py-1 text-xs border rounded" />
                </div>
                <div>
                  <label className="text-[9px] text-[#8B95A1]">높이</label>
                  <input type="number" value={Math.round(selectedShapeRef.current.height?.() || 0)}
                    onChange={e => { if (selectedShapeRef.current.height) { selectedShapeRef.current.height(+e.target.value); selectedShapeRef.current.getLayer().batchDraw(); forceUpdate(n => n + 1); } }}
                    className="w-full px-2 py-1 text-xs border rounded" />
                </div>
              </div>

              {/* Text-specific */}
              {selectedShapeRef.current.className === 'Text' && (
                <>
                  <div>
                    <label className="text-[9px] text-[#8B95A1]">글자 크기</label>
                    <input type="range" min="10" max="72" value={selectedShapeRef.current.fontSize()}
                      onChange={e => { selectedShapeRef.current.fontSize(+e.target.value); selectedShapeRef.current.getLayer().batchDraw(); forceUpdate(n => n + 1); }}
                      className="w-full" />
                    <span className="text-[10px] text-[#8B95A1]">{selectedShapeRef.current.fontSize()}px</span>
                  </div>
                  <div>
                    <label className="text-[9px] text-[#8B95A1]">색상</label>
                    <input type="color" value={selectedShapeRef.current.fill() || '#000000'}
                      onChange={e => { selectedShapeRef.current.fill(e.target.value); selectedShapeRef.current.getLayer().batchDraw(); forceUpdate(n => n + 1); }}
                      className="w-full h-8 rounded" />
                  </div>
                </>
              )}

              {/* Fill for shapes */}
              {selectedShapeRef.current.className !== 'Text' && selectedShapeRef.current.fill && (
                <div>
                  <label className="text-[9px] text-[#8B95A1]">배경색</label>
                  <input type="color" value={selectedShapeRef.current.fill() || '#000000'}
                    onChange={e => { selectedShapeRef.current.fill(e.target.value); selectedShapeRef.current.getLayer().batchDraw(); forceUpdate(n => n + 1); }}
                    className="w-full h-8 rounded" />
                </div>
              )}
            </>
          ) : (
            <p className="text-[11px] text-[#8B95A1] text-center py-8">요소를 클릭하여<br/>선택하세요</p>
          )}

          <div className="border-t pt-3 text-[10px] text-[#8B95A1]">
            총 높이: {totalHeight}px
          </div>
          <button onClick={handleExport} disabled={exporting} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#3182F6] text-white rounded-lg text-xs font-semibold disabled:opacity-50">
            <Download className="w-3.5 h-3.5" /> PNG 내보내기
          </button>
        </div>
      </div>
    </div>
  );
}
