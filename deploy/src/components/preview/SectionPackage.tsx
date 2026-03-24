'use client';

import { useState } from 'react';
import { PackageContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';

interface SectionPackageProps {
  content: PackageContent;
  sectionId: string;
}

export default function SectionPackage({ content, sectionId }: SectionPackageProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(content);

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#c3c0ff';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: editData } } });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-6 space-y-6 bg-[#1c1b1b]">
        <h3 className="font-headline font-bold text-[#e5e2e1] mb-4">구성품/패키지 편집</h3>
        {editData.items.map((item, idx) => (
          <div key={idx} className="mb-4 p-4 rounded-xl bg-[#201f1f] border border-[#464555]/15 space-y-2">
            <div className="flex gap-2">
              <input
                value={item.icon || ''}
                onChange={(e) => { const newItems = [...editData.items]; newItems[idx] = { ...newItems[idx], icon: e.target.value }; setEditData({ ...editData, items: newItems }); }}
                className="w-16 h-10 bg-[#1c1b1b] border-b border-[#464555]/20 px-2 py-2 text-center text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff]"
                placeholder="아이콘"
              />
              <input
                value={item.name}
                onChange={(e) => { const newItems = [...editData.items]; newItems[idx] = { ...newItems[idx], name: e.target.value }; setEditData({ ...editData, items: newItems }); }}
                className="flex-1 bg-[#1c1b1b] border-b border-[#464555]/20 px-2 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff]"
                placeholder="구성품명"
              />
            </div>
            <textarea
              value={item.description}
              onChange={(e) => { const newItems = [...editData.items]; newItems[idx] = { ...newItems[idx], description: e.target.value }; setEditData({ ...editData, items: newItems }); }}
              className="w-full bg-[#1c1b1b] border-b border-[#464555]/20 px-2 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff]"
              placeholder="설명"
              rows={2}
            />
            <input
              type="number"
              value={item.price || ''}
              onChange={(e) => { const newItems = [...editData.items]; newItems[idx] = { ...newItems[idx], price: Number(e.target.value) || undefined }; setEditData({ ...editData, items: newItems }); }}
              className="w-full bg-[#1c1b1b] border-b border-[#464555]/20 px-2 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff]"
              placeholder="개별 가격 (선택)"
            />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#c7c4d8] mb-1">합산 정상가</label>
            <input
              type="number"
              value={editData.totalOriginalPrice}
              onChange={(e) => setEditData({ ...editData, totalOriginalPrice: Number(e.target.value) })}
              className="w-full bg-[#201f1f] border-b border-[#464555]/20 px-2 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#c7c4d8] mb-1">세트 할인가</label>
            <input
              type="number"
              value={editData.totalSalePrice}
              onChange={(e) => setEditData({ ...editData, totalSalePrice: Number(e.target.value) })}
              className="w-full bg-[#201f1f] border-b border-[#464555]/20 px-2 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#c3c0ff]"
            />
          </div>
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
    <div className="section-editable relative cursor-pointer py-16 px-8" onClick={() => setIsEditing(true)} style={{ backgroundColor: `${primaryColor}08` }}>
      <div className="section-edit-overlay">
        <span className="px-3 py-1.5 rounded-full bg-[#201f1f] shadow-md text-xs text-[#c7c4d8] border border-[#464555]/20">클릭하여 편집</span>
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-center mb-12" style={{ color: primaryColor }}>구성품 & 가격</h2>

        {/* 구성품 목록 */}
        <div className="space-y-4 mb-10">
          {content.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#201f1f] border border-[#464555]/10">
              <span className="text-3xl flex-shrink-0">{item.icon || '📦'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#e5e2e1]">{item.name}</h3>
                <p className="text-sm text-[#c7c4d8] mt-0.5">{item.description}</p>
              </div>
              {item.price && (
                <span className="text-sm font-bold flex-shrink-0" style={{ color: primaryColor }}>
                  {formatPrice(item.price)}원
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 가격 요약 */}
        <div className="rounded-xl border border-[#464555]/15 overflow-hidden">
          <div className="p-6 bg-[#201f1f]">
            {content.totalOriginalPrice > content.totalSalePrice && (
              <div className="flex justify-between items-center mb-3 text-[#e5e2e1]/40">
                <span>개별 구매 시</span>
                <span className="text-lg line-through">{formatPrice(content.totalOriginalPrice)}원</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#e5e2e1]">세트 특가</span>
              <span className="text-3xl font-extrabold font-headline" style={{ color: primaryColor }}>
                {formatPrice(content.totalSalePrice)}원
              </span>
            </div>
            {content.totalOriginalPrice > content.totalSalePrice && (
              <div className="text-right mt-1">
                <span className="text-sm font-bold" style={{ color: '#ff4757' }}>
                  {formatPrice(content.totalOriginalPrice - content.totalSalePrice)}원 할인!
                </span>
              </div>
            )}
          </div>
          {content.freeShipping && (
            <div className="px-6 py-3 text-center text-sm font-medium" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
              무료배송
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
