'use client';

import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { useDetailPage } from '@/hooks/useDetailPage';
import HeroSection from './sections/HeroSection';
import FeatureGrid from './sections/FeatureGrid';
import ProblemSection from './sections/ProblemSection';
import SolutionSection from './sections/SolutionSection';
import SpecsSection from './sections/SpecsSection';
import CTASection from './sections/CTASection';
import HowToSection from './sections/HowToSection';
import ReviewSection from './sections/ReviewSection';
import TrustSection from './sections/TrustSection';
import GuaranteeSection from './sections/GuaranteeSection';
import DetailSection from './sections/DetailSection';
import RecommendSection from './sections/RecommendSection';
import FAQSection from './sections/FAQSection';
import IngredientsSection from './sections/IngredientsSection';
import ComparisonSection from './sections/ComparisonSection';
import { ManuscriptSection } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';
import SectionList from './SectionList';
import PropertiesPanel from './PropertiesPanel';

/**
 * Phase 7: HTML 기반 상세페이지 에디터 (Hookable.ai 스타일)
 *
 * 모든 섹션이 React 컴포넌트로 렌더링됨:
 * - 한국어 네이티브 폰트 (Pretendard/Noto Sans KR)
 * - CSS 레이아웃 (flexbox/grid)
 * - 실제 제품 사진 사용
 * - 각 요소 클릭하여 편집
 * - html-to-image로 PNG 내보내기
 */

