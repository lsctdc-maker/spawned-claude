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
  onUpdate?: (field: string, value: string) => void;
  onUpdateItem?: (index: number, field: string, value: string) => void;
}

export default function FeatureGrid({
  sectionTitle, items, bgColor, accentColor, textColor = '#FFFFFF',
  onUpdate, onUpdateItem,
}: FeatureGridProps) {
  const isDark = isDarkColor(bgColor);
  const iconBg = isDark ? 'rgba(255,255,255,0.12)' : `${accentColor}12`;
  const iconColor = isDark ? '#FFFFFF' : accentColor;
  const titleColor = isDark ? '#FFFFFF' : '#191F28';
  const descColor = isDark ? 'rgba(255,255,255,0.75)' : '#4E5968';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)';
  const columns = items.length <= 3 ? 3 : items.length <= 4 ? 2 : 3;

  return (
    <div className="w-[860px] py-20 px-16 text-center" style={{ backgroundColor: bgColor }}>
      {/* 중앙 정렬 섹션 제목 */}
      <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: isDark ? '#FFFFFF50' : accentColor }} />
      <EditableText
        value={sectionTitle}
        onChange={v => onUpdate?.('sectionTitle', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight mb-14"
        style={{ color: titleColor }}
      />

      {/* 카드 그리드 — 중앙 정렬 */}
      <div
        className="grid gap-5 max-w-[720px] mx-auto"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {items.map((item, i) => {
          const Icon = ICON_MAP[item.icon] || Heart;
          return (
            <div
              key={i}
              className="rounded-2xl p-7"
              style={{ backgroundColor: cardBg }}
            >
              {/* 아이콘 원형 — 중앙 */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: iconBg }}
              >
                <Icon className="w-7 h-7" style={{ color: iconColor }} />
              </div>

              {/* 제목 — 중앙 */}
              <EditableText
                value={item.title}
                onChange={v => onUpdateItem?.(i, 'title', v)}
                tag="h3"
                className="text-[16px] font-bold mb-2"
                style={{ color: titleColor }}
              />

              {/* 설명 — 중앙 */}
              <EditableText
                value={item.description}
                onChange={v => onUpdateItem?.(i, 'description', v)}
                tag="p"
                className="text-[13px] leading-[1.7]"
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
