'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// framer-motion not needed here — canvas handles its own rendering
import { useDetailPage } from '@/hooks/useDetailPage';
import { useCanvasEditorStore, SECTION_LABEL_MAP } from './state/canvasStore';
import { useImageGeneration } from './hooks/useImageGeneration';
import { useCanvasPipeline } from './hooks/useCanvasPipeline';
import { extractFontName, loadGoogleFont, FONT_OPTIONS } from './utils/fontUtils';
import { CanvasColors, CanvasFonts } from './templates/types';
import CanvasWorkspace from './CanvasWorkspace';
import GenerationProgress from './GenerationProgress';
import TextControls from './toolbar/TextControls';
import TextPresets from './toolbar/TextPresets';
import ImageControls from './toolbar/ImageControls';
import LayerPanel from './panels/LayerPanel';
import { createTextbox, createRect, createCircle, createLine } from './utils/shapeFactory';
import { TemplateSelector } from './panels/TemplateSelector';
import Button from '@/components/ui/Button';
import {
  Download, RefreshCw, ChevronLeft, ChevronRight, Layers, Type, Palette,
  Image as ImageIcon, Plus, Square, Circle, Minus, LayoutTemplate,
} from 'lucide-react';

export default function CanvasEditor() {
  const { state, dispatch } = useDetailPage();
  const store = useCanvasEditorStore();
  const { manuscriptSections, productPhotos, colorPalette, fontRecommendation, productInfo, extractedUSPs, selectedTone } = state;

  const [selectedObj, setSelectedObj] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const canvasRef = useRef<React.MutableRefObject<any>>({ current: null });
  const fabricModuleGetterRef = useRef<(() => any) | null>(null);

  // Sorted visible sections
  const visibleSections = useMemo(() =>
    [...manuscriptSections].sort((a, b) => a.order - b.order).filter(s => s.visible),
    [manuscriptSections]
  );

  // Active section
  const activeSectionId = store.activeSectionId || visibleSections[0]?.id || '';
  const activeSection = visibleSections.find(s => s.id === activeSectionId) || visibleSections[0];
  const activeIdx = visibleSections.findIndex(s => s.id === activeSectionId);

  // Clean stale canvas data on mount — only keep sections that exist in current manuscript
  useEffect(() => {
    const validIds = new Set(visibleSections.map(s => s.id));
    const storedSections = store.sections;
    let hasStale = false;
    for (const id of Object.keys(storedSections)) {
      if (!validIds.has(id)) {
        hasStale = true;
        break;
      }
    }
    if (hasStale) {
      store.reset();
    }
  }, []); // Only on mount

  // Initialize active section
  useEffect(() => {
    if (!store.activeSectionId && visibleSections.length > 0) {
      store.setActiveSectionId(visibleSections[0].id);
    }
  }, [visibleSections]);

  // Fonts
  const [headlineFont, setHeadlineFont] = useState('Noto Sans KR');
  const [bodyFont, setBodyFont] = useState('Noto Sans KR');

  useEffect(() => {
    const hl = fontRecommendation ? extractFontName(fontRecommendation.headline) : 'Noto Sans KR';
    const bd = fontRecommendation ? extractFontName(fontRecommendation.body) : 'Noto Sans KR';
    setHeadlineFont(hl);
    setBodyFont(bd);
    loadGoogleFont(hl);
    if (bd !== hl) loadGoogleFont(bd);
    loadGoogleFont('Noto Sans KR');
  }, [fontRecommendation]);

  // Colors
  const colors: CanvasColors = useMemo(() => ({
    bg: colorPalette?.colors[0]?.hex || '#0f1729',
    bg2: colorPalette?.colors[1]?.hex || '#1a2744',
    text: colorPalette?.colors[2]?.hex || '#f0f0f0',
    accent: colorPalette?.accent?.hex || '#3182F6',
  }), [colorPalette]);

  const fonts: CanvasFonts = useMemo(() => ({
    headline: headlineFont,
    body: bodyFont,
  }), [headlineFont, bodyFont]);

  const productPhotoUrl = productPhotos.length > 0 ? productPhotos[0].dataUrl : null;

  // Image regeneration (per-section "재생성" button only — pipeline does initial gen)
  const { regenerateSection } = useImageGeneration({
    productInfo,
    extractedUSPs,
    selectedTone: selectedTone || 'trust',
    colors: { primary: colors.bg, accent: colors.accent, bg: colors.bg, text: colors.text },
  });

  // Phase 5 파이프라인: 마운트 시 전체 생성+compose 1회만 실행
  const { retry: retryPipeline } = useCanvasPipeline(visibleSections, {
    productInfo,
    extractedUSPs,
    selectedTone: selectedTone || 'trust',
    colors,
    fonts,
    productPhotoUrl,
    category: productInfo.category || undefined,
  });

  // Handle section switch
  const switchSection = useCallback((sectionId: string) => {
    store.setActiveSectionId(sectionId);
    setSelectedObj(null);
  }, []);

  // Handle regenerate — new image URL triggers recompose via CanvasWorkspace effect
  const handleRegenerate = useCallback(async () => {
    if (!activeSection) return;
    await regenerateSection(activeSection);
    // CanvasWorkspace watches store.sections[sectionId].imageUrl and auto-recomposes
  }, [activeSection, regenerateSection]);

  // Navigate to main
  const handleGoMain = useCallback(() => {
    if (window.confirm('메인으로 돌아가시겠습니까? 저장하지 않은 변경사항이 사라질 수 있습니다.')) {
      window.location.href = '/';
    }
  }, []);

  if (visibleSections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <p className="text-[#8B95A1] text-sm">
          편집할 섹션이 없습니다. 원고를 먼저 생성해주세요.
        </p>
        <a
          href="/plan"
          className="px-4 py-2 text-sm text-[#3182F6] border border-[#3182F6]/30 rounded-lg hover:bg-[#3182F6]/10 transition-colors"
        >
          AI 기획으로 돌아가기
        </a>
      </div>
    );
  }

  const isGenerating = store.generating[activeSectionId] || false;
  const hasError = store.generateError[activeSectionId] || false;
  const anyGenerating = store.isAnyGenerating();
  const pipelineStatus = store.status;
  const pipelineProgress = store.progress;
  const pipelineReady = pipelineStatus === 'ready';

  return (
    <div className="flex flex-col bg-[#F4F5F7] fixed inset-0 z-50">
      {/* Phase 5: 파이프라인 진행 중이면 풀스크린 모달 표시 */}
      {!pipelineReady && (
        <GenerationProgress
          status={pipelineStatus}
          progress={pipelineProgress}
          onRetry={pipelineStatus === 'error' ? retryPipeline : undefined}
        />
      )}

      {/* ===== Top Bar ===== */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#E5E8EB] flex-shrink-0">
        {/* Left: Back to Main + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoMain}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F4F5F7] transition-all text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            메인으로
          </button>
          <div className="w-px h-5 bg-[#E5E8EB]" />
          <div>
            <h1 className="text-sm font-bold text-[#191F28]">이미지 에디터</h1>
            <p className="text-[10px] text-[#8B95A1]">
              {anyGenerating ? '이미지 생성 중...' : hasError ? '이미지 생성 실패' : `${visibleSections.length}개 섹션`}
            </p>
          </div>
        </div>

        {/* Center: Section Nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => activeIdx > 0 && switchSection(visibleSections[activeIdx - 1].id)}
            disabled={activeIdx <= 0}
            className="p-1.5 rounded-lg border border-[#E5E8EB] text-[#8B95A1] hover:text-[#191F28] disabled:opacity-20 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#4E5968] min-w-[120px] text-center">
            {activeSection ? `${activeIdx + 1}/${visibleSections.length} ${SECTION_LABEL_MAP[activeSection.sectionType]}` : ''}
          </span>
          <button
            onClick={() => activeIdx < visibleSections.length - 1 && switchSection(visibleSections[activeIdx + 1].id)}
            disabled={activeIdx >= visibleSections.length - 1}
            className="p-1.5 rounded-lg border border-[#E5E8EB] text-[#8B95A1] hover:text-[#191F28] disabled:opacity-20 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center-Right: Add Element */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const canvas = canvasRef.current?.current;
              const fab = fabricModuleGetterRef.current?.();
              if (canvas && fab) createTextbox(fab, canvas);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-[#4E5968] bg-[#F4F5F7] border border-[#E5E8EB] rounded-lg hover:border-[#3182F6]/30 transition-all"
          >
            <Plus className="w-3 h-3" /><Type className="w-3 h-3" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShapeMenuOpen(!shapeMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-[#4E5968] bg-[#F4F5F7] border border-[#E5E8EB] rounded-lg hover:border-[#3182F6]/30 transition-all"
            >
              <Plus className="w-3 h-3" /><Square className="w-3 h-3" />
            </button>
            {shapeMenuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#E5E8EB] rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                {[
                  { label: '사각형', icon: Square, fn: createRect },
                  { label: '원', icon: Circle, fn: createCircle },
                  { label: '직선', icon: Minus, fn: createLine },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => {
                      const canvas = canvasRef.current?.current;
                      const fab = fabricModuleGetterRef.current?.();
                      if (canvas && fab) item.fn(fab, canvas, colors.accent);
                      setShapeMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#4E5968] hover:bg-[#F4F5F7] transition-all"
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Template Toggle */}
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-all ${
            showTemplates
              ? 'text-[#3182F6] bg-[#EBF4FF] border-[#3182F6]/30'
              : 'text-[#4E5968] bg-white border-[#E5E8EB] hover:border-[#3182F6]/30'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          템플릿
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Regenerate image */}
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4E5968] bg-white border border-[#E5E8EB] rounded-lg hover:border-[#3182F6]/30 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? '생성 중...' : hasError ? '재시도' : '이미지 재생성'}
          </button>

          {/* Resolution */}
          <div className="flex items-center gap-0.5 bg-[#F4F5F7] rounded-lg p-0.5 border border-[#E5E8EB]">
            {([1, 2] as const).map(r => (
              <button
                key={r}
                onClick={() => store.setResolution(r)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                  store.resolution === r ? 'bg-[#3182F6] text-white' : 'text-[#8B95A1] hover:text-[#191F28]'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          {/* Exit to next step */}
          <Button size="sm" onClick={() => dispatch({ type: 'NEXT_STEP' })}>
            다음: 내보내기
          </Button>
        </div>
      </div>

      {/* ===== Main Area ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section Sidebar */}
        <div className="w-44 bg-white border-r border-[#E5E8EB] overflow-y-auto flex-shrink-0">
          <div className="p-3">
            <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-2">
              섹션 ({visibleSections.length})
            </div>
            <div className="space-y-1.5">
              {visibleSections.map((section, i) => {
                const sectionState = store.sections[section.id];
                const isActive = section.id === activeSectionId;
                const isGen = store.generating[section.id];

                return (
                  <button
                    key={section.id}
                    onClick={() => switchSection(section.id)}
                    className={`w-full text-left rounded-lg transition-all overflow-hidden ${
                      isActive
                        ? 'ring-1 ring-[#3182F6]/40'
                        : 'hover:ring-1 hover:ring-[#E5E8EB]'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[860/520] bg-[#F4F5F7] relative overflow-hidden">
                      {sectionState?.thumbnail ? (
                        <img
                          src={sectionState.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : isGen ? (
                        <div className="flex items-center justify-center h-full">
                          <RefreshCw className="w-4 h-4 text-[#3182F6]/40 animate-spin" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-[#D1D6DB] text-[8px]">
                          미리보기
                        </div>
                      )}
                      {/* Number badge */}
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center ${
                        isActive ? 'bg-[#3182F6] text-white' : 'bg-[#E5E8EB] text-[#8B95A1]'
                      }`}>
                        {i + 1}
                      </div>
                    </div>
                    {/* Label */}
                    <div className={`px-2 py-1.5 ${isActive ? 'bg-[#EBF4FF]' : 'bg-white'}`}>
                      <div className={`text-[10px] font-medium truncate ${isActive ? 'text-[#3182F6]' : 'text-[#4E5968]'}`}>
                        {SECTION_LABEL_MAP[section.sectionType]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Canvas — 파이프라인 ready 이후에만 마운트 (빈 store 읽는 레이스 방지) */}
        <div className="flex-1 overflow-auto flex items-start justify-center py-8 px-4 bg-[#F4F5F7]">
          {activeSection && pipelineReady && (
            <CanvasWorkspace
              section={activeSection}
              colors={colors}
              fonts={fonts}
              productPhotoUrl={productPhotoUrl}
              onSelectionChange={setSelectedObj}
              onCanvasReady={(ref, getFab) => { canvasRef.current = ref; fabricModuleGetterRef.current = getFab; }}
              category={productInfo.category || undefined}
            />
          )}
        </div>

        {/* Right: Properties Panel */}
        <div className="w-56 bg-white border-l border-[#E5E8EB] overflow-y-auto flex-shrink-0">
          <div className="p-3 space-y-4">
            {/* Color Palette */}
            {colorPalette && (
              <div>
                <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-2 flex items-center gap-1.5">
                  <Palette className="w-3 h-3" />
                  컬러
                </div>
                <div className="flex gap-1.5">
                  {[...colorPalette.colors, colorPalette.accent].map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        style={{ background: c.hex }}
                        className="w-7 h-7 rounded-lg border border-[#E5E8EB]"
                        title={c.label}
                      />
                      <span className="text-[7px] text-[#8B95A1]">{c.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Font Selector */}
            <div>
              <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-2 flex items-center gap-1.5">
                <Type className="w-3 h-3" />
                폰트
              </div>
              <div className="space-y-1.5">
                <div>
                  <label className="text-[8px] text-[#8B95A1] block mb-0.5">제목</label>
                  <select
                    value={headlineFont}
                    onChange={e => { setHeadlineFont(e.target.value); loadGoogleFont(e.target.value); }}
                    className="w-full bg-[#F4F5F7] text-[11px] text-[#4E5968] border border-[#E5E8EB] rounded-lg px-2 py-1.5 outline-none"
                  >
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value} className="bg-white">{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[8px] text-[#8B95A1] block mb-0.5">본문</label>
                  <select
                    value={bodyFont}
                    onChange={e => { setBodyFont(e.target.value); loadGoogleFont(e.target.value); }}
                    className="w-full bg-[#F4F5F7] text-[11px] text-[#4E5968] border border-[#E5E8EB] rounded-lg px-2 py-1.5 outline-none"
                  >
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value} className="bg-white">{f.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Text Controls */}
            {selectedObj && (selectedObj.type === 'i-text' || selectedObj.type === 'textbox') && (
              <TextControls
                fabricCanvas={canvasRef.current}
                selectedObj={selectedObj}
              />
            )}

            {/* Text Presets */}
            {selectedObj && (selectedObj.type === 'i-text' || selectedObj.type === 'textbox') && (
              <TextPresets
                fabricCanvas={canvasRef.current}
                selectedObj={selectedObj}
                accentColor={colors.accent}
              />
            )}

            {/* Image Controls */}
            <ImageControls
              fabricCanvas={canvasRef.current}
              selectedObj={selectedObj}
              sectionId={activeSectionId}
            />

            {/* Layer Panel */}
            <LayerPanel
              fabricCanvas={canvasRef.current}
              ready={!!canvasRef.current?.current}
              onSelectionChange={setSelectedObj}
            />

            {/* Template Selector Panel */}
            {showTemplates && activeSection && (
              <TemplateSelector
                sectionType={activeSection.sectionType}
                category={productInfo.category || ''}
                tone={selectedTone || 'trust'}
                colorPalette={colorPalette}
                selectedId={store.getFigmaTemplateId(activeSectionId)}
                onSelect={(templateId) => {
                  store.setFigmaTemplate(activeSectionId, templateId);
                }}
                onClose={() => setShowTemplates(false)}
              />
            )}

            {/* Selected Object Info */}
            {selectedObj && (
              <div>
                <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-2 flex items-center gap-1.5">
                  <Layers className="w-3 h-3" />
                  선택된 요소
                </div>
                <div className="bg-[#F4F5F7] rounded-lg p-2.5 border border-[#E5E8EB] space-y-2">
                  <div className="text-[10px] text-[#3182F6] font-medium">
                    {selectedObj.name || selectedObj.type || '요소'}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] text-[#8B95A1]">
                    <div>X: {Math.round(selectedObj.left || 0)}</div>
                    <div>Y: {Math.round(selectedObj.top || 0)}</div>
                    <div>W: {Math.round((selectedObj.width || 0) * (selectedObj.scaleX || 1))}</div>
                    <div>H: {Math.round((selectedObj.height || 0) * (selectedObj.scaleY || 1))}</div>
                  </div>
                  {(selectedObj.type === 'i-text' || selectedObj.type === 'textbox') && (
                    <div className="text-[9px] text-[#8B95A1] mt-1">
                      더블클릭으로 텍스트 편집
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Export section */}
            <div>
              <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-2 flex items-center gap-1.5">
                <Download className="w-3 h-3" />
                내보내기
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={async () => {
                    if (!activeSection || !canvasRef.current?.current) return;
                    setDownloading(true);
                    try {
                      await document.fonts.ready;
                      const canvas = canvasRef.current.current;
                      const dataUrl = canvas.toDataURL({
                        format: 'png',
                        multiplier: store.resolution,
                        quality: 1,
                      });
                      const link = document.createElement('a');
                      link.download = `${productInfo.name || 'detail'}_${SECTION_LABEL_MAP[activeSection.sectionType]}.png`;
                      link.href = dataUrl;
                      link.click();
                    } finally {
                      setDownloading(false);
                    }
                  }}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] text-[#3182F6] bg-[#3182F6]/10 border border-[#3182F6]/20 rounded-lg hover:bg-[#3182F6]/20 transition-all disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  현재 섹션 PNG
                </button>
                <button
                  onClick={async () => {
                    if (!canvasRef.current?.current) return;
                    setDownloading(true);
                    setDownloadProgress(0);
                    const canvas = canvasRef.current.current;
                    try {
                      await document.fonts.ready;
                      const images: { dataUrl: string; w: number; h: number }[] = [];

                      for (let i = 0; i < visibleSections.length; i++) {
                        const sec = visibleSections[i];
                        const saved = store.getCanvasState(sec.id);
                        setDownloadProgress(Math.round((i / visibleSections.length) * 85));

                        if (saved?.canvasJSON) {
                          canvas.setDimensions({ width: 860, height: saved.canvasHeight });
                          await canvas.loadFromJSON(saved.canvasJSON);
                          canvas.renderAll();
                          await new Promise(r => setTimeout(r, 200));
                          const dataUrl = canvas.toDataURL({ format: 'png', multiplier: store.resolution, quality: 1 });
                          images.push({ dataUrl, w: 860 * store.resolution, h: saved.canvasHeight * store.resolution });
                        }
                      }

                      if (images.length > 0) {
                        setDownloadProgress(90);
                        const totalH = images.reduce((s, img) => s + img.h, 0);
                        const merged = document.createElement('canvas');
                        merged.width = images[0].w;
                        merged.height = totalH;
                        const ctx = merged.getContext('2d')!;
                        let y = 0;
                        for (const img of images) {
                          const el = new Image();
                          el.src = img.dataUrl;
                          await new Promise(r => { el.onload = r; });
                          ctx.drawImage(el, 0, y);
                          y += img.h;
                        }
                        setDownloadProgress(100);
                        const link = document.createElement('a');
                        link.download = `${productInfo.name || 'detail'}_상세페이지_전체.png`;
                        link.href = merged.toDataURL('image/png');
                        link.click();
                      }

                      // Restore current section (fabric v6)
                      const currentState = store.getCanvasState(activeSectionId);
                      if (currentState?.canvasJSON) {
                        canvas.setDimensions({ width: 860, height: currentState.canvasHeight });
                        await canvas.loadFromJSON(currentState.canvasJSON);
                        canvas.renderAll();
                      }
                    } finally {
                      setDownloading(false);
                      setDownloadProgress(0);
                    }
                  }}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] text-[#4E5968] bg-[#F4F5F7] border border-[#E5E8EB] rounded-lg hover:border-[#3182F6]/30 transition-all disabled:opacity-40"
                >
                  {downloading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {downloadProgress > 0 ? `${downloadProgress}%` : '준비 중...'}
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      전체 1장 PNG
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Image Guide */}
            {activeSection?.imageGuide && (
              <div>
                <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" />
                  이미지 가이드
                </div>
                <p className="text-[10px] text-[#8B95A1] leading-relaxed bg-[#F4F5F7] rounded-lg p-2.5 border border-[#E5E8EB]">
                  {activeSection.imageGuide}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-[#E5E8EB] flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'PREV_STEP' })}>
          이전 (원고 수정)
        </Button>
        <div className="flex items-center gap-2">
          {anyGenerating && (
            <span className="text-[10px] text-[#3182F6] flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              이미지 생성 중...
            </span>
          )}
          <span className="text-[10px] text-[#D1D6DB]">
            {store.resolution}x 해상도 · {SECTION_LABEL_MAP[activeSection?.sectionType || 'features']}
          </span>
        </div>
      </div>
    </div>
  );
}
