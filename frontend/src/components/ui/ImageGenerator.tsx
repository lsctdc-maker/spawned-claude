'use client';

import { useState } from 'react';
import { useDetailPage } from '@/hooks/useDetailPage';

interface ImageGeneratorProps {
  onApply: (imageUrl: string) => void;
  defaultPrompt?: string;
  autoType?: string;
}

export default function ImageGenerator({ onApply, defaultPrompt = '', autoType = 'product' }: ImageGeneratorProps) {
  const { state } = useDetailPage();
  const { productInfo, selectedTone } = state;

  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAutoFill = () => {
    const categoryNames: Record<string, string> = {
      food: '식품', cosmetics: '화장품', health: '건강기능식품',
      electronics: '가전', fashion: '패션', living: '생활용품',
      pets: '반려동물', kids: '유아/아동', sports: '스포츠',
      interior: '인테리어', automotive: '자동차용품', stationery: '문구',
      beverages: '주류/음료', digital: '디지털', others: '기타',
    };
    const catLabel = productInfo.category ? (categoryNames[productInfo.category] || productInfo.category) : '';
    setPrompt(
      `${productInfo.name || '제품'} ${catLabel} 제품 사진, 고품질 상업용 사진, 흰색 배경, 8K 해상도, 텍스트 없음`
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !productInfo.name) return;

    setIsGenerating(true);
    setError('');
    setPreviewUrl(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          prompt.trim()
            ? { prompt: prompt.trim() }
            : {
                autoPrompt: true,
                productName: productInfo.name,
                category: productInfo.category,
                tone: selectedTone,
                type: autoType,
              }
        ),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || '생성에 실패했습니다.');
        return;
      }

      setPreviewUrl(data.imageUrl);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-100 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-purple-700">🎨 AI 이미지 생성</span>
        <button
          type="button"
          onClick={handleAutoFill}
          className="ml-auto text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
        >
          자동 프롬프트
        </button>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="이미지 설명을 입력하세요 (영어 권장)&#10;예: white ceramic vase on marble table, natural light, minimalist"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-purple-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || (!prompt.trim() && !productInfo.name)}
        className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            생성 중... (약 20초)
          </>
        ) : (
          '✨ 이미지 생성하기'
        )}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {previewUrl && (
        <div className="space-y-2">
          <img
            src={previewUrl}
            alt="생성된 이미지"
            className="w-full rounded-lg border border-purple-200 object-cover max-h-48"
          />
          <button
            type="button"
            onClick={() => onApply(previewUrl)}
            className="w-full py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            ✅ 이 이미지 적용하기
          </button>
        </div>
      )}
    </div>
  );
}
