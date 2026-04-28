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
    <div className="w-[860px] py-16 px-14" style={{ backgroundColor: '#FFFFFF' }}>
      {/* 섹션 제목 */}
      <div className="mb-10">
        <div className="w-8 h-1 rounded-full mb-4" style={{ backgroundColor: accentColor }} />
        <EditableText
          value={title}
          onChange={v => onUpdate?.('title', v)}
          tag="h2"
          className="text-[28px] font-extrabold tracking-tight text-[#191F28]"
        />
      </div>

      {/* 스펙 테이블 */}
      <div
        className="rounded-2xl overflow-hidden"
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
            <div className="w-[200px] flex-shrink-0 px-6 py-4">
              <EditableText
                value={row.label}
                onChange={v => onUpdateSpec?.(i, 'label', v)}
                tag="span"
                className="text-sm font-bold text-[#191F28]"
              />
            </div>
            <div className="flex-1 px-6 py-4 border-l" style={{ borderColor: '#E5E8EB' }}>
              <EditableText
                value={row.value}
                onChange={v => onUpdateSpec?.(i, 'value', v)}
                tag="span"
                className="text-sm text-[#4E5968]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
