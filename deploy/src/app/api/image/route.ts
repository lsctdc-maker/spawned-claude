import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth-server';

// ===== 카테고리별 프롬프트 스타일 =====
const categoryStyles: Record<string, string> = {
  food: 'clean white marble surface, natural lighting, fresh ingredients, appetizing food photography style',
  cosmetics: 'elegant minimalist background, soft pink/white gradient, luxury beauty product photography',
  health: 'clean medical/wellness aesthetic, green and white tones, trustworthy healthcare imagery',
  electronics: 'modern tech studio, dark gradient background, sleek product showcase lighting',
  fashion: 'lifestyle fashion photography, natural light, urban or studio backdrop',
  living: 'cozy home interior, warm lighting, lifestyle product placement',
  pets: 'warm home setting with cute pet, natural lighting, friendly atmosphere',
  kids: 'bright colorful safe environment, playful yet clean aesthetic',
  sports: 'dynamic action setting, outdoor or gym environment, energetic mood',
  interior: 'beautiful room setting, styled interior photography, warm ambient lighting',
  automotive: 'garage or road setting, sleek automotive photography style',
  stationery: 'clean desk setup, minimal workspace, organized aesthetic',
  beverages: 'stylish bar or kitchen setting, atmospheric lighting, premium drink photography',
  digital: 'modern workspace, screen mockup, clean tech aesthetic',
  others: 'clean studio background, professional product photography',
};

// ===== 톤별 분위기 =====
const toneModifiers: Record<string, string> = {
  trust: 'professional, trustworthy, clean, confident, data-driven feel',
  emotional: 'warm, inviting, storytelling mood, emotional connection, soft and cozy',
  impact: 'bold, energetic, high-contrast, attention-grabbing, dynamic',
};

// ===== 카테고리 → 영어 라벨 (제품명 대신 사용) =====
const categoryLabels: Record<string, string> = {
  food: 'gourmet food',
  cosmetics: 'luxury cosmetic',
  health: 'wellness',
  electronics: 'modern tech',
  fashion: 'fashion',
  living: 'home living',
  pets: 'pet care',
  kids: "children's",
  sports: 'sports equipment',
  interior: 'interior design',
  automotive: 'automotive',
  stationery: 'stationery',
  beverages: 'premium beverage',
  digital: 'digital product',
  others: 'consumer',
};

// ===== type별 프롬프트 생성 =====
function buildPrompt(
  type: 'hero' | 'background' | 'lifestyle' | 'feature',
  productName: string,
  category: string,
  usps: string[],
  tone: string
): { prompt: string; size: '1792x1024' | '1024x1024' } {
  const style = categoryStyles[category] || categoryStyles.others;
  const toneStyle = toneModifiers[tone] || toneModifiers.trust;
  const label = categoryLabels[category] || 'consumer';

  // Filter USPs with numbers — DALL-E renders "25,000ppm" as visible text
  const safeUsps = usps.filter(u => !/\d/.test(u)).slice(0, 2);
  const uspMood = safeUsps.length > 0 ? `Mood should evoke: ${safeUsps.join(', ')}.` : '';

  const noText = 'CRITICAL: The image must contain absolutely NO text, NO words, NO letters, NO numbers, NO logos, NO watermarks, NO typography of any kind. Pure visual imagery only.';

  let prompt = '';
  let size: '1792x1024' | '1024x1024' = '1024x1024';

  switch (type) {
    case 'hero':
      size = '1792x1024';
      prompt = `${noText} Wide panoramic background scene for a ${label} product landing page. ${style}. Dramatic cinematic environment with beautiful lighting. ${toneStyle}. ${uspMood} High-end commercial photography, 8k quality.`;
      break;
    case 'background':
      prompt = `${noText} Beautiful background surface or environment for ${label} product photography. ${style}. No product in the image, just the background/surface/environment. ${toneStyle}. Shallow depth of field, commercial photography, 8k quality.`;
      break;
    case 'lifestyle':
      prompt = `${noText} Lifestyle scene environment for ${label} products. ${style}. ${toneStyle}. Natural, candid atmosphere with warm ambient feel. ${uspMood} Commercial lifestyle photography, 8k quality.`;
      break;
    case 'feature':
      prompt = `${noText} Abstract close-up texture or material background related to ${label}. ${style}. ${toneStyle}. ${uspMood} Macro photography, studio lighting, 8k quality.`;
      break;
  }

  return { prompt, size };
}

// ===== placeholder 이미지 생성 (API 키 없을 때) =====
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

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const {
      type = 'hero',
      productName = '제품',
      category = 'others',
      usps = [],
      tone = 'trust',
    } = body;

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // API 키 없으면 placeholder 반환
      return NextResponse.json({
        success: true,
        imageUrl: getPlaceholderUrl(type, productName),
        isPlaceholder: true,
        message: 'OPENAI_API_KEY가 설정되지 않아 placeholder 이미지를 사용합니다.',
      });
    }

    // DALL-E 프롬프트 생성
    const { prompt, size } = buildPrompt(type, productName, category, usps, tone);

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,
        quality: 'standard',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DALL-E API error:', errorData);

      // API 오류 시 placeholder 반환
      return NextResponse.json({
        success: true,
        imageUrl: getPlaceholderUrl(type, productName),
        isPlaceholder: true,
        message: `DALL-E API 오류: ${(errorData as Record<string, Record<string, string>>)?.error?.message || response.statusText}`,
      });
    }

    const data = await response.json();
    const dalleUrl = data.data?.[0]?.url;

    if (!dalleUrl) {
      return NextResponse.json({
        success: true,
        imageUrl: getPlaceholderUrl(type, productName),
        isPlaceholder: true,
        message: '이미지 URL을 받지 못했습니다.',
      });
    }

    // Proxy: download DALL-E image and return as base64 data URL to avoid CORS
    try {
      const imgRes = await fetch(dalleUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = imgRes.headers.get('content-type') || 'image/png';

      return NextResponse.json({
        success: true,
        imageUrl: `data:${contentType};base64,${base64}`,
        isPlaceholder: false,
        revisedPrompt: data.data?.[0]?.revised_prompt,
      });
    } catch (proxyErr) {
      console.error('Image proxy failed, returning raw URL:', proxyErr);
      return NextResponse.json({
        success: true,
        imageUrl: dalleUrl,
        isPlaceholder: false,
        revisedPrompt: data.data?.[0]?.revised_prompt,
      });
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { success: false, error: '이미지 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
