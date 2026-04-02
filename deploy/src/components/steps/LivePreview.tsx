'use client';

import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import { CategoryKey } from '@/lib/types';

export default function LivePreview() {
  const { state } = useDetailPage();
  const { productInfo, productPhotos, extractedUSPs } = state;

  const categoryLabel = productInfo.category
    ? CATEGORIES[productInfo.category as CategoryKey]?.label
    : null;

  return (
    <div className="rounded-xl border border-[#3182F6]/30 bg-white p-5 sticky top-6">
      <h3 className="text-sm font-bold text-[#191F28] mb-4">Live Preview</h3>

      {/* Product name */}
      <p className="text-sm font-semibold text-[#191F28] mb-3">
        {productInfo.name || '[Product Name Here]'}
      </p>

      {/* Image placeholder */}
      {productPhotos.length > 0 ? (
        <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-[#F4F5F7]">
          <img
            src={productPhotos[0].dataUrl}
            alt={productPhotos[0].name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] rounded-lg bg-[#F4F5F7] flex items-center justify-center mb-3">
          <span className="text-xs text-[#D1D6DB]">[Image Placeholder]</span>
        </div>
      )}

      {/* Features / USPs */}
      {extractedUSPs.length > 0 ? (
        <div className="space-y-1.5 mb-3">
          {extractedUSPs.slice(0, 3).map((usp) => (
            <p key={usp.id} className="text-xs text-[#4E5968]">[{usp.title}]</p>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5 mb-3">
          <p className="text-xs text-[#D1D6DB]">[Feature 1]</p>
          <p className="text-xs text-[#D1D6DB]">[Feature 2]</p>
        </div>
      )}

      {/* Category badge */}
      {categoryLabel && (
        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#3182F6]/10 text-[#3182F6] font-medium">
          {categoryLabel}
        </span>
      )}

      {/* Price placeholder */}
      <p className="text-xs text-[#D1D6DB] mt-2">[Price Placeholder]</p>
    </div>
  );
}
