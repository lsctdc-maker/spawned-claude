'use client';

import EditableText from '../EditableText';
import { ShieldCheck, RefreshCw, Phone } from 'lucide-react';

interface GuaranteeSectionProps {
  title: string;
  description: string;
  promises: string[];
  accentColor: string;
  bgColor: string;
  onUpdate?: (field: string, value: string) => void;
}

export default function GuaranteeSection({
  title, description, promises, accentColor, bgColor, onUpdate,
}: GuaranteeSectionProps) {
  const ICONS = [ShieldCheck, RefreshCw, Phone];

  return (
    <div
      className="w-[860px] py-20 px-16 text-center"
      style={{
        background: `linear-gradient(180deg, ${bgColor}10 0%, ${bgColor}05 100%)`,
        backgroundColor: '#F8F9FA',
      }}
    >
      {/* 큰 실드 아이콘 */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{
          backgroundColor: accentColor,
          boxShadow: `0 12px 32px ${accentColor}30`,
        }}
      >
        <ShieldCheck className="w-12 h-12 text-white" />
      </div>

      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight text-[#191F28] mb-4"
      />

      <EditableText
        value={description}
        onChange={v => onUpdate?.('description', v)}
        tag="p"
        className="text-[15px] leading-[1.9] text-[#4E5968] mb-12 max-w-[520px] mx-auto"
      />

      {/* 약속 pill 3개 */}
      <div className="flex justify-center gap-4">
        {promises.map((promise, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white"
              style={{
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: `1px solid ${accentColor}20`,
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${accentColor}12` }}
              >
                <Icon className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <EditableText
                value={promise}
                onChange={v => onUpdate?.(`promise-${i}`, v)}
                tag="span"
                className="text-[14px] font-bold text-[#191F28]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
