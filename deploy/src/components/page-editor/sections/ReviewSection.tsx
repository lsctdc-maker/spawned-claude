'use client';

import EditableText from '../EditableText';
import { Star, Quote } from 'lucide-react';

interface Review {
  text: string;
  author: string;
  rating: number;
}

interface ReviewSectionProps {
  title: string;
  reviews: Review[];
  accentColor: string;
  bgColor: string;
  onUpdate?: (field: string, value: string) => void;
}

export default function ReviewSection({
  title, reviews, accentColor, bgColor, onUpdate,
}: ReviewSectionProps) {
  return (
    <div
      className="w-[860px] py-20 px-16 text-center"
      style={{
        background: `linear-gradient(180deg, ${bgColor} 0%, ${adjustColor(bgColor, -20)} 100%)`,
      }}
    >
      <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />
      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight text-white mb-14"
      />

      {/* 리뷰 카드 */}
      <div className="flex justify-center gap-5">
        {reviews.map((review, i) => (
          <div key={i} className="w-[250px] bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>

            {/* 별점 */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className="w-4 h-4"
                  fill={s < review.rating ? '#FFD700' : 'transparent'}
                  stroke={s < review.rating ? '#FFD700' : 'rgba(255,255,255,0.3)'}
                />
              ))}
            </div>

            {/* 인용문 */}
            <EditableText
              value={`"${review.text}"`}
              onChange={v => onUpdate?.(`review-${i}`, v)}
              tag="p"
              className="text-[14px] leading-[1.8] text-white/90 mb-4 min-h-[80px]"
            />

            {/* 작성자 */}
            <div className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
              — {review.author}
            </div>
          </div>
        ))}
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
