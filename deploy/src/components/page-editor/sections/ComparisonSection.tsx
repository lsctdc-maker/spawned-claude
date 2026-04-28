'use client';

import EditableText from '../EditableText';
import { X, Check } from 'lucide-react';

interface ComparisonSectionProps {
  title: string;
  leftLabel: string;
  rightLabel: string;
  rows: { left: string; right: string }[];
  accentColor: string;
  onUpdate?: (field: string, value: string) => void;
}

export default function ComparisonSection({
  title, leftLabel, rightLabel, rows, accentColor, onUpdate,
}: ComparisonSectionProps) {
  return (
    <div className="w-[860px] py-20 px-16 text-center" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: accentColor }} />
      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight text-[#191F28] mb-12"
      />

      {/* 비교 테이블 */}
      <div className="max-w-[640px] mx-auto rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {/* 헤더 */}
        <div className="flex">
          <div className="flex-1 py-4 text-center bg-[#E5E8EB]">
            <EditableText
              value={leftLabel}
              onChange={v => onUpdate?.('leftLabel', v)}
              tag="span"
              className="text-[14px] font-bold text-[#4E5968]"
            />
          </div>
          <div className="flex-1 py-4 text-center" style={{ backgroundColor: accentColor }}>
            <EditableText
              value={rightLabel}
              onChange={v => onUpdate?.('rightLabel', v)}
              tag="span"
              className="text-[14px] font-bold text-white"
            />
          </div>
        </div>

        {/* 행 */}
        {rows.map((row, i) => (
          <div key={i} className="flex border-t border-[#E5E8EB]">
            <div className="flex-1 py-4 px-5 text-center bg-white flex items-center justify-center gap-2">
              <X className="w-4 h-4 text-[#8B95A1] flex-shrink-0" />
              <EditableText
                value={row.left}
                onChange={v => onUpdate?.(`left-${i}`, v)}
                tag="span"
                className="text-[13px] text-[#4E5968]"
              />
            </div>
            <div className="flex-1 py-4 px-5 text-center flex items-center justify-center gap-2"
              style={{ backgroundColor: `${accentColor}08` }}>
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
              <EditableText
                value={row.right}
                onChange={v => onUpdate?.(`right-${i}`, v)}
                tag="span"
                className="text-[13px] font-semibold text-[#191F28]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
