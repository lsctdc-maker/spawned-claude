'use client';

import { useState } from 'react';
import { USPContent, TextStyle } from '@/lib/types';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import TextStyleBar from '@/components/ui/TextStyleBar';

const DEFAULT_STYLE: TextStyle = { fontSize: 16, color: '#111827' };

interface SectionUSPProps {
  content: USPContent;
  sectionId: string;
  styles?: TextStyle;
}

export default function SectionUSP({ content, sectionId, styles }: SectionUSPProps) {
  const { state, dispatch } = useDetailPage();
  const [isEditing, setIsEditing] = useState(false);
  const [editPoints, setEditPoints] = useState(content.points);
  const [editStyles, setEditStyles] = useState<TextStyle>(styles ?? DEFAULT_STYLE);

  const category = state.productInfo.category
    ? CATEGORIES[state.productInfo.category as keyof typeof CATEGORIES]
    : null;
  const primaryColor = category?.primary || '#6366F1';

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { id: sectionId, data: { content: { points: editPoints }, styles: editStyles } },
    });
    setIsEditing(false);
  };

  const updatePoint = (index: number, field: string, value: string) => {
    const updated = [...editPoints];
    updated[index] = { ...updated[index], [field]: value };
    setEditPoints(updated);
  };

  if (isEditing) {
    return (
      <div className="p-6 space-y-4 bg-gray-50">
        <TextStyleBar style={editStyles} onChange={setEditStyles} />
        {editPoints.map((point, idx) => (
          <div key={point.id} className="flex gap-3 items-start">
            <input
              value={point.icon || ''}
              onChange={(e) => updatePoint(idx, 'icon', e.target.value)}
              className="w-16 px-2 py-2 text-center rounded-lg border border-gray-300 text-xl"
            />
            <div className="flex-1 space-y-2">
              <input
                value={point.title}
                onChange={(e) => updatePoint(idx, 'title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
              />
              <textarea
                value={point.description}
                onChange={(e) => updatePoint(idx, 'description', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
              />
            </div>
          </div>
        ))}
        <div className="flex gap-2 justify-end">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-200">취소</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700">저장</button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-editable py-16 px-8 cursor-pointer" onClick={() => setIsEditing(true)}>
      <div className="section-edit-overlay">
        <span className="px-3 py-1.5 rounded-lg bg-white shadow-md text-xs text-gray-500">클릭하여 편집</span>
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
        왜 선택해야 할까요?
      </h2>
      <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {content.points.map((point) => (
          <div key={point.id} className="text-center p-6 rounded-2xl" style={{ backgroundColor: `${primaryColor}08` }}>
            <div className="text-4xl mb-4">{point.icon || '📌'}</div>
            <h3 className="font-bold mb-2" style={{ fontSize: styles?.fontSize, color: styles?.color ?? '#111827' }}>{point.title}</h3>
            <p className="leading-relaxed" style={{ fontSize: styles?.fontSize ? styles.fontSize - 2 : undefined, color: styles?.color ?? 'rgb(75 85 99)' }}>{point.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
