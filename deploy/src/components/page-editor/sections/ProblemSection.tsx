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
    <div className="w-[860px] py-16 px-14" style={{ backgroundColor: '#F8F9FA' }}>
      {/* 섹션 제목 */}
      <div className="text-center mb-10">
        <div className="w-8 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: accentColor }} />
        <EditableText
          value={title}
          onChange={v => onUpdate?.('title', v)}
          tag="h2"
          className="text-[32px] font-extrabold tracking-tight text-[#191F28]"
        />
      </div>

      {/* 페인 포인트 카드 */}
      <div className="space-y-4 max-w-[680px] mx-auto">
        {painPoints.map((point, i) => {
          const Icon = ICONS[point.icon] || Frown;
          return (
            <div
              key={i}
              className="flex items-start gap-5 bg-white rounded-2xl px-7 py-6"
              style={{
                boxShadow: '0 2px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)',
                borderLeft: `4px solid ${accentColor}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${accentColor}12` }}
              >
                <Icon className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <EditableText
                value={point.text}
                onChange={v => onUpdateItem?.(i, v)}
                tag="p"
                className="text-[15px] leading-relaxed text-[#4E5968] pt-2.5 flex-1"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
