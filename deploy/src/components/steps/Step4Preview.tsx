'use client';

import { motion } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import Button from '@/components/ui/Button';
import { ImageIcon } from 'lucide-react';
import { ManuscriptSectionType } from '@/lib/types';

const SECTION_ACCENT: Record<ManuscriptSectionType, { bg: string; text: string; border: string }> = {
  hooking:      { bg: 'bg-[#c3c0ff]/8',  text: 'text-[#c3c0ff]',  border: 'border-[#c3c0ff]/20' },
  problem:      { bg: 'bg-[#ffb3b3]/8',  text: 'text-[#ffb3b3]',  border: 'border-[#ffb3b3]/20' },
  solution:     { bg: 'bg-[#a0e7e5]/8',  text: 'text-[#a0e7e5]',  border: 'border-[#a0e7e5]/20' },
  features:     { bg: 'bg-[#a5c8ff]/8',  text: 'text-[#a5c8ff]',  border: 'border-[#a5c8ff]/20' },
  howto:        { bg: 'bg-[#a0e7e5]/8',  text: 'text-[#a0e7e5]',  border: 'border-[#a0e7e5]/20' },
  social_proof: { bg: 'bg-[#d4a5ff]/8',  text: 'text-[#d4a5ff]',  border: 'border-[#d4a5ff]/20' },
  specs:        { bg: 'bg-[#bbc3ff]/8',  text: 'text-[#bbc3ff]',  border: 'border-[#bbc3ff]/20' },
  guarantee:    { bg: 'bg-[#a5ffcc]/8',  text: 'text-[#a5ffcc]',  border: 'border-[#a5ffcc]/20' },
  cta:          { bg: 'bg-[#ffb3b3]/8',  text: 'text-[#ffb3b3]',  border: 'border-[#ffb3b3]/20' },
  // legacy
  hero:     { bg: 'bg-[#c3c0ff]/8',  text: 'text-[#c3c0ff]',  border: 'border-[#c3c0ff]/20' },
  detail:   { bg: 'bg-[#bbc3ff]/8',  text: 'text-[#bbc3ff]',  border: 'border-[#bbc3ff]/20' },
  trust:    { bg: 'bg-[#d4a5ff]/8',  text: 'text-[#d4a5ff]',  border: 'border-[#d4a5ff]/20' },
};

const SECTION_LABELS: Record<ManuscriptSectionType, string> = {
  hooking: '후킹',
  problem: '문제 공감',
  solution: '솔루션 제시',
  features: '핵심 특장점',
  howto: '사용 방법',
  social_proof: '사회적 증거',
  specs: '스펙/상세',
  guarantee: '보증/신뢰',
  cta: '구매 유도',
  // legacy
  hero: '히어로 카피',
  detail: '상세 설명',
  trust: '신뢰 요소',
};

export default function Step4Preview() {
  const { state, dispatch } = useDetailPage();
  const { manuscriptSections, productInfo, productPhotos } = state;

  const visibleSections = [...manuscriptSections]
    .sort((a, b) => a.order - b.order)
    .filter((s) => s.visible);

  if (visibleSections.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-3xl mx-auto text-center py-16 space-y-4"
      >
        <p className="text-[#e5e2e1]/40">미리볼 원고가 없습니다.</p>
        <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>이전으로</Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-headline font-extrabold text-[#e5e2e1] mb-2">미리보기</h2>
        <p className="text-[#c7c4d8]">원고와 이미지 가이드를 확인하세요. 이미지는 Phase 2에서 제작합니다.</p>
      </div>

      {/* 제품 대표 정보 */}
      <div className="max-w-[860px] mx-auto">
        <div className="bg-[#1c1b1b] rounded-2xl overflow-hidden border border-[#464555]/15 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">

          {/* 상단 메타 바 */}
          <div className="px-6 py-3 border-b border-[#464555]/10 flex items-center gap-4">
            {productPhotos.length > 0 && (
              <img src={productPhotos[0].dataUrl} alt="대표 사진" className="w-8 h-8 rounded-md object-cover" />
            )}
            <div>
              <span className="text-xs font-bold text-[#e5e2e1]">{productInfo.name || '제품명'}</span>
              {productInfo.price && <span className="ml-2 text-xs text-[#e5e2e1]/40">{productInfo.price}</span>}
            </div>
            <div className="ml-auto flex gap-2">
              {[...Array(Math.min(productPhotos.length, 5))].map((_, i) => (
                <img key={i} src={productPhotos[i].dataUrl} alt="" className="w-6 h-6 rounded object-cover opacity-60" />
              ))}
              {productPhotos.length > 5 && (
                <span className="text-xs text-[#e5e2e1]/30 self-center">+{productPhotos.length - 5}</span>
              )}
            </div>
          </div>

          {/* 섹션 미리보기 */}
          <div className="divide-y divide-[#464555]/8">
            {visibleSections.map((section) => {
              const accent = SECTION_ACCENT[section.sectionType] || SECTION_ACCENT.detail;

              return (
                <div key={section.id} className="group">
                  {/* 섹션 라벨 */}
                  <div className={`px-6 py-2 flex items-center gap-2 ${accent.bg}`}>
                    <span className={`text-[10px] uppercase tracking-widest font-label ${accent.text}`}>
                      {SECTION_LABELS[section.sectionType] || section.sectionType}
                    </span>
                    <span className={`text-xs font-semibold text-[#e5e2e1]/70`}>
                      {section.title}
                    </span>
                  </div>

                  <div className="px-6 py-5 grid md:grid-cols-[1fr_200px] gap-5">
                    {/* 원고 텍스트 */}
                    <div>
                      <p className="text-sm text-[#c7c4d8] leading-relaxed whitespace-pre-wrap">
                        {section.body}
                      </p>
                    </div>

                    {/* 이미지 가이드 박스 */}
                    <div className={`rounded-xl border-2 border-dashed ${accent.border} flex flex-col items-center justify-center py-6 px-4 text-center min-h-[120px]`}>
                      <ImageIcon className={`w-6 h-6 mb-2 ${accent.text} opacity-50`} />
                      <p className={`text-[11px] leading-relaxed ${accent.text} opacity-60`}>
                        {section.imageGuide}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 하단 워터마크 */}
          <div className="px-6 py-3 border-t border-[#464555]/10 text-center">
            <span className="text-[10px] text-[#e5e2e1]/15 tracking-widest uppercase font-label">
              The Digital Atelier — Phase 1 Draft
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>이전</Button>
        <Button size="lg" onClick={() => dispatch({ type: 'NEXT_STEP' })}>다음: 내보내기</Button>
      </div>
    </motion.div>
  );
}
