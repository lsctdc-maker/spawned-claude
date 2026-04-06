import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth-server';
import { getCategoryStyleModifiers, getCategoryImageContext } from '@/lib/design-knowledge';

// ===== 카테고리별 검색 키워드 (Unsplash/Pexels용) =====
const searchKeywords: Record<string, Record<string, string>> = {
  food: {
    hero: 'food presentation gourmet plating restaurant',
    background: 'marble surface kitchen ingredients flat lay',
    lifestyle: 'cooking kitchen warm home meal preparation',
    feature: 'food texture fresh ingredients closeup',
  },
  cosmetics: {
    hero: 'luxury cosmetic display elegant beauty',
    background: 'pink marble surface beauty skincare',
    lifestyle: 'skincare routine self care morning',
    feature: 'cosmetic texture cream serum closeup',
  },
  health: {
    hero: 'wellness health natural supplement clean',
    background: 'green leaves natural clean white surface',
    lifestyle: 'healthy lifestyle yoga meditation morning',
    feature: 'natural herbs botanical ingredients closeup',
  },
  electronics: {
    hero: 'tech gadget modern studio dark',
    background: 'dark desk surface modern workspace',
    lifestyle: 'workspace modern tech office setup',
    feature: 'circuit board technology texture closeup',
  },
  fashion: {
    hero: 'fashion editorial studio minimal',
    background: 'fabric texture neutral backdrop fashion',
    lifestyle: 'street style urban fashion outfit',
    feature: 'fabric weave textile texture closeup',
  },
  living: {
    hero: 'cozy home interior warm living room',
    background: 'wooden surface home decor natural',
    lifestyle: 'home lifestyle cozy morning routine',
    feature: 'wood grain natural material texture closeup',
  },
  pets: {
    hero: 'happy pet dog cat home warm',
    background: 'cozy home pet friendly warm floor',
    lifestyle: 'pet owner playing walking dog cat',
    feature: 'pet fur soft warm texture closeup',
  },
  kids: {
    hero: 'bright colorful children playful safe',
    background: 'pastel colorful playful background clean',
    lifestyle: 'children playing happy family indoor',
    feature: 'colorful toy blocks texture closeup',
  },
  sports: {
    hero: 'sports fitness dynamic action energy',
    background: 'gym floor track field athletic surface',
    lifestyle: 'outdoor workout fitness running exercise',
    feature: 'sports equipment texture material closeup',
  },
  interior: {
    hero: 'beautiful room interior design styled',
    background: 'interior wall floor neutral design',
    lifestyle: 'home decor interior styling cozy',
    feature: 'interior material marble stone texture',
  },
  automotive: {
    hero: 'car automotive sleek modern road',
    background: 'garage concrete road surface dark',
    lifestyle: 'driving road trip car lifestyle',
    feature: 'car paint metallic surface texture closeup',
  },
  stationery: {
    hero: 'desk setup stationery minimal workspace',
    background: 'clean desk white surface organized',
    lifestyle: 'creative workspace writing journaling',
    feature: 'paper notebook texture closeup minimal',
  },
  beverages: {
    hero: 'premium drink bar cocktail atmospheric',
    background: 'bar counter surface dark wood',
    lifestyle: 'cafe coffee morning relaxation drink',
    feature: 'liquid splash drink texture closeup',
  },
  digital: {
    hero: 'modern workspace screen mockup tech',
    background: 'clean desk tech setup surface',
    lifestyle: 'remote work digital nomad creative',
    feature: 'screen pixel digital gradient abstract',
  },
  others: {
    hero: 'product photography clean studio minimal',
    background: 'clean white surface studio backdrop',
    lifestyle: 'lifestyle product everyday minimal',
    feature: 'surface material texture closeup clean',
  },
};

// ===== 톤별 추가 검색 키워드 =====
const toneKeywords: Record<string, string> = {
  trust: 'professional clean confident',
  emotional: 'warm cozy soft golden light',
  impact: 'bold dramatic high contrast dark',
};

// ===== DALL-E 편집용 톤 프롬프트 =====
const toneEditPrompts: Record<string, string> = {
  trust: 'Adjust to professional, clean, trustworthy feel with balanced lighting and neutral tones',
  emotional: 'Adjust to warm, cozy, inviting atmosphere with soft golden lighting and gentle tones',
  impact: 'Adjust to bold, energetic, high-contrast look with dramatic lighting and vivid colors',
};

// ===== 검색 쿼리 빌드 =====
function buildSearchQuery(
  type: 'hero' | 'background' | 'lifestyle' | 'feature',
  category: string,
  tone: string,
): string {
  const catKeywords = searchKeywords[category] || searchKeywords.others;
  const typeKeywords = catKeywords[type] || catKeywords.hero;
  const toneExtra = toneKeywords[tone] || toneKeywords.trust;
  return `${typeKeywords} ${toneExtra}`;
}

