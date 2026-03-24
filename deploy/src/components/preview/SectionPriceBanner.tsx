'use client';

import { useState } from 'react';
import { PriceBannerContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';

interface SectionPriceBannerProps {
  content: PriceBannerContent;
  sectionId: string;
}

export default function SectionPriceBanner({ content, sectionId }: SectionPriceBannerProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(content);

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#c3c0ff';

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: editData } } });
    setIsEditing(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (isEditing) {
    return (
      <div className="p-6 space-y-4 bg-[#1c1b1b]">
        <h3 className="font-headline font-bold text-[#e5e2e1] mb-4">가격 배너 편집</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#c7c4d8] mb-1">정상가</label>
            <input
              type="number"
              value={editData.originalPrice}
              onChange={(e) => setEditData({ ...editData, originalPrice: Number(e.target.value) })}
              className="w-full bg-[#201f1f] border-b border-[#464555]/20 px-2 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#c7c4d8] mb-1">할인가</label>
            <input
              type="number"
              value={editData.salePrice}
              onChange={(e) => setEditData({ ...editData, salePrice: Number(e.target.value) })}
              className="w-full bg-[#201f1f] border-b border-[#464555]/20 px-2 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#c7c4d8] mb-1">할인율 (%)</label>
          <input
            type="number"
            value={editData.discountRate}
            onChange={(e) => setEditData({ ...editData, discountRate: Number(e.target.value) })}
            className="w-full bg-[#201f1f] border-b border-[#464555]/20 px-2 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#c7c4d8] mb-1">이벤트 문구</label>
          <input
            value={editData.eventText}
            onChange={(e) => setEditData({ ...editData, eventText: e.target.value })}
            className="w-full bg-[#201f1f] border-b border-[#464555]/20 px-2 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff]"
            placeholder="오늘만 특가!"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#c7c4d8]">
          <input
            type="checkbox"
            checked={editData.freeShipping}
            onChange={(e) => setEditData({ ...editData, freeShipping: e.target.checked })}
            className="rounded"
          />
          무료배송
        </label>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm rounded-full text-[#c7c4d8] hover:bg-[#2a2a2a]">취소</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm rounded-full primary-gradient text-[#0f0069] font-bold">저장</button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-editable relative cursor-pointer" onClick={() => setIsEditing(true)}>
      <div
        className="py-10 px-8 text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #1a1a2e 0%, ${primaryColor}20 50%, #1a1a2e 100%)`,
        }}
      >
        <div className="section-edit-overlay">
          <span className="px-3 py-1.5 rounded-full bg-[#201f1f] shadow-md text-xs text-[#c7c4d8] border border-[#464555]/20">클릭하여 편집</span>
        </div>

        {/* 이벤트 문구 뱃지 */}
        {content.eventText && (
          <div className="inline-block mb-4">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-bold animate-pulse"
              style={{ backgroundColor: '#ff4757', color: '#fff' }}
            >
              {content.eventText}
            </span>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 flex-wrap">
          {/* 정상가 (취소선) */}
          {content.originalPrice > content.salePrice && (
            <div className="text-[#e5e2e1]/40">
              <span className="text-sm">정상가</span>
              <p className="text-xl line-through">{formatPrice(content.originalPrice)}원</p>
            </div>
          )}

          {/* 할인가 */}
          <div className="text-center">
            <p className="text-4xl sm:text-5xl font-extrabold font-headline" style={{ color: primaryColor }}>
              {formatPrice(content.salePrice)}
              <span className="text-2xl">원</span>
            </p>
          </div>

          {/* 할인율 뱃지 */}
          {content.discountRate > 0 && (
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full font-extrabold text-lg"
              style={{ backgroundColor: '#ff4757', color: '#fff' }}
            >
              {content.discountRate}%
            </div>
          )}
        </div>

        {/* 무료배송 */}
        {content.freeShipping && (
          <div className="mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#2ed573]/20 text-[#2ed573] border border-[#2ed573]/30">
              무료배송
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
