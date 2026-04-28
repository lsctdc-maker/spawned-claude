import { NextRequest, NextResponse } from 'next/server';

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

interface NaverShopItem {
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productId: string;
  productType: string;
  brand: string;
  maker: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
}

interface CompetitorAnalysis {
  products: {
    title: string;
    price: string;
    image: string;
    mall: string;
    brand: string;
    link: string;
    category: string;
  }[];
  insights: {
    avgPrice: number;
    priceRange: { min: number; max: number };
    topBrands: string[];
    commonKeywords: string[];
    categoryPath: string;
    totalResults: number;
  };
}

/**
 * 경쟁사 리서치 API
 *
 * POST /api/competitor-research
 * body: { query: "세럼", display?: 20 }
 *
 * 1) 네이버 쇼핑 검색 API 호출
 * 2) 상위 상품 정보 수집
 * 3) 가격/브랜드/키워드 분석
 * 4) 구조화된 인사이트 반환
 */
export async function POST(request: NextRequest) {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Naver API credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const { query, display = 20 } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'query is required' },
        { status: 400 }
      );
    }

    // 1) 네이버 쇼핑 검색
    const searchUrl = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=${display}&sort=sim`;

    const naverRes = await fetch(searchUrl, {
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
      },
    });

    if (!naverRes.ok) {
      const errText = await naverRes.text();
      console.error('Naver API error:', naverRes.status, errText);
      return NextResponse.json(
        { success: false, error: `Naver API returned ${naverRes.status}` },
        { status: 502 }
      );
    }

    const naverData = await naverRes.json();
    const items: NaverShopItem[] = naverData.items || [];
    const total: number = naverData.total || 0;

    // 2) 상품 정보 정제
    const products = items.map(item => ({
      title: item.title.replace(/<\/?b>/g, ''), // HTML 태그 제거
      price: item.lprice,
      image: item.image,
      mall: item.mallName,
      brand: item.brand || item.maker || '',
      link: item.link,
      category: [item.category1, item.category2, item.category3, item.category4].filter(Boolean).join(' > '),
    }));

    // 3) 인사이트 분석
    const prices = products.map(p => parseInt(p.price)).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // 브랜드 빈도
    const brandCounts: Record<string, number> = {};
    products.forEach(p => {
      if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });
    const topBrands = Object.entries(brandCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([brand]) => brand);

    // 키워드 추출 (제목에서 빈도 높은 단어)
    const wordCounts: Record<string, number> = {};
    products.forEach(p => {
      const words = p.title.split(/[\s/+,()[\]]+/).filter(w => w.length >= 2 && w.length <= 10);
      words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
    });
    const commonKeywords = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);

    // 카테고리 경로 (가장 빈번한 것)
    const catCounts: Record<string, number> = {};
    products.forEach(p => {
      if (p.category) catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });
    const categoryPath = Object.entries(catCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    const analysis: CompetitorAnalysis = {
      products,
      insights: {
        avgPrice,
        priceRange: { min: minPrice, max: maxPrice },
        topBrands,
        commonKeywords,
        categoryPath,
        totalResults: total,
      },
    };

    return NextResponse.json({ success: true, data: analysis });
  } catch (e) {
    console.error('Competitor research error:', e);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