// ===== imageGuide → 영문 검색 키워드 변환 (GPT-4o-mini) =====
async function buildSmartQuery(
  imageGuide: string,
  category: string,
  tone: string,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !imageGuide.trim()) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You convert Korean image descriptions into 5-8 English search keywords for stock photo sites (Unsplash/Pexels). Return ONLY space-separated keywords, no explanation. Focus on visual elements, mood, and composition. Never include brand names or product-specific terms.',
          },
          {
            role: 'user',
            content: `Category: ${category}\nTone: ${tone}\nStyle: ${getCategoryStyleModifiers(category as any)}\nImage description: ${imageGuide}`,
          },
        ],
        max_tokens: 60,
        temperature: 0.3,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const keywords = data.choices?.[0]?.message?.content?.trim();
    if (!keywords || keywords.length < 5) return null;

    return keywords;
  } catch {
    return null;
  }
}

// ===== Unsplash 검색 =====
async function searchUnsplash(
  query: string,
  orientation: 'landscape' | 'squarish',
): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const params = new URLSearchParams({
      query,
      orientation,
      per_page: '5',
      content_filter: 'high',
    });

    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!res.ok) {
      console.error('Unsplash API error:', res.status, await res.text().catch(() => ''));
      return null;
    }

    const data = await res.json();
    const results = data.results;
    if (!results || results.length === 0) return null;

    // 랜덤 선택 (상위 5개 중)
    const pick = results[Math.floor(Math.random() * Math.min(results.length, 5))];
    return pick.urls?.regular || pick.urls?.full || null;
  } catch (err) {
    console.error('Unsplash search failed:', err);
    return null;
  }
}

// ===== Pexels 검색 =====
async function searchPexels(
  query: string,
  orientation: 'landscape' | 'square',
): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      query,
      orientation,
      per_page: '5',
    });

    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) {
      console.error('Pexels API error:', res.status, await res.text().catch(() => ''));
      return null;
    }

    const data = await res.json();
    const photos = data.photos;
    if (!photos || photos.length === 0) return null;

    // 랜덤 선택 (상위 5개 중)
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 5))];
    return pick.src?.large || pick.src?.original || null;
  } catch (err) {
    console.error('Pexels search failed:', err);
    return null;
  }
}

// ===== 이미지 다운로드 → base64 프록시 =====
async function downloadAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

// ===== DALL-E 편집 (톤/분위기 보정) =====
async function editWithDallE(
  imageUrl: string,
  tone: string,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    // 1. 원본 이미지 다운로드
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    // 2. PNG로 변환 (DALL-E edit는 PNG만 지원)
    //    sharp 없이 raw buffer를 PNG로 전달 — 이미 JPEG/PNG일 것
    const editPrompt = toneEditPrompts[tone] || toneEditPrompts.trust;

    // 3. FormData 구성
    const formData = new FormData();
    formData.append('model', 'dall-e-2');
    formData.append('image', new Blob([imgBuffer], { type: 'image/png' }), 'image.png');
    formData.append('prompt', editPrompt);
    formData.append('n', '1');
    formData.append('size', '1024x1024');
    formData.append('response_format', 'b64_json');

    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('DALL-E edit API error:', res.status, errText);
      return null;
    }

    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return null;

    return `data:image/png;base64,${b64}`;
  } catch (err) {
    console.error('DALL-E edit failed:', err);
    return null;
  }
}

// ===== DALL-E 3 직접 생성 (최종 fallback) =====
async function generateWithDallE3(
  type: 'hero' | 'background' | 'lifestyle' | 'feature',
  category: string,
  tone: string,
  imageGuide?: string,
  productName?: string,
  usps?: string[],
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const categoryLabels: Record<string, string> = {
    food: 'gourmet food', cosmetics: 'luxury cosmetic', health: 'wellness',
    electronics: 'modern tech', fashion: 'fashion', living: 'home living',
    pets: 'pet care', kids: "children's", sports: 'sports equipment',
    interior: 'interior design', automotive: 'automotive', stationery: 'stationery',
    beverages: 'premium beverage', digital: 'digital product', others: 'consumer',
  };

  const toneStyles: Record<string, string> = {
    trust: 'professional, trustworthy, clean',
    emotional: 'warm, inviting, soft, cozy',
    impact: 'bold, energetic, high-contrast',
  };

  const label = categoryLabels[category] || 'consumer';
  const toneStyle = toneStyles[tone] || toneStyles.trust;
  const noText = 'CRITICAL: The image must contain absolutely NO text, NO words, NO letters, NO numbers, NO logos, NO watermarks. Pure visual imagery only.';

  // 카테고리별 스타일 키워드 (실제 한국 상세페이지 분석 기반)
  const styleModifiers = getCategoryStyleModifiers(category as any);

  // imageGuide가 있으면 프롬프트에 포함
  const guideContext = imageGuide ? ` Scene description: ${imageGuide}.` : '';

  // 제품 컨텍스트: 제품명과 USP를 분위기/환경 생성에 활용
  const productContext = productName && productName !== '제품'
    ? ` This background is for a product called "${productName}".${usps?.length ? ` Key selling points: ${usps.join(', ')}.` : ''} DO NOT draw the product itself — only create the environment, mood, and atmosphere that matches this product.`
    : '';

  const prompts: Record<string, string> = {
    hero: `${noText} Wide panoramic background scene for ${label} product landing page.${guideContext}${productContext} Style: ${styleModifiers}. ${toneStyle}. High-end commercial photography, 8k.`,
    background: `${noText} Beautiful background surface for ${label} product photography.${guideContext}${productContext} Style: ${styleModifiers}. No product, just environment. ${toneStyle}. Shallow depth of field, 8k.`,
    lifestyle: `${noText} Lifestyle scene environment for ${label} products.${guideContext}${productContext} Style: ${styleModifiers}. ${toneStyle}. Natural, candid atmosphere. Commercial lifestyle photography, 8k.`,
    feature: `${noText} Abstract close-up texture related to ${label}.${guideContext}${productContext} Style: ${styleModifiers}. ${toneStyle}. Macro photography, studio lighting, 8k.`,
  };

  try {
    const size = type === 'hero' ? '1792x1024' : '1024x1024';
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompts[type] || prompts.hero,
        n: 1,
        size,
        quality: 'standard',
        response_format: 'url',
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const dalleUrl = data.data?.[0]?.url;
    if (!dalleUrl) return null;

    // base64 프록시
    return await downloadAsBase64(dalleUrl);
  } catch {
    return null;
  }
}

