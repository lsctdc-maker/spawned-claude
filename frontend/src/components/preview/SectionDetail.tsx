'use client';

import { useState } from 'react';
import { DetailContent, TextStyle } from '@/lib/types';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import TextStyleBar from '@/components/ui/TextStyleBar';

const DEFAULT_STYLE: TextStyle = { fontSize: 16, color: '#111827' };

interface SectionDetailProps {
  content: DetailContent;
  sectionId: string;
  styles?: TextStyle;
}

export default function SectionDetail({ content, sectionId, styles }: SectionDetailProps) {
  const { state, dispatch } = useDetailPage();
  const [isEditing, setIsEditing] = useState(false);
  const [editParagraphs, setEditParagraphs] = useState(content.paragraphs);
  const [editStyles, setEditStyles] = useState<TextStyle>(styles ?? DEFAULT_STYLE);

  const category = state.productInfo.category
    ? CATEGORIES[state.productInfo.category as keyof typeof CATEGORIES]
    : null;
  const primaryColor = category?.primary || '#6366F1';

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { id: sectionId, data: { content: { paragraphs: editParagraphs }, styles: editStyles } },
    });
    setIsEditing(false);
  };

  const updateParagraph = (index: number, field: string, value: string) => {
    const updated = [...editParagraphs];
    updated[index] = { ...updated[index], [field]: value };
    setEditParagraphs(updated);
  };

  if (isEditing) {
    return (
      <div className="p-6 space-y-6 bg-gray-50">
        <TextStyleBar style={editStyles} onChange={setEditStyles} />
        {editParagraphs.map((para, idx) => (
          <div key={idx} className="space-y-2">
            <input
              value={para.title}
              onChange={(e) => updateParagraph(idx, 'title', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
            />
            <textarea
              value={para.text}
              onChange={(e) => updateParagraph(idx, 'text', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
            />
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
      <div className="max-w-3xl mx-auto space-y-16">
        {content.paragraphs.map((para, idx) => (
          <div
            key={idx}
            className={`flex flex-col sm:flex-row items-center gap-8 ${
              para.imagePosition === 'left' ? 'sm:flex-row-reverse' : ''
            }`}
          >
            <div className="flex-1 space-y-3">
              <h3 className="text-xl font-bold" style={{ color: styles?.color ?? '#111827', fontSize: styles?.fontSize ? `${styles.fontSize + 4}px` : undefined }}>{para.title}</h3>
              <p className="leading-relaxed" style={{ fontSize: styles?.fontSize, color: styles?.color ?? 'rgb(75 85 99)' }}>{para.text}</p>
            </div>
            <div
              className="w-full sm:w-64 h-48 rounded-2xl flex items-center justify-center text-4xl"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              {category?.icon || '📦'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
