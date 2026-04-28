'use client';

import EditableText from '../EditableText';
import { ArrowRight, ShoppingCart } from 'lucide-react';

interface CTASectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  bgColor: string;
  accentColor: string;
  productImageUrl?: string | null;
  onUpdate?: (field: string, value: string) => void;
}

export default function CTASection({
  title, subtitle, buttonText, bgColor, accentColor, productImageUrl, onUpdate,
}: CTASectionProps) {
  const textColor = '#FFFFFF';

  return (
    <div
      className="relative w-[860px] overflow-hidden"
      style={{ minHeight: 480 }}
    >
      {/* 배경 그라디언트 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${bgColor} 0%, ${adjustColor(bgColor, -40)} 100%)`,
        }}
      />

      {/* 장식 원 */}
      <div className="absolute -bottom-32 -left-32 w-[320px] h-[320px] rounded-full opacity-5" style={{ backgroundColor: '#FFFFFF' }} />
      <div className="absolute -top-16 right-20 w-[160px] h-[160px] rounded-full opacity-5" style={{ backgroundColor: '#FFFFFF' }} />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[480px] px-16 py-16 text-center">
        {/* 제품 이미지 (작게) */}
        {productImageUrl && (
          <div className="mb-8">
            <img
              src={productImageUrl}
              alt="제품"
              className="h-32 object-contain mx-auto"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.2))' }}
            />
          </div>
        )}

        <EditableText
          value={title}
          onChange={v => onUpdate?.('title', v)}
          tag="h2"
          className="text-[40px] font-black tracking-tight mb-4"
          style={{ color: textColor }}
        />

        <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: accentColor }} />

        <EditableText
          value={subtitle}
          onChange={v => onUpdate?.('subtitle', v)}
          tag="p"
          className="text-lg opacity-80 max-w-[560px] leading-relaxed mb-10"
          style={{ color: textColor }}
        />

        {/* CTA 버튼 */}
        <button
          className="flex items-center gap-3 px-10 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 hover:shadow-2xl"
          style={{
            backgroundColor: accentColor,
            color: '#FFFFFF',
            boxShadow: `0 8px 32px ${accentColor}40`,
          }}
        >
          <ShoppingCart className="w-5 h-5" />
          <EditableText
            value={buttonText}
            onChange={v => onUpdate?.('buttonText', v)}
            tag="span"
            className="text-lg font-bold"
            style={{ color: '#FFFFFF' }}
          />
          <ArrowRight className="w-5 h-5" />
        </button>
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
