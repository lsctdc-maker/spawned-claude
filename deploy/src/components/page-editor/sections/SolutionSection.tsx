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
    <div className="w-[860px] py-20 px-16 text-center" style={{ backgroundColor: '#FFFFFF' }}>
      {/* 중앙 정렬 구분선 */}
      <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: accentColor }} />

      {/* 제목 */}
      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight text-[#191F28] mb-6 max-w-[640px] mx-auto"
      />

      {/* 설명 */}
      <EditableText
        value={description}
        onChange={v => onUpdate?.('description', v)}
        tag="p"
        className="text-[15px] leading-[1.9] text-[#4E5968] mb-10 max-w-[600px] mx-auto"
      />

      {/* 제품 이미지 — 중앙 */}
      <div className="mb-12">
        {productImageUrl ? (
          <div
            className="inline-block rounded-3xl p-10"
            style={{ backgroundColor: `${bgColor}08` }}
          >
            <img
              src={productImageUrl}
              alt="제품"
              className="h-[260px] object-contain mx-auto"
              style={{ filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.1))' }}
            />
          </div>
        ) : (
          <div className="w-[280px] h-[260px] rounded-3xl border-2 border-dashed border-[#E5E8EB] mx-auto flex items-center justify-center">
            <span className="text-sm text-[#8B95A1]">제품 이미지</span>
          </div>
        )}
      </div>

      {/* 체크 포인트 — 중앙 정렬 가로 배치 */}
      <div className="flex justify-center gap-6">
        {checkpoints.map((cp, i) => (
          <div key={i} className="flex items-center gap-2.5 px-5 py-3 bg-[#F8F9FA] rounded-full">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <EditableText
              value={cp}
              onChange={v => onUpdate?.(`checkpoint-${i}`, v)}
              tag="span"
              className="text-[14px] font-semibold text-[#191F28]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
