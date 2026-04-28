'use client';

import EditableText from '../EditableText';
import { Heart, Shield, Award, Star } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  badge?: string;
  productImageUrl?: string | null;
  bgColor: string;
  accentColor: string;
  textColor?: string;
  onUpdate?: (field: string, value: string) => void;
}

export default function HeroSection({
  title, subtitle, badge, productImageUrl, bgColor, accentColor, textColor = '#FFFFFF',
  onUpdate,
}: HeroSectionProps) {
  return (
    <div
      className="relative w-[860px] overflow-hidden"
      style={{ backgroundColor: bgColor, minHeight: 640 }}
    >
      {/* 배경 그라디언트 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, ${adjustColor(bgColor, -30)} 50%, ${adjustColor(bgColor, -50)} 100%)`,
        }}
      />

      {/* 우상단 장식 원 */}
      <div
        className="absolute -top-20 -right-20 rounded-full opacity-10"
        style={{ width: 300, height: 300, backgroundColor: accentColor }}
      />
      <div
        className="absolute top-40 -right-10 rounded-full opacity-5"
        style={{ width: 200, height: 200, backgroundColor: '#FFFFFF' }}
      />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex items-center h-full min-h-[640px] px-16 py-16">
        {/* 좌측: 텍스트 */}
        <div className="flex-1 pr-8">
          {badge && (
            <div className="inline-block mb-6">
              <EditableText
                value={badge}
                onChange={v => onUpdate?.('badge', v)}
                className="px-4 py-1.5 text-xs font-bold tracking-widest rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: accentColor,
                  backdropFilter: 'blur(8px)',
                }}
              />
            </div>
          )}

          <EditableText
            value={title}
            onChange={v => onUpdate?.('title', v)}
            tag="h1"
            className="text-[52px] font-black leading-[1.15] tracking-tight mb-6"
            style={{ color: textColor }}
          />

          <div
            className="w-12 h-1 rounded-full mb-6"
            style={{ backgroundColor: accentColor }}
          />

          <EditableText
            value={subtitle}
            onChange={v => onUpdate?.('subtitle', v)}
            tag="p"
            className="text-lg leading-relaxed opacity-85 max-w-[420px]"
            style={{ color: textColor }}
          />

          {/* 신뢰 배지 */}
          <div className="flex items-center gap-4 mt-10">
            {[
              { icon: Shield, label: '식약처 인정' },
              { icon: Award, label: '100% 국산' },
              { icon: Star, label: '고객 만족' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span className="text-[11px] font-medium" style={{ color: textColor, opacity: 0.8 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 제품 이미지 */}
        <div className="flex-shrink-0 w-[340px] h-[420px] flex items-center justify-center">
          {productImageUrl ? (
            <img
              src={productImageUrl}
              alt="제품"
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
            />
          ) : (
            <div className="w-64 h-80 rounded-2xl border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              <span className="text-sm opacity-40" style={{ color: textColor }}>제품 이미지</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 색상 밝기 조절 유틸
function adjustColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(clean.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(clean.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(clean.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
