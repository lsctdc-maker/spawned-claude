'use client';

import { useCallback } from 'react';
import { HowToContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';
import EditableText from './EditableText';

interface SectionHowToProps {
  content: HowToContent;
  sectionId: string;
}

export default function SectionHowTo({ content, sectionId }: SectionHowToProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#3182F6';

  const updateStep = useCallback((idx: number, field: string, value: string) => {
    const newSteps = [...content.steps];
    newSteps[idx] = { ...newSteps[idx], [field]: value };
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: { ...content, steps: newSteps } } } });
  }, [dispatch, sectionId, content]);

  return (
    <div className="py-16 px-8" style={{ backgroundColor: `${primaryColor}05` }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-center mb-12" style={{ color: primaryColor }}>사용 방법</h2>
        <div className="relative">
          {content.steps.map((step, idx) => (
            <div key={idx} className="flex gap-8 mb-12 relative">
              {idx < content.steps.length - 1 && (
                <div className="absolute left-4 top-16 w-0.5 h-24" style={{ backgroundColor: `${primaryColor}40` }} />
              )}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold z-10 relative primary-gradient text-sm">{idx + 1}</div>
              </div>
              <div className="flex-1 py-2">
                <EditableText
                  tag="h3"
                  value={step.title}
                  onSave={(v) => updateStep(idx, 'title', v)}
                  className="text-xl font-headline font-bold mb-2"
                  style={{ color: primaryColor }}
                />
                <EditableText
                  tag="p"
                  value={step.description}
                  onSave={(v) => updateStep(idx, 'description', v)}
                  className="text-[#8B95A1]"
                  multiline
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
