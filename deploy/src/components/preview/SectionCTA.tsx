'use client';

import { useCallback } from 'react';
import { CTAContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';
import EditableText from './EditableText';

interface SectionCTAProps {
  content: CTAContent;
  sectionId: string;
}

export default function SectionCTA({ content, sectionId }: SectionCTAProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#3182F6';

  const updateContent = useCallback((field: keyof CTAContent, value: string) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: { ...content, [field]: value } } } });
  }, [dispatch, sectionId, content]);

  return (
    <div className="relative">
      <div className="py-16 px-8 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2346fa 100%)` }}>
        <EditableText
          tag="h2"
          value={content.headline}
          onSave={(v) => updateContent('headline', v)}
          className="text-3xl sm:text-4xl font-headline font-extrabold mb-4 leading-tight text-white"
        />
        <EditableText
          tag="p"
          value={content.subtext}
          onSave={(v) => updateContent('subtext', v)}
          className="text-lg mb-8 max-w-2xl mx-auto text-white/70"
          multiline
        />
        <EditableText
          tag="span"
          value={content.buttonText}
          onSave={(v) => updateContent('buttonText', v)}
          className="inline-block px-8 py-4 rounded-full bg-white text-lg font-bold shadow-lg"
          style={{ color: primaryColor }}
        />
        {content.urgencyText && (
          <div className="mt-4">
            <EditableText
              tag="p"
              value={content.urgencyText}
              onSave={(v) => updateContent('urgencyText', v)}
              className="text-sm text-white/80"
            />
          </div>
        )}
      </div>
    </div>
  );
}
