'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import DetailPagePreview from '@/components/preview/DetailPagePreview';
import Button from '@/components/ui/Button';
import { ImageIcon, Loader2, Sparkles, Wand2 } from 'lucide-react';

export default function Step4Preview() {
  const { state, dispatch } = useDetailPage();
  const { generatedSections, imageGenerating, images } = state;
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // 모든 이미지 한 번에 생성
  const handleGenerateAllImages = useCallback(async () => {
    if (isGeneratingAll) return;
    setIsGeneratingAll(true);

    const imageTypes = [
      { key: 'hero', type: 'hero' as const },
      { key: 'product', type: 'background' as const },
      { key: 'lifestyle', type: 'lifestyle' as const },
    ];

    // 각 타입별로 이미지 생성
    for (const { key, type } of imageTypes) {
      dispatch({ type: 'SET_IMAGE_GENERATING', payload: { key, generating: true } });

      try {
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            productName: state.productInfo.name,
            category: state.productInfo.category,
            usps: state.extractedUSPs.map((u) => u.title),
            tone: state.selectedTone,
          }),
        });

        const data = await response.json();
        if (data.success && data.imageUrl) {
          dispatch({ type: 'SET_IMAGE', payload: { key, url: data.imageUrl } });
        }
      } catch (error) {
        console.error(`${type} image generation failed:`, error);
      } finally {
        dispatch({ type: 'SET_IMAGE_GENERATING', payload: { key, generating: false } });
      }
    }

    // Detail 섹션의 각 paragraph에 대해 feature 이미지 생성
    const detailSection = generatedSections.find((s) => s.type === 'detail');
    if (detailSection) {
      const detailContent = detailSection.content as { paragraphs: { title: string }[] };
      const featureUrls: string[] = [];

      for (let i = 0; i < detailContent.paragraphs.length; i++) {
        const featureKey = `feature-${i}`;
        dispatch({ type: 'SET_IMAGE_GENERATING', payload: { key: featureKey, generating: true } });

        try {
          const response = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'feature',
              productName: state.productInfo.name,
              category: state.productInfo.category,
              usps: [detailContent.paragraphs[i].title],
              tone: state.selectedTone,
            }),
          });

          const data = await response.json();
          if (data.success && data.imageUrl) {
            featureUrls[i] = data.imageUrl;
            dispatch({ type: 'SET_IMAGE', payload: { key: 'features', url: JSON.stringify(featureUrls) } });
          }
        } catch (error) {
          console.error(`Feature ${i} image generation failed:`, error);
        } finally {
          dispatch({ type: 'SET_IMAGE_GENERATING', payload: { key: featureKey, generating: false } });
        }
      }
    }

    setIsGeneratingAll(false);
  }, [isGeneratingAll, state, dispatch, generatedSections]);

  const hasAnyImage = images.hero || images.product || images.lifestyle || images.features;
  const isAnyGenerating = Object.values(imageGenerating).some(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-headline font-extrabold text-[#e5e2e1] mb-2">미리보기 & 편집</h2>
        <p className="text-[#c7c4d8]">섹션을 드래그하여 순서를 변경하고, 클릭하여 내용을 편집할 수 있습니다.</p>
      </div>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="inline-flex rounded-full bg-[#201f1f] p-1 border border-[#464555]/15">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'desktop' ? 'bg-[#2a2a2a] text-[#e5e2e1] shadow-sm' : 'text-[#e5e2e1]/50 hover:text-[#e5e2e1]'}`}
          >데스크탑</button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'mobile' ? 'bg-[#2a2a2a] text-[#e5e2e1] shadow-sm' : 'text-[#e5e2e1]/50 hover:text-[#e5e2e1]'}`}
          >모바일</button>
        </div>

        {/* 이미지 일괄 생성 버튼 */}
        <button
          onClick={handleGenerateAllImages}
          disabled={isAnyGenerating || isGeneratingAll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all bg-gradient-to-r from-[#c3c0ff]/10 to-[#a5a1ff]/10 text-[#c3c0ff] border border-[#c3c0ff]/20 hover:from-[#c3c0ff]/20 hover:to-[#a5a1ff]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingAll || isAnyGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              이미지 생성 중...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              {hasAnyImage ? 'AI 이미지 전체 재생성' : 'AI 이미지 전체 생성'}
            </>
          )}
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {generatedSections.map((section) => (
            <button
              key={section.id}
              onClick={() => dispatch({ type: 'TOGGLE_SECTION_VISIBILITY', payload: section.id })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${section.visible ? 'bg-[#c3c0ff]/10 text-[#c3c0ff] border border-[#c3c0ff]/20 hover:bg-[#c3c0ff]/20' : 'bg-[#2a2a2a] text-[#e5e2e1]/30 border border-[#464555]/15 hover:bg-[#353534] line-through'}`}
            >{section.title}</button>
          ))}
        </div>
      </div>

      <div className={`mx-auto transition-all duration-500 ${viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[860px]'}`}>
        <div className="preview-container">
          <DetailPagePreview />
        </div>
      </div>

      <div className="flex justify-between pt-4 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>이전</Button>
        <Button size="lg" onClick={() => dispatch({ type: 'NEXT_STEP' })}>다음: 익스포트</Button>
      </div>
    </motion.div>
  );
}
