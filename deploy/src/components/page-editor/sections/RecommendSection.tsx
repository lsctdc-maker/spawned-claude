'use client';

import EditableText from '../EditableText';
import { Check } from 'lucide-react';

interface RecommendSectionProps {
  title: string;
  items: string[];
  accentColor: string;
  bgColor: string;
  onUpdate?: (field: string, value: string) => void;
}

export default function RecommendSection({
  title, items, accentColor, bgColor, onUpdate,
}: RecommendSectionProps) {
  return (
    <div
      className="w-[860px] py-20 px-16 text-center"
      style={{ backgroundColor: accentColor }}
    >
      <div className="text-[12px] font-bold tracking-widest text-white/70 mb-3">
        {/* 제품명이 있으면 표시 */}
      </div>
      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight text-white mb-12"
      />

      {/* 체크 리스트 — 둥근 pill 카드 */}
      <div className="space-y-3 max-w-[520px] mx-auto">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-white rounded-full px-6 py-4"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <Check className="w-4 h-4 text-white" />
            </div>
            <EditableText
              value={item}
              onChange={v => onUpdate?.(`item-${i}`, v)}
              tag="span"
              className="text-[15px] font-semibold text-[#191F28] flex-1 text-left"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
