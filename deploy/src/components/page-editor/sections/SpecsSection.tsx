'use client';

import EditableText from '../EditableText';

interface SpecRow {
  label: string;
  value: string;
}

interface SpecsSectionProps {
  title: string;
  specs: SpecRow[];
  accentColor: string;
  onUpdate?: (field: string, value: string) => void;
  onUpdateSpec?: (index: number, field: string, value: string) => void;
}

export default function SpecsSection({
  title, specs, accentColor, onUpdate, onUpdateSpec,
}: SpecsSectionProps) {
  return (
    <div className="w-[860px] py-20 px-16 text-center" style={{ backgroundColor: '#FFFFFF' }}>
      {/* 중앙 정렬 섹션 제목 */}
      <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: accentColor }} />
      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[32px] font-black tracking-tight text-[#191F28] mb-12"
      />

      {/* 스펙 테이블 — 중앙 정렬 */}
      <div
        className="max-w-[640px] mx-auto rounded-2xl overflow-hidden text-left"
        style={{ border: '1px solid #E5E8EB' }}
      >
        {specs.map((row, i) => (
          <div
            key={i}
            className="flex border-b last:border-b-0"
            style={{
              borderColor: '#E5E8EB',
              backgroundColor: i % 2 === 0 ? '#FAFBFC' : '#FFFFFF',
            }}
          >
            <div className="w-[180px] flex-shrink-0 px-6 py-4 text-center"
              style={{ backgroundColor: i % 2 === 0 ? `${accentColor}08` : 'transparent' }}>
              <EditableText
                value={row.label}
                onChange={v => onUpdateSpec?.(i, 'label', v)}
                tag="span"
                className="text-[13px] font-bold text-[#191F28]"
              />
            </div>
            <div className="flex-1 px-6 py-4 border-l" style={{ borderColor: '#E5E8EB' }}>
              <EditableText
                value={row.value}
                onChange={v => onUpdateSpec?.(i, 'value', v)}
                tag="span"
                className="text-[13px] text-[#4E5968]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
