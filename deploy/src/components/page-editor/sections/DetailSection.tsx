'use client';

import EditableText from '../EditableText';

interface Stat {
  value: string;
  label: string;
}

interface DetailSectionProps {
  title: string;
  description: string;
  stats: Stat[];
  accentColor: string;
  productImageUrl?: string | null;
  onUpdate?: (field: string, value: string) => void;
}

export default function DetailSection({
  title, description, stats, accentColor, productImageUrl, onUpdate,
}: DetailSectionProps) {
  return (
    <div className="w-[860px] py-20 px-16 text-center" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: accentColor }} />
      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight text-[#191F28] mb-6"
      />
      <EditableText
        value={description}
        onChange={v => onUpdate?.('description', v)}
        tag="p"
        className="text-[15px] leading-[1.9] text-[#4E5968] mb-12 max-w-[600px] mx-auto"
      />

      {/* 제품 이미지 */}
      {productImageUrl && (
        <div className="mb-12">
          <img
            src={productImageUrl}
            alt="제품 상세"
            className="h-[220px] object-contain mx-auto"
            style={{ filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.1))' }}
          />
        </div>
      )}

      {/* 수치 카드 — 가로 배치 */}
      <div className="flex justify-center gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="w-[200px] rounded-2xl p-6"
            style={{
              backgroundColor: `${accentColor}08`,
              border: `1px solid ${accentColor}15`,
            }}
          >
            <div
              className="text-[32px] font-black mb-1"
              style={{ color: accentColor }}
            >
              {stat.value}
            </div>
            <div className="text-[12px] font-semibold text-[#4E5968] tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
