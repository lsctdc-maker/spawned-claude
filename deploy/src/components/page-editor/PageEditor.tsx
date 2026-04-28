'use client';

import { useMemo, useRef, useCallback, useState } from 'react';
import { useDetailPage } from '@/hooks/useDetailPage';
import HeroSection from './sections/HeroSection';
import FeatureGrid from './sections/FeatureGrid';
import ProblemSection from './sections/ProblemSection';
import SolutionSection from './sections/SolutionSection';
import SpecsSection from './sections/SpecsSection';
import CTASection from './sections/CTASection';
import { ManuscriptSection } from '@/lib/types';
import { Download, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';

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
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showOutlines, setShowOutlines] = useState(false);

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

      // 아직 전용 컴포넌트 없는 섹션 → 범용 렌더링
      default:
        return (
          <div
            key={section.id}
            className="w-[860px] py-14 px-14"
            style={{ backgroundColor: section.order % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }}
          >
            <div className="w-8 h-1 rounded-full mb-4" style={{ backgroundColor: colors.accent }} />
            <h2 className="text-[28px] font-extrabold tracking-tight text-[#191F28] mb-4">
              {section.title || '섹션 제목'}
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4E5968] whitespace-pre-line">
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
    setExportProgress(10);

    try {
      const { toPng } = await import('html-to-image');
      setExportProgress(30);

      const dataUrl = await toPng(pageRef.current, {
        width: 860,
        pixelRatio: 2,
        quality: 1,
        backgroundColor: '#FFFFFF',
      });

      setExportProgress(90);

      const link = document.createElement('a');
      link.download = `${productInfo.name || 'detail'}_상세페이지.png`;
      link.href = dataUrl;
      link.click();

      setExportProgress(100);
    } catch (e) {
      console.error('Export failed:', e);
      alert('내보내기 실패. 다시 시도해주세요.');
    } finally {
      setExporting(false);
      setExportProgress(0);
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
            <p className="text-[10px] text-[#8B95A1]">{visibleSections.length}개 섹션 · 클릭하여 편집</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOutlines(!showOutlines)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${
              showOutlines ? 'text-[#3182F6] bg-[#EBF4FF] border-[#3182F6]/30' : 'text-[#8B95A1] border-[#E5E8EB]'
            }`}
          >
            {showOutlines ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            섹션 구분
          </button>

          <Button
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-1.5" />
            {exporting ? `내보내는 중... ${exportProgress}%` : 'PNG 다운로드'}
          </Button>
        </div>
      </div>

      {/* 메인 영역: 스크롤 가능한 페이지 */}
      <div className="flex-1 overflow-auto flex justify-center py-8">
        <div
          ref={pageRef}
          className="bg-white shadow-2xl rounded-lg overflow-hidden"
          style={{ width: 860 }}
        >
          {visibleSections.map((section, i) => (
            <div
              key={section.id}
              className={showOutlines ? 'ring-1 ring-blue-300/40 ring-inset' : ''}
            >
              {renderSection(section)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
