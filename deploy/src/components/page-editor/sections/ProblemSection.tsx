'use client';

import EditableText from '../EditableText';
import { AlertTriangle, Frown, HelpCircle, XCircle } from 'lucide-react';

interface PainPoint {
  icon: string;
  text: string;
}

interface ProblemSectionProps {
  title: string;
  painPoints: PainPoint[];
  accentColor: string;
  onUpdate?: (field: string, value: string) => void;
  onUpdateItem?: (index: number, value: string) => void;
}

const ICONS: Record<string, React.ComponentType<any>> = {
  frown: Frown, alert: AlertTriangle, help: HelpCircle, x: XCircle,
};

export default function ProblemSection({
  title, painPoints, accentColor, onUpdate, onUpdateItem,
}: ProblemSectionProps) {
  return (
    <div className="w-[860px] py-20 px-16" style={{ backgroundColor: '#F8F9FA' }}>
      {/* 중앙 정렬 섹션 제목 */}
      <div className="text-center mb-14">
        <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: accentColor }} />
        <EditableText
          value={title}
          onChange={v => onUpdate?.('title', v)}
          tag="h2"
          className="text-[36px] font-black tracking-tight text-[#191F28]"
        />
      </div>

      {/* 카드 가로 배치 — 중앙 정렬 */}
      <div className="flex justify-center gap-5">
        {painPoints.map((point, i) => {
          const Icon = ICONS[point.icon] || Frown;
          return (
            <div
              key={i}
              className="w-[240px] bg-white rounded-2xl px-6 py-8 text-center"
              style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}
            >
              {/* 아이콘 원형 — 중앙 */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Icon className="w-6 h-6" style={{ color: accentColor }} />
              </div>

              {/* 텍스트 — 중앙 */}
              <EditableText
                value={point.text}
                onChange={v => onUpdateItem?.(i, v)}
                tag="p"
                className="text-[14px] leading-[1.8] text-[#4E5968]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
