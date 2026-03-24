'use client';

import { useState } from 'react';
import { HeroContent, TextStyle } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';
import TextStyleBar from '@/components/ui/TextStyleBar';

const DEFAULT_STYLE: TextStyle = { fontSize: 16, color: '#111827' };

interface SectionHeroProps {
  content: HeroContent;
  sectionId: string;
  styles?: TextStyle;
}

export default function SectionHero({ content, sectionId, styles }: SectionHeroProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(content);
  const [editStyles, setEditStyles] = useState<TextStyle>(styles ?? DEFAULT_STYLE);

  const category = productInfo.category
    ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES]
    : null;
  const primaryColor = category?.primary || '#6366F1';

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { id: sectionId, data: { content: editData, styles: editStyles } },
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-6 space-y-4 bg-gray-50">
        <TextStyleBar style={editStyles} onChange={setEditStyles} />
        <input
          value={editData.headline}
          onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="헤드라인"
          style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
        />
        <input
          value={editData.subheadline}
          onChange={(e) => setEditData({ ...editData, subheadline: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="서브 헤드라인"
          style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
        />
        <input
          value={editData.ctaText}
          onChange={(e) => setEditData({ ...editData, ctaText: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="CTA 텍스트"
          style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          >
            저장
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="section-editable relative cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      <div
        className="py-20 px-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}30 100%)`,
        }}
      >
        <div className="section-edit-overlay">
          <span className="px-3 py-1.5 rounded-lg bg-white shadow-md text-xs text-gray-500">
            클릭하여 편집
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight"
          style={{ color: styles?.color ?? primaryColor, fontSize: styles?.fontSize ? `${styles.fontSize * 2}px` : undefined }}
        >
          {content.headline}
        </h1>
        <p
          className="text-lg mb-8 max-w-xl mx-auto leading-relaxed"
          style={{ fontSize: styles?.fontSize, color: styles?.color ?? 'rgb(75 85 99)' }}
        >
          {content.subheadline}
        </p>
        <button
          className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          style={{ backgroundColor: primaryColor, fontSize: styles?.fontSize }}
          onClick={(e) => e.stopPropagation()}
        >
          {content.ctaText}
        </button>
        {productInfo.price && (
          <p className="mt-4 text-2xl font-bold" style={{ color: primaryColor }}>
            {productInfo.price}
          </p>
        )}
      </div>
    </div>
  );
}
