'use client';

import { useState, useEffect } from 'react';
import { ManuscriptSectionType, ToneKey, ColorPalette } from '@/lib/types';

interface TemplateOption {
  id: string;
  name: string;
  variantId: string;
  sectionType: string;
  bgImageUrl: string;
  bgImageHeight: number;
  score: number;
  matchReasons: string[];
  styleTags: string[];
  colorScheme: string;
}

interface TemplateSelectorProps {
  sectionType: ManuscriptSectionType;
  category: string;
  tone: ToneKey;
  colorPalette: ColorPalette | null;
  selectedId: string | null;
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

export function TemplateSelector({
  sectionType,
  category,
  tone,
  colorPalette,
  selectedId,
  onSelect,
  onClose,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecommendations() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/recommend-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionType,
            category,
            tone,
            colorPalette,
            limit: 6,
          }),
        });

        if (!res.ok) throw new Error('추천 API 호출 실패');
        const data = await res.json();
        if (!cancelled) {
          setTemplates(data.templates || []);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || '템플릿 로드 실패');
          setTemplates([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecommendations();
    return () => { cancelled = true; };
  }, [sectionType, category, tone, colorPalette]);

  // 미리보기 이미지 프리로드
  useEffect(() => {
    templates.forEach(t => {
      const img = new Image();
      img.src = t.bgImageUrl;
    });
  }, [templates]);

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          추천 템플릿
        </h3>
        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          닫기
        </button>
      </div>

      {loading && (
        <div className="text-xs text-gray-400 py-4 text-center">
          추천 로딩 중...
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 py-2 text-center">
          {error}
        </div>
      )}

      {!loading && !error && templates.length === 0 && (
        <div className="text-xs text-gray-400 py-4 text-center">
          사용 가능한 Figma 템플릿이 없습니다.
          <br />
          기존 템플릿이 적용됩니다.
        </div>
      )}

      {!loading && templates.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                selectedId === t.id
                  ? 'border-blue-500 ring-1 ring-blue-200'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {/* 썸네일 */}
              <div className="aspect-[860/540] bg-gray-200 relative">
                <img
                  src={t.bgImageUrl}
                  alt={t.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selectedId === t.id && (
                  <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                    <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                      사용중
                    </span>
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="p-1.5">
                <div className="text-[10px] font-medium text-gray-700 truncate">
                  {t.name}
                </div>
                <div className="text-[9px] text-gray-400 truncate">
                  {t.matchReasons[0] || t.styleTags[0] || '범용'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
