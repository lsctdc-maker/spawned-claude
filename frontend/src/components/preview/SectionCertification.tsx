'use client';

import { useState } from 'react';
import { CertificationContent, TextStyle } from '@/lib/types';
import { useDetailPage } from '@/hooks/useDetailPage';
import TextStyleBar from '@/components/ui/TextStyleBar';

const DEFAULT_STYLE: TextStyle = { fontSize: 16, color: '#111827' };

interface SectionCertificationProps {
  content: CertificationContent;
  sectionId: string;
  styles?: TextStyle;
}

export default function SectionCertification({ content, sectionId, styles }: SectionCertificationProps) {
  const { dispatch } = useDetailPage();
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState(content.items);
  const [editStyles, setEditStyles] = useState<TextStyle>(styles ?? DEFAULT_STYLE);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { id: sectionId, data: { content: { items: editItems }, styles: editStyles } },
    });
    setIsEditing(false);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...editItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditItems(updated);
  };

  if (isEditing) {
    return (
      <div className="p-6 space-y-4 bg-gray-50">
        <TextStyleBar style={editStyles} onChange={setEditStyles} />
        {editItems.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <input
              value={item.icon}
              onChange={(e) => updateItem(idx, 'icon', e.target.value)}
              className="w-16 px-2 py-2 text-center rounded-lg border border-gray-300 text-xl"
            />
            <div className="flex-1 space-y-2">
              <input
                value={item.name}
                onChange={(e) => updateItem(idx, 'name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
              />
              <input
                value={item.description}
                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
    <div className="section-editable py-16 px-8 bg-gray-50 cursor-pointer" onClick={() => setIsEditing(true)}>
      <div className="section-edit-overlay">
        <span className="px-3 py-1.5 rounded-lg bg-white shadow-md text-xs text-gray-500">클릭하여 편집</span>
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">인증 &amp; 신뢰</h2>
      <div className="flex flex-wrap justify-center gap-8 max-w-3xl mx-auto">
        {content.items.map((item, idx) => (
          <div key={idx} className="text-center w-40">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl">
              {item.icon}
            </div>
            <h3 className="font-bold mb-1" style={{ fontSize: styles?.fontSize, color: styles?.color ?? '#111827' }}>{item.name}</h3>
            <p style={{ fontSize: styles?.fontSize ? styles.fontSize - 2 : undefined, color: styles?.color ?? 'rgb(107 114 128)' }}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
