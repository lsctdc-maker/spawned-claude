'use client';

import { useCallback } from 'react';
import { CertificationContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';
import EditableText from './EditableText';

interface SectionCertificationProps {
  content: CertificationContent;
  sectionId: string;
}

export default function SectionCertification({ content, sectionId }: SectionCertificationProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#3182F6';

  const updateItem = useCallback((idx: number, field: string, value: string) => {
    const newItems = [...content.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: { ...content, items: newItems } } } });
  }, [dispatch, sectionId, content]);

  return (
    <div className="py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-center mb-12" style={{ color: primaryColor }}>인증</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.items.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-[#F4F5F7] shadow-[0_10px_40px_rgba(25,31,40,0.05)] mb-4 text-3xl border border-[#E5E8EB]/10">{item.icon || '🏆'}</div>
              <EditableText
                tag="h3"
                value={item.name}
                onSave={(v) => updateItem(idx, 'name', v)}
                className="text-lg font-headline font-bold mb-2"
                style={{ color: primaryColor }}
              />
              <EditableText
                tag="p"
                value={item.description}
                onSave={(v) => updateItem(idx, 'description', v)}
                className="text-[#8B95A1] text-sm"
                multiline
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