export default function PageEditor() {
  const { state, dispatch } = useDetailPage();
  const { manuscriptSections, productPhotos, colorPalette, productInfo, extractedUSPs } = state;
  const pageRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [exporting, setExporting] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [sectionImages, setSectionImages] = useState<Record<string, string>>({});
  const [sectionBgColors, setSectionBgColors] = useState<Record<string, string>>({});
  const [sectionIcons, setSectionIcons] = useState<Record<string, string[]>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [competitorInsights, setCompetitorInsights] = useState<any>(null);
  const [researchStatus, setResearchStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  // 색상 팔레트
  const colors = useMemo(() => ({
    primary: colorPalette?.colors[0]?.hex || '#1a1a2e',
    secondary: colorPalette?.colors[1]?.hex || '#16213e',
    text: colorPalette?.colors[2]?.hex || '#e0e0e0',
    accent: colorPalette?.accent?.hex || '#e94560',
  }), [colorPalette]);

  // 정렬된 섹션
  const visibleSections = useMemo(() =>
    [...manuscriptSections].sort((a, b) => a.order - b.order).filter(s => s.visible),
    [manuscriptSections]
  );

  // 제품 사진 URL
  const productPhotoUrl = productPhotos.length > 0 ? productPhotos[0].dataUrl : null;

  // 자동 경쟁사 리서치 → AI 원고 개선 파이프라인
  useEffect(() => {
    if (!productInfo.name || researchStatus !== 'idle') return;
    const query = productInfo.name + (productInfo.category ? ` ${productInfo.category}` : '');
    setResearchStatus('loading');

    (async () => {
      try {
        // Step 1: 네이버 경쟁사 검색
        const res = await fetch('/api/competitor-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, display: 20 }),
        });
        const data = await res.json();
        if (!data.success) { setResearchStatus('error'); return; }

        setCompetitorInsights(data.data.insights);

        // Step 2: 경쟁사 데이터 기반으로 AI가 각 섹션 원고 개선
        const insights = data.data.insights;
        const usps = extractedUSPs.map(u => u.title).join(', ');
        const competitorContext = `
경쟁사 분석 결과:
- 경쟁 상품 수: ${insights.totalResults}개
- 평균가: ${insights.avgPrice?.toLocaleString()}원 (${insights.priceRange?.min?.toLocaleString()}~${insights.priceRange?.max?.toLocaleString()}원)
- 인기 키워드: ${insights.commonKeywords?.slice(0, 10).join(', ')}
- 상위 브랜드: ${insights.topBrands?.slice(0, 5).join(', ')}
- 카테고리: ${insights.categoryPath}
`.trim();

        // 각 섹션별 AI 원고 생성 (원고가 비어있는 섹션만)
        for (const section of visibleSections) {
          if (section.title && section.body) continue; // 이미 원고 있으면 스킵

          try {
            const copyRes = await fetch('/api/ai-copy', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sectionType: section.sectionType,
                productName: productInfo.name,
                category: productInfo.category,
                usps: extractedUSPs.map(u => u.title),
                competitorContext,
              }),
            });
            if (copyRes.ok) {
              const copyData = await copyRes.json();
              if (copyData.title || copyData.body) {
                dispatch({
                  type: 'UPDATE_MANUSCRIPT_SECTION',
                  payload: {
                    id: section.id,
                    data: {
                      ...(copyData.title ? { title: copyData.title } : {}),
                      ...(copyData.body ? { body: copyData.body } : {}),
                    },
                  },
                });
              }
            }
          } catch (e) {
            console.warn(`AI copy failed for ${section.sectionType}:`, e);
          }
        }

        setResearchStatus('done');
      } catch (e) {
        console.error('Research pipeline error:', e);
        setResearchStatus('error');
      }
    })();
  }, [productInfo.name, productInfo.category]);

  // 선택된 섹션
  const selectedSection = useMemo(() =>
    visibleSections.find(s => s.id === selectedSectionId) || null,
    [visibleSections, selectedSectionId]
  );

  // 섹션 선택 + 스크롤
  const handleSelectSection = useCallback((id: string) => {
    setSelectedSectionId(id);
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // 섹션 데이터 업데이트
  const handleUpdateSection = useCallback((id: string, data: Partial<ManuscriptSection>) => {
    dispatch({ type: 'UPDATE_MANUSCRIPT_SECTION', payload: { id, data } });
  }, [dispatch]);

  // 섹션 추가
  const handleAddSection = useCallback((type: any) => {
    const newSection: ManuscriptSection = {
      id: `ms-${type}-${Date.now()}`,
      sectionType: type,
      title: '',
      body: '',
      imageGuide: '',
      visible: true,
      order: manuscriptSections.length,
    };
    dispatch({ type: 'ADD_MANUSCRIPT_SECTION', payload: newSection });
  }, [dispatch, manuscriptSections.length]);

  // 섹션 삭제
  const handleDeleteSection = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_MANUSCRIPT_SECTION', payload: id });
    if (selectedSectionId === id) setSelectedSectionId(null);
  }, [dispatch, selectedSectionId]);

  // 섹션 순서 변경
  const handleReorder = useCallback((reordered: ManuscriptSection[]) => {
    dispatch({ type: 'REORDER_MANUSCRIPT', payload: reordered });
  }, [dispatch]);

  // 섹션 표시/숨김
  const handleToggleVisibility = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_MANUSCRIPT_VISIBILITY', payload: id });
  }, [dispatch]);

  // 전체 섹션 (visible + hidden, 순서 유지)
  const allSections = useMemo(() =>
    [...manuscriptSections].sort((a, b) => a.order - b.order),
    [manuscriptSections]
  );

  // 본문에서 bullet 포인트 추출
  const extractBulletPoints = useCallback((body: string, maxItems = 4): string[] => {
    if (!body) return ['내용을 입력하세요'];
    const lines = body.split(/\n|·|•|‣|▸|▹|[-–—]/).map(l => l.trim()).filter(l => l.length > 5);
    return lines.slice(0, maxItems);
  }, []);

  // 본문에서 스펙 추출 (키:값 형태)
  const extractSpecs = useCallback((body: string): { label: string; value: string }[] => {
    if (!body) return [
      { label: '용량', value: '-' }, { label: '성분', value: '-' },
      { label: '원산지', value: '-' }, { label: '유통기한', value: '-' },
    ];
    const lines = body.split('\n').map(l => l.trim()).filter(Boolean);
    const specs: { label: string; value: string }[] = [];
    for (const line of lines) {
      const match = line.match(/^(.+?)[:\s·]+(.+)$/);
      if (match) specs.push({ label: match[1].trim(), value: match[2].trim() });
      else if (line.length > 3) specs.push({ label: line, value: '-' });
      if (specs.length >= 8) break;
    }
    return specs.length > 0 ? specs : [{ label: '상세', value: body.slice(0, 100) }];
  }, []);

  // USP에서 feature items 생성
  const featureItems = useMemo(() => {
    const icons = ['heart', 'shield', 'zap', 'star', 'leaf', 'plus', 'activity', 'brain'];
    if (extractedUSPs.length >= 3) {
      return extractedUSPs.slice(0, 4).map((usp, i) => ({
        icon: icons[i % icons.length],
        title: usp.title,
        description: usp.description,
      }));
    }
    // 원고 features 섹션에서 추출
    const featSection = visibleSections.find(s => s.sectionType === 'features');
    if (featSection?.body) {
      return extractBulletPoints(featSection.body, 4).map((text, i) => ({
        icon: icons[i % icons.length],
        title: text.slice(0, 20),
        description: text,
      }));
    }
    return [
      { icon: 'heart', title: '핵심 특장점 1', description: '특장점을 입력하세요' },
      { icon: 'shield', title: '핵심 특장점 2', description: '특장점을 입력하세요' },
      { icon: 'zap', title: '핵심 특장점 3', description: '특장점을 입력하세요' },
      { icon: 'star', title: '핵심 특장점 4', description: '특장점을 입력하세요' },
    ];
  }, [extractedUSPs, visibleSections, extractBulletPoints]);

  // 섹션 렌더링
  const renderSection = useCallback((section: ManuscriptSection) => {
    const baseProps = {
      accentColor: colors.accent,
      productImageUrl: productPhotoUrl,
    };

    switch (section.sectionType) {
      case 'hooking':
      case 'hero':
        return (
          <HeroSection
            key={section.id}
            title={section.title || productInfo.name || '제품명을 입력하세요'}
            subtitle={section.body?.slice(0, 150) || '제품 설명을 입력하세요'}
            badge={productInfo.category ? `${productInfo.category.toUpperCase()} · PREMIUM` : undefined}
            bgColor={colors.primary}
            {...baseProps}
          />
        );

      case 'features':
        return (
          <FeatureGrid
            key={section.id}
            sectionTitle={section.title || '핵심 특장점'}
            items={featureItems}
            bgColor={colors.primary}
            {...baseProps}
          />
        );

      case 'problem':
        return (
          <ProblemSection
            key={section.id}
            title={section.title || '이런 고민, 공감되시나요?'}
            painPoints={extractBulletPoints(section.body, 4).map((text, i) => ({
              icon: ['frown', 'alert', 'help', 'x'][i % 4],
              text,
            }))}
            {...baseProps}
          />
        );

      case 'solution':
        return (
          <SolutionSection
            key={section.id}
            title={section.title || '해결책을 찾았습니다'}
            description={section.body?.slice(0, 200) || '제품이 어떻게 문제를 해결하는지 설명하세요'}
            checkpoints={extractBulletPoints(section.body, 3).map(t => t.slice(0, 30))}
            bgColor={colors.primary}
            {...baseProps}
          />
        );

      case 'specs':
        return (
          <SpecsSection
            key={section.id}
            title={section.title || '제품 상세 스펙'}
            specs={extractSpecs(section.body)}
            {...baseProps}
          />
        );

      case 'cta':
        return (
          <CTASection
            key={section.id}
            title={section.title || '지금 시작하세요'}
            subtitle={section.body?.slice(0, 120) || '특별한 혜택을 놓치지 마세요'}
            buttonText="지금 구매하기"
            bgColor={colors.primary}
            {...baseProps}
          />
        );

      case 'howto':
        return (
          <HowToSection
            key={section.id}
            title={section.title || '이렇게 사용하세요'}
            steps={extractBulletPoints(section.body, 4).map(text => ({ text }))}
            bgColor={colors.primary}
            {...baseProps}
          />
        );

      case 'social_proof':
        return (
          <ReviewSection
            key={section.id}
            title={section.title || '실사용 후기'}
            reviews={extractBulletPoints(section.body, 3).map((text, i) => ({
              text: text.slice(0, 80),
              author: `${['김', '이', '박', '최'][i % 4]}**님`,
              rating: 5,
            }))}
            bgColor={colors.primary}
            {...baseProps}
          />
        );

      case 'trust':
        return (
          <TrustSection
            key={section.id}
            title={section.title || '인증 및 수상'}
            badges={extractBulletPoints(section.body, 5).map(t => t.slice(0, 15))}
            {...baseProps}
          />
        );

      case 'guarantee':
        return (
          <GuaranteeSection
            key={section.id}
            title={section.title || '안심 보증'}
            description={section.body?.slice(0, 150) || '걱정 없이 시작하세요'}
            promises={['100% 환불 보증', '무료 교환', '24시간 고객지원']}
            bgColor={colors.primary}
            {...baseProps}
          />
        );

      case 'detail':
        return (
          <DetailSection
            key={section.id}
            title={section.title || '상세 정보'}
            description={section.body?.slice(0, 200) || '제품의 핵심 가치'}
            stats={[
              { value: '98%', label: '고객 만족도' },
              { value: '4.8', label: '평균 평점' },
              { value: '10만+', label: '누적 판매' },
            ]}
            {...baseProps}
          />
        );

      case 'event_banner':
        return (
          <div key={section.id} className="w-[860px] py-16 px-16 text-center"
            style={{ background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)` }}>
            <div className="text-[14px] font-bold tracking-widest text-white/70 mb-4">SPECIAL OFFER</div>
            <h2 className="text-[40px] font-black text-white mb-4">
              {section.title || '특별 할인 진행 중'}
            </h2>
            <p className="text-[16px] text-white/80 mb-8 max-w-[500px] mx-auto">
              {section.body?.slice(0, 100) || '지금 바로 확인하세요'}
            </p>
            <div className="inline-block px-8 py-3.5 bg-white rounded-full text-[16px] font-bold"
              style={{ color: colors.accent }}>
              자세히 보기
            </div>
          </div>
        );

      // 범용 섹션 — 중앙 정렬
      default:
        return (
          <div
            key={section.id}
            className="w-[860px] py-20 px-16 text-center"
            style={{ backgroundColor: section.order % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }}
          >
            <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: colors.accent }} />
            <h2 className="text-[32px] font-black tracking-tight text-[#191F28] mb-6 max-w-[640px] mx-auto">
              {section.title || '섹션 제목'}
            </h2>
            <p className="text-[15px] leading-[1.9] text-[#4E5968] whitespace-pre-line max-w-[600px] mx-auto">
              {section.body || '섹션 내용을 입력하세요'}
            </p>
          </div>
        );
    }
  }, [colors, productPhotoUrl, productInfo, featureItems, extractBulletPoints, extractSpecs]);

  // PNG 내보내기
  const handleExport = useCallback(async () => {
    if (!pageRef.current) return;
    setExporting(true);
    // exportProgress(10);

    try {
      const { toPng } = await import('html-to-image');
      // exportProgress(30);

      const dataUrl = await toPng(pageRef.current, {
        width: 860,
        pixelRatio: 2,
        quality: 1,
        backgroundColor: '#FFFFFF',
      });

      // exportProgress(90);

      const link = document.createElement('a');
      link.download = `${productInfo.name || 'detail'}_상세페이지.png`;
      link.href = dataUrl;
      link.click();

      // exportProgress(100);
    } catch (e) {
      console.error('Export failed:', e);
      alert('내보내기 실패. 다시 시도해주세요.');
    } finally {
      setExporting(false);
      // exportProgress(0);
    }
  }, [productInfo.name]);

  if (visibleSections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <p className="text-[#8B95A1] text-sm">편집할 섹션이 없습니다.</p>
        <a href="/plan" className="text-[#3182F6] text-sm border border-[#3182F6]/30 px-4 py-2 rounded-lg">
          AI 기획으로 돌아가기
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#E5E8EB] fixed inset-0 z-50">
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#E5E8EB] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('메인으로 돌아가시겠습니까?')) window.location.href = '/';
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F4F5F7] transition-all text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            메인
          </button>
          <div className="w-px h-5 bg-[#E5E8EB]" />
          <div>
            <h1 className="text-sm font-bold text-[#191F28]">상세페이지 에디터</h1>
            <p className="text-[10px] text-[#8B95A1]">
              {visibleSections.length}개 섹션
              {researchStatus === 'loading' && ' · 🔍 경쟁사 분석 중...'}
              {researchStatus === 'done' && competitorInsights && ` · ✅ ${competitorInsights.totalResults.toLocaleString()}개 경쟁상품 분석 완료`}
            </p>
          </div>
        </div>
      </div>

      {/* 3-column 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: 섹션 목록 */}
        <SectionList
          sections={visibleSections}
          allSections={allSections}
          selectedId={selectedSectionId}
          onSelect={handleSelectSection}
          onAdd={handleAddSection}
          onDelete={handleDeleteSection}
          onReorder={handleReorder}
          onToggleVisibility={handleToggleVisibility}
        />

        {/* 중앙: 페이지 프리뷰 */}
        <div className="flex-1 overflow-auto flex flex-col items-center py-8 bg-[#E5E8EB] relative">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <div
              ref={pageRef}
              className="bg-white shadow-2xl rounded-lg overflow-hidden"
              style={{ width: 860 }}
            >
              {visibleSections.map((section) => (
                <div
                  key={section.id}
                  ref={el => { sectionRefs.current[section.id] = el; }}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`cursor-pointer transition-all ${
                    section.id === selectedSectionId
                      ? 'ring-2 ring-[#3182F6]/50 ring-inset'
                      : 'hover:ring-1 hover:ring-[#3182F6]/20 hover:ring-inset'
                  }`}
                >
                  {renderSection(section)}
                </div>
              ))}
            </div>
          </div>

          {/* 하단 고정 줌 바 */}
          <div className="sticky bottom-4 mt-4 flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-[#E5E8EB]">
            {[50, 75, 100, 125, 150].map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  zoom === z ? 'bg-[#3182F6] text-white' : 'text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F4F5F7]'
                }`}
              >
                {z}%
              </button>
            ))}
            <div className="w-px h-4 bg-[#E5E8EB]" />
            <span className="text-[10px] text-[#8B95A1]">
              높이: {pageRef.current?.scrollHeight || 0}px
            </span>
          </div>
        </div>

        {/* 우측: 속성 패널 */}
        <PropertiesPanel
          selectedSection={selectedSection}
          colors={colors}
          onUpdateSection={handleUpdateSection}
          onExportPng={handleExport}
          exporting={exporting}
          sectionImage={selectedSectionId ? sectionImages[selectedSectionId] || null : null}
          onImageUpload={(id, dataUrl) => setSectionImages(prev => ({ ...prev, [id]: dataUrl }))}
          sectionBgColor={selectedSectionId ? sectionBgColors[selectedSectionId] : undefined}
          onBgColorChange={(id, color) => setSectionBgColors(prev => ({ ...prev, [id]: color }))}
          sectionIcons={selectedSectionId ? sectionIcons[selectedSectionId] : undefined}
          onIconChange={(id, index, iconKey) => {
            setSectionIcons(prev => {
              const current = [...(prev[id] || [])];
              current[index] = iconKey;
              return { ...prev, [id]: current };
            });
          }}
          onAiCopy={async (sectionId) => {
            setAiLoading(true);
            try {
              const section = visibleSections.find(s => s.id === sectionId);
              if (!section) return;
              const res = await fetch('/api/ai-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sectionType: section.sectionType,
                  productName: productInfo.name,
                  category: productInfo.category,
                  usps: extractedUSPs.map(u => u.title),
                }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data.title) handleUpdateSection(sectionId, { title: data.title, body: data.body || '' });
              }
            } catch (e) { console.error('AI copy failed:', e); }
            finally { setAiLoading(false); }
          }}
          onAiImage={async (sectionId) => {
            setAiLoading(true);
            try {
              const { generateGeminiPrompt } = await import('@/lib/gemini-prompts');
              const section = visibleSections.find(s => s.id === sectionId);
              if (!section) return;
              const { prompt, width, height } = generateGeminiPrompt(section, {
                productInfo, usps: extractedUSPs, tone: 'trust',
                colors: { primary: colors.primary, accent: colors.accent, bg: colors.primary, text: colors.text },
              });
              const res = await fetch('/api/generate-gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, width, height }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data.success && data.imageUrl) {
                  setSectionImages(prev => ({ ...prev, [sectionId]: data.imageUrl }));
                }
              }
            } catch (e) { console.error('AI image failed:', e); }
            finally { setAiLoading(false); }
          }}
          aiLoading={aiLoading}
          competitorInsights={competitorInsights}
          researchStatus={researchStatus}
          onExportSectionPng={async (sectionId) => {
            const el = sectionRefs.current[sectionId];
            if (!el) return;
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(el, { width: 860, pixelRatio: 2, quality: 1 });
            const link = document.createElement('a');
            link.download = `section_${sectionId}.png`;
            link.href = dataUrl;
            link.click();
          }}
        />
      </div>
    </div>
  );
}
