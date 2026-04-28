'use client';

import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
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
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.7);
  const [exporting, setExporting] = useState(false);
  const [competitorInsights, setCompetitorInsights] = useState<any>(null);
  const [researchStatus, setResearchStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

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

  // Auto competitor research + AI copy
  useEffect(() => {
    if (!productInfo.name || researchStatus !== 'idle') return;
    setResearchStatus('loading');
    const query = productInfo.name + (productInfo.category ? ` ${productInfo.category}` : '');

    (async () => {
      try {
        const res = await fetch('/api/competitor-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, display: 20 }),
        });
        const data = await res.json();
        if (data.success) {
          setCompetitorInsights(data.data.insights);
          const ins = data.data.insights;
          const ctx = `경쟁 ${ins.totalResults}개. 평균가 ${ins.avgPrice?.toLocaleString()}원. 키워드: ${ins.commonKeywords?.slice(0, 8).join(', ')}.`;
          for (const section of visibleSections) {
            try {
              const r = await fetch('/api/ai-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sectionType: section.sectionType, productName: productInfo.name, category: productInfo.category, usps: extractedUSPs.map(u => u.title), competitorContext: ctx }),
              });
              if (r.ok) {
                const d = await r.json();
                if (d.title || d.body) dispatch({ type: 'UPDATE_MANUSCRIPT_SECTION', payload: { id: section.id, data: { ...(d.title ? { title: d.title } : {}), ...(d.body ? { body: d.body } : {}) } } });
              }
            } catch {}
          }
          setResearchStatus('done');
        } else setResearchStatus('error');
      } catch { setResearchStatus('error'); }
    })();
  }, [productInfo.name]);

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
            <p className="text-[10px] text-[#8B95A1]">{visibleSections.length}개 섹션{researchStatus === 'loading' ? ' · 🔍 분석 중...' : researchStatus === 'done' ? ' · ✅ 분석 완료' : ''}</p>
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
              </Layer>
            </Stage>
          </div>
        </div>

        <div className="w-56 bg-white border-l border-[#E5E8EB] overflow-y-auto flex-shrink-0 p-4">
          <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-3">속성</div>
          {competitorInsights && (
            <div className="bg-[#EBF4FF] rounded-xl p-3 mb-4">
              <div className="text-[11px] font-bold text-[#3182F6]">평균가 {competitorInsights.avgPrice?.toLocaleString()}원</div>
              <div className="flex flex-wrap gap-1 mt-2">{competitorInsights.commonKeywords?.slice(0, 6).map((kw: string, i: number) => <span key={i} className="px-2 py-0.5 text-[9px] bg-white rounded text-[#4E5968]">{kw}</span>)}</div>
            </div>
          )}
          <p className="text-[11px] text-[#8B95A1] text-center py-4">요소를 클릭하여 드래그하세요</p>
          <div className="text-[10px] text-[#8B95A1] mt-2">높이: {totalHeight}px</div>
        </div>
      </div>
    </div>
  );
}
