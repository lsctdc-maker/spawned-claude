'use client';

import EditableText from '../EditableText';

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
      style={{ minHeight: 720 }}
    >
      {/* 배경 그라디언트 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${bgColor} 0%, ${adjustColor(bgColor, -30)} 60%, ${adjustColor(bgColor, -50)} 100%)`,
        }}
      />

      {/* 장식 원 */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
        style={{ backgroundColor: '#FFFFFF' }} />

      {/* 콘텐츠 — 모두 중앙 정렬 */}
      <div className="relative z-10 flex flex-col items-center text-center px-16 py-16">
        {/* 배지 */}
        {badge && (
          <EditableText
            value={badge}
            onChange={v => onUpdate?.('badge', v)}
            className="px-6 py-2 text-[11px] font-bold tracking-[6px] rounded-full mb-10"
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: accentColor,
            }}
          />
        )}

        {/* 제품 이미지 — 중앙 */}
        <div className="mb-10">
          {productImageUrl ? (
            <img
              src={productImageUrl}
              alt="제품"
              className="h-[280px] object-contain mx-auto"
              style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.3))' }}
            />
          ) : (
            <div className="w-[240px] h-[280px] rounded-2xl border-2 border-dashed mx-auto flex items-center justify-center"
              style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              <span className="text-sm opacity-40" style={{ color: textColor }}>제품 이미지</span>
            </div>
          )}
        </div>

        {/* 메인 타이틀 */}
        <EditableText
          value={title}
          onChange={v => onUpdate?.('title', v)}
          tag="h1"
          className="text-[48px] font-black leading-[1.2] tracking-tight mb-5 max-w-[700px]"
          style={{ color: textColor }}
        />

        {/* 구분선 */}
        <div className="w-16 h-[3px] rounded-full mx-auto mb-6"
          style={{ backgroundColor: accentColor }} />

        {/* 서브 카피 */}
        <EditableText
          value={subtitle}
          onChange={v => onUpdate?.('subtitle', v)}
          tag="p"
          className="text-[17px] leading-[1.9] opacity-80 max-w-[580px]"
          style={{ color: textColor }}
        />
      </div>
    </div>
  );
}

function adjustColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(clean.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(clean.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(clean.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
