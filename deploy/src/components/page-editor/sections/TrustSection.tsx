'use client';

import EditableText from '../EditableText';
import { Shield, Award, BadgeCheck, Leaf, CheckCircle } from 'lucide-react';

interface TrustSectionProps {
  title: string;
  badges: string[];
  accentColor: string;
  onUpdate?: (field: string, value: string) => void;
}

const ICONS = [Shield, Award, BadgeCheck, Leaf, CheckCircle];

export default function TrustSection({
  title, badges, accentColor, onUpdate,
}: TrustSectionProps) {
  return (
    <div className="w-[860px] py-20 px-16 text-center" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: accentColor }} />
      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight text-[#191F28] mb-14"
      />

      {/* 인증 배지 — 가로 배치 */}
      <div className="flex justify-center gap-8">
        {badges.map((badge, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={i} className="text-center">
              {/* 큰 원형 배지 */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  backgroundColor: `${accentColor}10`,
                  border: `2px solid ${accentColor}30`,
                }}
              >
                <Icon className="w-9 h-9" style={{ color: accentColor }} />
              </div>

              {/* 라벨 */}
              <EditableText
                value={badge}
                onChange={v => onUpdate?.(`badge-${i}`, v)}
                tag="span"
                className="text-[12px] font-bold text-[#191F28] block max-w-[100px]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
