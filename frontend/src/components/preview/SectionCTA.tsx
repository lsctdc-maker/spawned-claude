'use client';

import { useState } from 'react';
import { CTAContent, TextStyle } from '@/lib/types';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import TextStyleBar from '@/components/ui/TextStyleBar';

const DEFAULT_STYLE: TextStyle = { fontSize: 16, color: '#111827' };

interface SectionCTAProps {
  content: CTAContent;
  sectionId: string;
  styles?: TextStyle;
}

export default function SectionCTA({ content, sectionId, styles }: SectionCTAProps) {
  const { state, dispatch } = useDetailPage();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(content);
  const [editStyles, setEditStyles] = useState<TextStyle>(styles ?? DEFAULT_STYLE);

  const category = state.productInfo.category
    ? CATEGORIES[state.productInfo.category as keyof typeof CATEGORIES]
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
      <div className="p-6 space-y-3 bg-gray-50">
        <TextStyleBar style={editStyles} onChange={setEditStyles} />
        <input
          value={editData.headline}
          onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="헤드라인"
          style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
        />
        <input
          value={editData.subtext}
          onChange={(e) => setEditData({ ...editData, subtext: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="서브 텍스트"
          style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
        />
        <input
          value={editData.buttonText}
          onChange={(e) => setEditData({ ...editData, buttonText: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="버튼 텍스트"
          style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
        />
        <input
          value={editData.urgencyText || ''}
          onChange={(e) => setEditData({ ...editData, urgencyText: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="긴급 텍스트 (선택)"
          style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-200">취소</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700">저장</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="section-editable cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      <div
        className="py-20 px-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)`,
        }}
      >
        <div className="section-edit-overlay">
          <span className="px-3 py-1.5 rounded-lg bg-white/90 shadow-md text-xs text-gray-500">클릭하여 편집</span>
        </div>
        <h2 className="font-extrabold text-white mb-3" style={{ fontSize: styles?.fontSize ? `${styles.fontSize + 16}px` : '1.875rem' }}>{content.headline}</h2>
        <p className="mb-8 text-white/80" style={{ fontSize: styles?.fontSize ? `${styles.fontSize + 2}px` : '1.125rem' }}>{content.subtext}</p>
        <button
          className="px-10 py-4 rounded-2xl bg-white font-bold shadow-xl hover:shadow-2xl transition-shadow"
          style={{ color: primaryColor, fontSize: styles?.fontSize }}
          onClick={(e) => e.stopPropagation()}
        >
          {content.buttonText}
        </button>
        {content.urgencyText && (
          <p className="mt-4 text-white/90 font-medium" style={{ fontSize: styles?.fontSize }}>{content.urgencyText}</p>
        )}
      </div>
    </div>
  );
}
