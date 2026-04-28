'use client';

import { useState, useCallback } from 'react';
import { Search, TrendingUp, Tag, ShoppingBag, Loader2 } from 'lucide-react';

interface CompetitorProduct {
  title: string;
  price: string;
  image: string;
  mall: string;
  brand: string;
  link: string;
  category: string;
}

interface CompetitorInsights {
  avgPrice: number;
  priceRange: { min: number; max: number };
  topBrands: string[];
  commonKeywords: string[];
  categoryPath: string;
  totalResults: number;
}

interface CompetitorPanelProps {
  productName: string;
  category: string;
  onApplyKeywords?: (keywords: string[]) => void;
}

export default function CompetitorPanel({ productName, category, onApplyKeywords }: CompetitorPanelProps) {
  const [query, setQuery] = useState(productName || '');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<CompetitorProduct[]>([]);
  const [insights, setInsights] = useState<CompetitorInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/competitor-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), display: 20 }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
        setInsights(data.data.insights);
      } else {
        setError(data.error || '검색 실패');
      }
    } catch (e) {
      setError('네트워크 오류');
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="space-y-4">
      {/* 검색 바 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="검색어 (예: 세럼, 홍삼)"
          className="flex-1 px-3 py-2 text-sm border border-[#E5E8EB] rounded-lg focus:ring-2 focus:ring-[#3182F6]/30 focus:border-[#3182F6] outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-3 py-2 bg-[#3182F6] text-white rounded-lg hover:bg-[#1E67D9] transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
      )}

      {/* 인사이트 카드 */}
      {insights && (
        <div className="space-y-3">
          {/* 가격 분석 */}
          <div className="bg-[#EBF4FF] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#3182F6]" />
              <span className="text-[11px] font-bold text-[#3182F6]">가격 분석</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[16px] font-black text-[#191F28]">
                  {insights.avgPrice.toLocaleString()}원
                </div>
                <div className="text-[9px] text-[#8B95A1]">평균가</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#4E5968]">
                  {insights.priceRange.min.toLocaleString()}원
                </div>
                <div className="text-[9px] text-[#8B95A1]">최저가</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#4E5968]">
                  {insights.priceRange.max.toLocaleString()}원
                </div>
                <div className="text-[9px] text-[#8B95A1]">최고가</div>
              </div>
            </div>
            <div className="text-[9px] text-[#8B95A1] mt-2 text-right">
              총 {insights.totalResults.toLocaleString()}개 상품
            </div>
          </div>

          {/* 인기 키워드 */}
          <div className="bg-[#F4F5F7] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#4E5968]" />
                <span className="text-[11px] font-bold text-[#4E5968]">인기 키워드</span>
              </div>
              {onApplyKeywords && (
                <button
                  onClick={() => onApplyKeywords(insights.commonKeywords)}
                  className="text-[10px] text-[#3182F6] font-semibold hover:underline"
                >
                  키워드 적용
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {insights.commonKeywords.slice(0, 12).map((kw, i) => (
                <span key={i} className="px-2 py-1 text-[10px] bg-white rounded-md text-[#4E5968] font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* 상위 브랜드 */}
          {insights.topBrands.length > 0 && (
            <div className="bg-[#F4F5F7] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <ShoppingBag className="w-3.5 h-3.5 text-[#4E5968]" />
                <span className="text-[11px] font-bold text-[#4E5968]">상위 브랜드</span>
              </div>
              <div className="space-y-1">
                {insights.topBrands.map((brand, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#3182F6] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[11px] text-[#191F28]">{brand}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 상품 목록 */}
      {products.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#8B95A1] mb-2">경쟁 상품</div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {products.slice(0, 10).map((product, i) => (
              <a
                key={i}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 p-2 rounded-lg hover:bg-[#F4F5F7] transition-colors"
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-[#191F28] truncate">
                    {product.title}
                  </div>
                  <div className="text-[11px] font-bold text-[#3182F6]">
                    {parseInt(product.price).toLocaleString()}원
                  </div>
                  <div className="text-[9px] text-[#8B95A1]">
                    {product.mall} {product.brand && `· ${product.brand}`}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
