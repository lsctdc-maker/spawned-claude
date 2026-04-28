'use client';

import EditableText from '../EditableText';

interface Step {
  text: string;
}

interface HowToSectionProps {
  title: string;
  steps: Step[];
  accentColor: string;
  bgColor: string;
  onUpdate?: (field: string, value: string) => void;
}

export default function HowToSection({
  title, steps, accentColor, bgColor, onUpdate,
}: HowToSectionProps) {
  return (
    <div className="w-[860px] py-20 px-16 text-center" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: accentColor }} />
      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight text-[#191F28] mb-14"
      />

      {/* 스텝 카드 — 가로 배치, 큰 넘버 원 */}
      <div className="flex justify-center gap-4">
        {steps.map((step, i) => (
          <div key={i} className="w-[190px]">
            {/* 큰 넘버 원 */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[24px] font-black text-white"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 8px 24px ${accentColor}30`,
              }}
            >
              {i + 1}
            </div>

            {/* 연결선 (마지막 제외) — CSS ::after로 대체 */}

            {/* 카드 */}
            <div className="bg-white rounded-2xl p-5 min-h-[100px]"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div className="text-[11px] font-bold mb-2 tracking-wider" style={{ color: accentColor }}>
                STEP {i + 1}
              </div>
              <EditableText
                value={step.text}
                onChange={v => onUpdate?.(`step-${i}`, v)}
                tag="p"
                className="text-[13px] leading-[1.7] text-[#4E5968]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
