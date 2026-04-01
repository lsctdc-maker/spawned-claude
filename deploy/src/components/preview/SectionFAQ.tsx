'use client';

import { useState, useCallback } from 'react';
import { FAQContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';
import { ChevronDown } from 'lucide-react';
import EditableText from './EditableText';

interface SectionFAQProps {
  content: FAQContent;
  sectionId: string;
}

export default function SectionFAQ({ content, sectionId }: SectionFAQProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#3182F6';

  const updateItem = useCallback((idx: number, field: string, value: string) => {
    const newItems = [...content.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: { ...content, items: newItems } } } });
  }, [dispatch, sectionId, content]);

  return (
    <div className="py-16 px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-center mb-12" style={{ color: primaryColor }}>자주 묻는 질문</h2>
        <div className="space-y-3">
          {content.items.map((item, idx) => (
            <div key={idx} className="rounded-xl overflow-hidden bg-[#F4F5F7] border border-[#E5E8EB]/10">
              <button
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F4F5F7] transition-colors"
              >
                <span className="font-bold text-left flex items-center gap-1" style={{ color: primaryColor }}>
                  Q: <EditableText
                    tag="span"
                    value={item.question}
                    onSave={(v) => updateItem(idx, 'question', v)}
                    className="font-bold"
                    style={{ color: primaryColor }}
                  />
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ${expandedIdx === idx ? 'rotate-180' : ''}`} style={{ color: primaryColor }} />
              </button>
              {expandedIdx === idx && (
                <div className="px-6 py-4 bg-white">
                  <span className="font-bold" style={{ color: primaryColor }}>A: </span>
                  <EditableText
                    tag="span"
                    value={item.answer}
                    onSave={(v) => updateItem(idx, 'answer', v)}
                    className="text-[#8B95A1]"
                    multiline
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
