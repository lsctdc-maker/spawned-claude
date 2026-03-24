'use client';

import { useState } from 'react';
import { HowToContent, TextStyle } from '@/lib/types';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import TextStyleBar from '@/components/ui/TextStyleBar';

const DEFAULT_STYLE: TextStyle = { fontSize: 16, color: '#111827' };

interface SectionHowToProps {
  content: HowToContent;
  sectionId: string;
  styles?: TextStyle;
}

export default function SectionHowTo({ content, sectionId, styles }: SectionHowToProps) {
  const { state, dispatch } = useDetailPage();
  const [isEditing, setIsEditing] = useState(false);
  const [editSteps, setEditSteps] = useState(content.steps);
  const [editStyles, setEditStyles] = useState<TextStyle>(styles ?? DEFAULT_STYLE);

  const category = state.productInfo.category
    ? CATEGORIES[state.productInfo.category as keyof typeof CATEGORIES]
    : null;
  const primaryColor = category?.primary || '#6366F1';

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { id: sectionId, data: { content: { steps: editSteps }, styles: editStyles } },
    });
    setIsEditing(false);
  };

  const updateStep = (index: number, field: string, value: string) => {
    const updated = [...editSteps];
    updated[index] = { ...updated[index], [field]: value };
    setEditSteps(updated);
  };

  if (isEditing) {
    return (
      <div className="p-6 space-y-4 bg-gray-50">
        <TextStyleBar style={editStyles} onChange={setEditStyles} />
        {editSteps.map((step, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
              {step.step}
            </div>
            <div className="flex-1 space-y-2">
              <input
                value={step.title}
                onChange={(e) => updateStep(idx, 'title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
              />
              <textarea
                value={step.description}
                onChange={(e) => updateStep(idx, 'description', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
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
    <div
      className="section-editable py-16 px-8 cursor-pointer"
      style={{ backgroundColor: `${primaryColor}05` }}
      onClick={() => setIsEditing(true)}
    >
      <div className="section-edit-overlay">
        <span className="px-3 py-1.5 rounded-lg bg-white shadow-md text-xs text-gray-500">클릭하여 편집</span>
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">이렇게 사용하세요</h2>
      <div className="max-w-2xl mx-auto space-y-0">
        {content.steps.map((step, idx) => (
          <div key={idx} className="flex gap-6 items-start relative pb-10 last:pb-0">
            {idx < content.steps.length - 1 && (
              <div
                className="absolute left-5 top-12 w-0.5 h-full -ml-px"
                style={{ backgroundColor: `${primaryColor}20` }}
              />
            )}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md z-10"
              style={{ backgroundColor: primaryColor }}
            >
              {step.step}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-bold mb-1" style={{ fontSize: styles?.fontSize ? `${styles.fontSize + 2}px` : undefined, color: styles?.color ?? '#111827' }}>{step.title}</h3>
              <p className="leading-relaxed" style={{ fontSize: styles?.fontSize, color: styles?.color ?? 'rgb(75 85 99)' }}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