// ===== placeholder 이미지 (모든 API 실패 시) =====
function getPlaceholderUrl(type: string, productName: string): string {
  const colors: Record<string, string> = {
    hero: '6366f1/ffffff',
    background: '8b5cf6/ffffff',
    lifestyle: 'ec4899/ffffff',
    feature: '14b8a6/ffffff',
  };
  const color = colors[type] || '6b7280/ffffff';
  const label = encodeURIComponent(`${productName} - ${type}`);
  const width = type === 'hero' ? 1792 : 1024;
  return `https://placehold.co/${width}x1024/${color}?text=${label}&font=pretendard`;
}

// ===== POST 핸들러: 3단계 파이프라인 =====
export async function POST(request: NextRequest) {
  // Auth is optional for image generation — allows demo/seed flow without login
  // Authenticated users get priority, but unauthenticated requests still work
  // Auth is checked but not enforced — demo/seed flow works without login
  const authResult = await requireAuth(request);
  const isAuthenticated = !isAuthError(authResult);

  try {
    const body = await request.json();
    const {
      type = 'hero',
      productName = '제품',
      category = 'others',
      tone = 'trust',
      imageGuide = '',
      usps = [],
    } = body;

    const orientation = type === 'hero' ? 'landscape' : 'squarish';
    const pexelsOrientation = type === 'hero' ? 'landscape' : 'square';

    // ===== Step 1: 스톡 이미지 검색 =====
    // imageGuide가 있으면 GPT-4o-mini로 스마트 검색어 생성, 없으면 기존 키워드 매핑
    let query: string;
    const smartQuery = imageGuide ? await buildSmartQuery(imageGuide, category, tone) : null;
    if (smartQuery) {
      query = smartQuery;
      console.log(`[image] Smart query from imageGuide: "${query}"`);
    } else {
      query = buildSearchQuery(type as any, category, tone);
      console.log(`[image] Fallback to keyword query: "${query}"`);
    }
    console.log(`[image] auth=${isAuthenticated}, type=${type}, category=${category}`);

    let stockUrl: string | null = null;
    let source: 'unsplash' | 'pexels' | 'dalle' | 'placeholder' = 'placeholder';

    // Unsplash 우선
    stockUrl = await searchUnsplash(query, orientation);
    if (stockUrl) {
      source = 'unsplash';
      console.log(`[image] Unsplash hit`);
    }

    // Pexels fallback
    if (!stockUrl) {
      stockUrl = await searchPexels(query, pexelsOrientation);
      if (stockUrl) {
        source = 'pexels';
        console.log(`[image] Pexels hit`);
      }
    }

    // ===== Step 2: 스톡 이미지 base64 변환 =====
    if (stockUrl) {
      console.log(`[image] Downloading stock image as base64`);
      const stockBase64 = await downloadAsBase64(stockUrl);
      if (stockBase64) {
        return NextResponse.json({
          success: true,
          imageUrl: stockBase64,
          isPlaceholder: false,
          source,
        });
      }
      console.log(`[image] Stock image download failed`);
    }

    // ===== Step 3: DALL-E 3 직접 생성 (최종 fallback) =====
    console.log(`[image] Stock search failed → falling back to DALL-E 3 generation`);
    const dalleBase64 = await generateWithDallE3(type as any, category, tone, imageGuide || undefined, productName, usps);
    if (dalleBase64) {
      return NextResponse.json({
        success: true,
        imageUrl: dalleBase64,
        isPlaceholder: false,
        source: 'dalle' as const,
      });
    }

    // ===== 모든 방법 실패 → placeholder =====
    console.log(`[image] All methods failed → placeholder`);
    return NextResponse.json({
      success: true,
      imageUrl: getPlaceholderUrl(type, productName),
      isPlaceholder: true,
      source: 'placeholder' as const,
      message: '이미지 API를 사용할 수 없어 placeholder를 사용합니다.',
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { success: false, error: '이미지 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
