'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQContent, TextStyle } from '@/lib/types';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import TextStyleBar from '@/components/ui/TextStyleBar';

const DEFAULT_STYLE: TextStyle = { fontSize: 16, color: '#111827' };

interface SectionFAQProps {
  content: FAQContent;
  sectionId: string;
  styles?: TextStyle;
}

export default function SectionFAQ({ content, sectionId, styles }: SectionFAQProps) {
  const { state, dispatch } = useDetailPage();
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState(content.items);
  const [editStyles, setEditStyles] = useState<TextStyle>(styles ?? DEFAULT_STYLE);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const category = state.productInfo.category
    ? CATEGORIES[state.productInfo.category as keyof typeof CATEGORIES]
    : null;
  const primaryColor = category?.primary || '#6366F1';

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
          <div key={idx} className="space-y-2 p-4 bg-white rounded-xl">
            <input
              value={item.question}
              onChange={(e) => updateItem(idx, 'question', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="질문"
              style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
            />
            <textarea
              value={item.answer}
              onChange={(e) => updateItem(idx, 'answer', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              placeholder="답변"
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
    <div className="section-editable py-16 px-8" onClick={(e) => {
      if ((e.target as HTMLElement).closest('.faq-item')) return;
      setIsEditing(true);
    }}>
      <div className="section-edit-overlay">
        <span className="px-3 py-1.5 rounded-lg bg-white shadow-md text-xs text-gray-500">클릭하여 편집</span>
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">자주 묻는 질문</h2>
      <div className="max-w-2xl mx-auto space-y-3">
        {content.items.map((item, idx) => (
          <div
            key={idx}
            className="faq-item bg-gray-50 rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm" style={{ color: primaryColor }}>Q</span>
                <span className="font-medium" style={{ fontSize: styles?.fontSize, color: styles?.color ?? '#111827' }}>{item.question}</span>
              </div>
              <motion.span
                animate={{ rotate: openIndex === idx ? 180 : 0 }}
                className="text-gray-400 text-lg"
              >
                ▾
              </motion.span>
            </div>
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-6 pb-4">
                    <div className="flex items-start gap-3 pt-2 border-t border-gray-200">
                      <span className="font-bold text-sm text-gray-400 mt-0.5">A</span>
                      <p className="leading-relaxed" style={{ fontSize: styles?.fontSize, color: styles?.color ?? 'rgb(75 85 99)' }}>{item.answer}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
