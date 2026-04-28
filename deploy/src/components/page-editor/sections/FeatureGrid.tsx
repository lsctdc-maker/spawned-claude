'use client';

import EditableText from '../EditableText';
import { Heart, Shield, Zap, Plus, Activity, Brain, Leaf, Sparkles, Check, Star } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  heart: Heart, shield: Shield, zap: Zap, plus: Plus,
  activity: Activity, brain: Brain, leaf: Leaf, sparkles: Sparkles,
  check: Check, star: Star,
};

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FeatureGridProps {
  sectionTitle: string;
  items: FeatureItem[];
  bgColor: string;
  accentColor: string;
  textColor?: string;
  columns?: 3 | 4;
  onUpdate?: (field: string, value: string) => void;
  onUpdateItem?: (index: number, field: string, value: string) => void;
}

export default function FeatureGrid({
  sectionTitle, items, bgColor, accentColor, textColor = '#FFFFFF',
  columns = items.length <= 3 ? 3 : 4,
  onUpdate, onUpdateItem,
}: FeatureGridProps) {
  const isDark = isDarkColor(bgColor);
  const cardBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const iconBg = isDark ? 'rgba(255,255,255,0.12)' : `${accentColor}12`;
  const iconColor = isDark ? '#FFFFFF' : accentColor;
  const titleColor = isDark ? '#FFFFFF' : '#191F28';
  const descColor = isDark ? 'rgba(255,255,255,0.75)' : '#4E5968';

  return (
    <div className="w-[860px] py-16 px-14" style={{ backgroundColor: bgColor }}>
      {/* 섹션 제목 */}
      <div className="text-center mb-12">
        <div className="w-8 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: accentColor }} />
        <EditableText
          value={sectionTitle}
          onChange={v => onUpdate?.('sectionTitle', v)}
          tag="h2"
          className="text-[32px] font-extrabold tracking-tight"
          style={{ color: titleColor }}
        />
      </div>

      {/* 카드 그리드 */}
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {items.map((item, i) => {
          const Icon = ICON_MAP[item.icon] || Heart;
          return (
            <div
              key={i}
              className="rounded-2xl p-7 text-center transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* 아이콘 원형 */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: iconBg }}
              >
                <Icon className="w-7 h-7" style={{ color: iconColor }} />
              </div>

              {/* 제목 */}
              <EditableText
                value={item.title}
                onChange={v => onUpdateItem?.(i, 'title', v)}
                tag="h3"
                className="text-base font-bold mb-2"
                style={{ color: titleColor }}
              />

              {/* 설명 */}
              <EditableText
                value={item.description}
                onChange={v => onUpdateItem?.(i, 'description', v)}
                tag="p"
                className="text-sm leading-relaxed"
                style={{ color: descColor }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function isDarkColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
