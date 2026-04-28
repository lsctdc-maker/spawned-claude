'use client';

import EditableText from '../EditableText';
import { Check } from 'lucide-react';

interface SolutionSectionProps {
  title: string;
  description: string;
  checkpoints: string[];
  productImageUrl?: string | null;
  bgColor: string;
  accentColor: string;
  onUpdate?: (field: string, value: string) => void;
}

export default function SolutionSection({
  title, description, checkpoints, productImageUrl, bgColor, accentColor, onUpdate,
}: SolutionSectionProps) {
  return (
    <div className="w-[860px] py-16 px-14 flex gap-12" style={{ backgroundColor: '#FFFFFF' }}>
      {/* 좌측: 제품 이미지 */}
      <div className="flex-shrink-0 w-[320px] flex items-center justify-center">
        <div
          className="w-full rounded-3xl p-8 flex items-center justify-center"
          style={{
            backgroundColor: `${bgColor}0A`,
            minHeight: 380,
          }}
        >
          {productImageUrl ? (
            <img
              src={productImageUrl}
              alt="제품"
              className="max-w-full max-h-[320px] object-contain"
              style={{ filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.12))' }}
            />
          ) : (
            <div className="w-48 h-56 rounded-2xl border-2 border-dashed border-[#E5E8EB] flex items-center justify-center">
              <span className="text-sm text-[#8B95A1]">제품 이미지</span>
            </div>
          )}
        </div>
      </div>

      {/* 우측: 텍스트 */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-10 h-1 rounded-full mb-5" style={{ backgroundColor: accentColor }} />

        <EditableText
          value={title}
          onChange={v => onUpdate?.('title', v)}
          tag="h2"
          className="text-[30px] font-extrabold tracking-tight text-[#191F28] mb-4"
        />

        <EditableText
          value={description}
          onChange={v => onUpdate?.('description', v)}
          tag="p"
          className="text-[15px] leading-[1.8] text-[#4E5968] mb-8"
        />

        {/* 체크 포인트 */}
        <div className="space-y-3">
          {checkpoints.map((cp, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                <Check className="w-4 h-4 text-white" />
              </div>
              <EditableText
                value={cp}
                onChange={v => onUpdate?.(`checkpoint-${i}`, v)}
                tag="span"
                className="text-[15px] font-semibold text-[#191F28]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
