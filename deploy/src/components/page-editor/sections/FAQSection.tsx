'use client';

import EditableText from '../EditableText';
import { HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  items: FAQItem[];
  accentColor: string;
  onUpdate?: (field: string, value: string) => void;
}

export default function FAQSection({
  title, items, accentColor, onUpdate,
}: FAQSectionProps) {
  return (
    <div className="w-[860px] py-20 px-16 text-center" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: accentColor }} />
      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight text-[#191F28] mb-12"
      />

      <div className="max-w-[640px] mx-auto space-y-3 text-left">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            {/* Q */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] font-black text-white"
                style={{ backgroundColor: accentColor }}
              >
                Q
              </div>
              <EditableText
                value={item.question}
                onChange={v => onUpdate?.(`q-${i}`, v)}
                tag="span"
                className="text-[15px] font-bold text-[#191F28] flex-1"
              />
            </div>
            {/* A */}
            <div className="flex items-start gap-3 px-6 py-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] font-black bg-[#F4F5F7] text-[#8B95A1]">
                A
              </div>
              <EditableText
                value={item.answer}
                onChange={v => onUpdate?.(`a-${i}`, v)}
                tag="span"
                className="text-[14px] leading-[1.8] text-[#4E5968] flex-1"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
