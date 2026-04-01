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
  const primaryColor = category?.primary || '#3182F6';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: editData } } });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-6 space-y-6 bg-white">
        <h3 className="font-headline font-bold text-[#191F28] mb-4">구성품/패키지 편집</h3>
        {editData.items.map((item, idx) => (
          <div key={idx} className="mb-4 p-4 rounded-xl bg-[#F4F5F7] border border-[#E5E8EB]/15 space-y-2">
            <div className="flex gap-2">
              <input
                value={item.icon || ''}
                onChange={(e) => { const newItems = [...editData.items]; newItems[idx] = { ...newItems[idx], icon: e.target.value }; setEditData({ ...editData, items: newItems }); }}
                className="w-16 h-10 bg-white border-b border-[#E5E8EB]/20 px-2 py-2 text-center text-[#191F28] focus:outline-none focus:border-[#3182F6]"
                placeholder="아이콘"
              />
              <input
                value={item.name}
                onChange={(e) => { const newItems = [...editData.items]; newItems[idx] = { ...newItems[idx], name: e.target.value }; setEditData({ ...editData, items: newItems }); }}
                className="flex-1 bg-white border-b border-[#E5E8EB]/20 px-2 py-2 text-[#191F28] focus:outline-none focus:border-[#3182F6]"
                placeholder="구성품명"
              />
            </div>
            <textarea
              value={item.description}
              onChange={(e) => { const newItems = [...editData.items]; newItems[idx] = { ...newItems[idx], description: e.target.value }; setEditData({ ...editData, items: newItems }); }}
              className="w-full bg-white border-b border-[#E5E8EB]/20 px-2 py-2 text-[#191F28] focus:outline-none focus:border-[#3182F6]"
              placeholder="설명"
              rows={2}
            />
            <input
              type="number"
              value={item.price || ''}
              onChange={(e) => { const newItems = [...editData.items]; newItems[idx] = { ...newItems[idx], price: Number(e.target.value) || undefined }; setEditData({ ...editData, items: newItems }); }}
              className="w-full bg-white border-b border-[#E5E8EB]/20 px-2 py-2 text-[#191F28] focus:outline-none focus:border-[#3182F6]"
              placeholder="개별 가격 (선택)"
            />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8B95A1] mb-1">합산 정상가</label>
            <input
              type="number"
              value={editData.totalOriginalPrice}
              onChange={(e) => setEditData({ ...editData, totalOriginalPrice: Number(e.target.value) })}
              className="w-full bg-[#F4F5F7] border-b border-[#E5E8EB]/20 px-2 py-2 text-[#191F28] focus:outline-none focus:border-[#3182F6]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8B95A1] mb-1">세트 할인가</label>
            <input
              type="number"
              value={editData.totalSalePrice}
              onChange={(e) => setEditData({ ...editData, totalSalePrice: Number(e.target.value) })}
              className="w-full bg-[#F4F5F7] border-b border-[#E5E8EB]/20 px-2 py-2 text-[#191F28] focus:outline-none focus:border-[#3182F6]"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#8B95A1]">
          <input
            type="checkbox"
            checked={editData.freeShipping}
            onChange={(e) => setEditData({ ...editData, freeShipping: e.target.checked })}
            className="rounded"
          />
          무료배송
        </label>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm rounded-full text-[#8B95A1] hover:bg-[#F4F5F7]">취소</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm rounded-full primary-gradient text-white font-bold">저장</button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-editable relative cursor-pointer py-16 px-8" onClick={() => setIsEditing(true)} style={{ backgroundColor: `${primaryColor}08` }}>
      <div className="section-edit-overlay">
        <span className="px-3 py-1.5 rounded-full bg-[#F4F5F7] shadow-md text-xs text-[#8B95A1] border border-[#E5E8EB]/20">클릭하여 편집</span>
      </div>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-center mb-12" style={{ color: primaryColor }}>구성품 & 가격</h2>

        {/* 구성품 목록 */}
        <div className="space-y-4 mb-10">
          {content.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#F4F5F7] border border-[#E5E8EB]/10">
              <span className="text-3xl flex-shrink-0">{item.icon || '📦'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#191F28]">{item.name}</h3>
                <p className="text-sm text-[#8B95A1] mt-0.5">{item.description}</p>
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
        <div className="rounded-xl border border-[#E5E8EB]/15 overflow-hidden">
          <div className="p-6 bg-[#F4F5F7]">
            {content.totalOriginalPrice > content.totalSalePrice && (
              <div className="flex justify-between items-center mb-3 text-[#191F28]/40">
                <span>개별 구매 시</span>
                <span className="text-lg line-through">{formatPrice(content.totalOriginalPrice)}원</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#191F28]">세트 특가</span>
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
