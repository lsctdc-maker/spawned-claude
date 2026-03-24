'use client';

import { useCallback } from 'react';
import { USPContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';
import EditableText from './EditableText';

interface SectionUSPProps {
  content: USPContent;
  sectionId: string;
}

export default function SectionUSP({ content, sectionId }: SectionUSPProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#c3c0ff';

  const updatePoint = useCallback((idx: number, field: string, value: string) => {
    const newPoints = [...content.points];
    newPoints[idx] = { ...newPoints[idx], [field]: value };
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: { ...content, points: newPoints } } } });
  }, [dispatch, sectionId, content]);

  return (
    <div className="py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-center mb-12" style={{ color: primaryColor }}>주요 장점</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.points.map((point, idx) => (
            <div key={idx} className="text-center p-6 rounded-xl" style={{ backgroundColor: `${primaryColor}10` }}>
              <div className="mb-4 text-5xl">{point.icon || '✨'}</div>
              <EditableText
                tag="h3"
                value={point.title}
                onSave={(v) => updatePoint(idx, 'title', v)}
                className="text-xl font-headline font-bold mb-2"
                style={{ color: primaryColor }}
              />
              <EditableText
                tag="p"
                value={point.description}
                onSave={(v) => updatePoint(idx, 'description', v)}
                className="text-[#c7c4d8]"
                multiline
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
