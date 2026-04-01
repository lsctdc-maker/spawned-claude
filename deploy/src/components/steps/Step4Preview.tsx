'use client';

import { motion } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import Button from '@/components/ui/Button';
import { ImageIcon } from 'lucide-react';
import { ManuscriptSectionType } from '@/lib/types';

const SECTION_ACCENT: Record<ManuscriptSectionType, { bg: string; text: string; border: string }> = {
  hooking:      { bg: 'bg-[#3182F6]/5',  text: 'text-[#3182F6]',  border: 'border-[#3182F6]/20' },
  problem:      { bg: 'bg-[#F04452]/5',  text: 'text-[#F04452]',  border: 'border-[#F04452]/20' },
  solution:     { bg: 'bg-[#00C471]/5',  text: 'text-[#00C471]',  border: 'border-[#00C471]/20' },
  features:     { bg: 'bg-[#3182F6]/5',  text: 'text-[#3182F6]',  border: 'border-[#3182F6]/20' },
  howto:        { bg: 'bg-[#00C471]/5',  text: 'text-[#00C471]',  border: 'border-[#00C471]/20' },
  social_proof: { bg: 'bg-[#8B5CF6]/5',  text: 'text-[#8B5CF6]',  border: 'border-[#8B5CF6]/20' },
  specs:        { bg: 'bg-[#4E5968]/5',  text: 'text-[#4E5968]',  border: 'border-[#4E5968]/20' },
  guarantee:    { bg: 'bg-[#00C471]/5',  text: 'text-[#00C471]',  border: 'border-[#00C471]/20' },
  event_banner: { bg: 'bg-[#FF9F00]/5',  text: 'text-[#FF9F00]',  border: 'border-[#FF9F00]/20' },
  cta:          { bg: 'bg-[#F04452]/5',  text: 'text-[#F04452]',  border: 'border-[#F04452]/20' },
  hero:     { bg: 'bg-[#3182F6]/5',  text: 'text-[#3182F6]',  border: 'border-[#3182F6]/20' },
  detail:   { bg: 'bg-[#4E5968]/5',  text: 'text-[#4E5968]',  border: 'border-[#4E5968]/20' },
  trust:    { bg: 'bg-[#8B5CF6]/5',  text: 'text-[#8B5CF6]',  border: 'border-[#8B5CF6]/20' },
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
  event_banner: '이벤트 배너',
  cta: '구매 유도',
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
        <p className="text-[#8B95A1]">미리볼 원고가 없습니다.</p>
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
        <h2 className="text-2xl font-bold text-[#191F28] mb-2">미리보기</h2>
        <p className="text-[#8B95A1]">원고와 이미지 가이드를 확인하세요. 이미지는 Phase 2에서 제작합니다.</p>
      </div>

      <div className="max-w-[860px] mx-auto">
        <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E8EB] shadow-card">

          <div className="px-6 py-3 border-b border-[#E5E8EB] flex items-center gap-4">
            {productPhotos.length > 0 && (
              <img src={productPhotos[0].dataUrl} alt="대표 사진" className="w-8 h-8 rounded-md object-cover" />
            )}
            <div>
              <span className="text-xs font-bold text-[#191F28]">{productInfo.name || '제품명'}</span>
              {productInfo.price && <span className="ml-2 text-xs text-[#8B95A1]">{productInfo.price}</span>}
            </div>
            <div className="ml-auto flex gap-2">
              {[...Array(Math.min(productPhotos.length, 5))].map((_, i) => (
                <img key={i} src={productPhotos[i].dataUrl} alt="" className="w-6 h-6 rounded object-cover opacity-60" />
              ))}
              {productPhotos.length > 5 && (
                <span className="text-xs text-[#8B95A1] self-center">+{productPhotos.length - 5}</span>
              )}
            </div>
          </div>

          <div className="divide-y divide-[#E5E8EB]">
            {visibleSections.map((section) => {
              const accent = SECTION_ACCENT[section.sectionType] || SECTION_ACCENT.detail;

              return (
                <div key={section.id} className="group">
                  <div className={`px-6 py-2 flex items-center gap-2 ${accent.bg}`}>
                    <span className={`text-[10px] uppercase tracking-widest font-medium ${accent.text}`}>
                      {SECTION_LABELS[section.sectionType] || section.sectionType}
                    </span>
                    <span className="text-xs font-semibold text-[#191F28]">
                      {section.title}
                    </span>
                  </div>

                  <div className="px-6 py-5 grid md:grid-cols-[1fr_200px] gap-5">
                    <div>
                      <p className="text-sm text-[#4E5968] leading-relaxed whitespace-pre-wrap">
                        {section.body}
                      </p>
                    </div>

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

          <div className="px-6 py-3 border-t border-[#E5E8EB] text-center">
            <span className="text-[10px] text-[#D1D6DB] tracking-widest uppercase">
              DetailMaker — Draft
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
