'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import DetailPagePreview from '@/components/preview/DetailPagePreview';
import Button from '@/components/ui/Button';

export default function Step4Preview() {
  const { state, dispatch } = useDetailPage();
  const { generatedSections } = state;
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">미리보기 & 편집</h2>
        <p className="text-gray-500">
          섹션을 드래그하여 순서를 변경하고, 클릭하여 내용을 편집할 수 있습니다.
        </p>
      </div>

      {/* 뷰 모드 토글 + 컨트롤 */}
      <div className="flex items-center justify-center gap-4">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'desktop'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            데스크탑
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'mobile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            모바일
          </button>
        </div>
      </div>

      {/* 섹션 토글 목록 */}
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {generatedSections.map((section) => (
            <button
              key={section.id}
              onClick={() =>
                dispatch({ type: 'TOGGLE_SECTION_VISIBILITY', payload: section.id })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                section.visible
                  ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 line-through'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* 미리보기 */}
      <div
        className={`mx-auto transition-all duration-500 ${
          viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[860px]'
        }`}
      >
        <div className="preview-container">
          <DetailPagePreview />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-between pt-4 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
          이전
        </Button>
        <Button size="lg" onClick={() => dispatch({ type: 'NEXT_STEP' })}>
          다음: 내보내기
        </Button>
      </div>
    </motion.div>
  );
}
