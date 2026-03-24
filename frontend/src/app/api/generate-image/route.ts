import { NextRequest, NextResponse } from 'next/server';

const CATEGORY_STYLES: Record<string, string> = {
  food: 'clean white marble surface, natural lighting, fresh ingredients, appetizing food photography style',
  cosmetics: 'elegant minimalist background, soft pink/white gradient, luxury beauty product photography',
  health: 'clean wellness aesthetic, green and white tones, trustworthy healthcare imagery',
  electronics: 'modern tech studio, dark gradient background, sleek product showcase lighting',
  fashion: 'lifestyle fashion photography, natural light, urban or studio backdrop',
  living: 'cozy home interior, warm lighting, lifestyle product placement',
  pets: 'warm home setting, natural lighting, friendly atmosphere',
  kids: 'bright colorful safe environment, playful yet clean aesthetic',
  sports: 'dynamic action setting, outdoor or gym environment, energetic mood',
  interior: 'beautiful room setting, styled interior photography, warm ambient lighting',
  automotive: 'garage or road setting, sleek automotive photography style',
  stationery: 'clean desk setup, minimal workspace, organized aesthetic',
  beverages: 'stylish bar or kitchen setting, atmospheric lighting, premium drink photography',
  digital: 'modern workspace, screen mockup, clean tech aesthetic',
  others: 'clean studio background, professional product photography',
};

const TONE_MODIFIERS: Record<string, string> = {
  trust: 'professional, trustworthy, clean, confident',
  emotional: 'warm, inviting, soft and cozy, emotional connection',
  impact: 'bold, energetic, high-contrast, dynamic',
};

function buildAutoPrompt(
  productName: string,
  category: string,
  tone: string,
  type: string
): { prompt: string; size: '1792x1024' | '1024x1024' } {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.others;
  const toneStyle = TONE_MODIFIERS[tone] || TONE_MODIFIERS.trust;

  if (type === 'hero') {
    return {
      size: '1792x1024',
      prompt: `Wide panoramic hero banner image for "${productName}" product. ${style}. ${toneStyle}. High-end commercial photography, 8k quality, no text or logos.`,
    };
  }
  return {
    size: '1024x1024',
    prompt: `Product photography for "${productName}". ${style}. ${toneStyle}. Commercial photography, 8k quality, no text or logos.`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      size = '1024x1024',
      // auto-prompt fields
      autoPrompt = false,
      productName = '제품',
      category = 'others',
      tone = 'trust',
      type = 'product',
    } = body as {
      prompt?: string;
      size?: '1792x1024' | '1024x1024';
      autoPrompt?: boolean;
      productName?: string;
      category?: string;
      tone?: string;
      type?: string;
    };

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY가 설정되지 않았습니다.' },
        { status: 400 }
      );
    }

    let finalPrompt = prompt || '';
    let finalSize: '1792x1024' | '1024x1024' = size;

    if (autoPrompt || !finalPrompt) {
      const auto = buildAutoPrompt(productName, category, tone, type);
      finalPrompt = auto.prompt;
      finalSize = auto.size;
    }

    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey });

    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: finalSize,
      quality: 'standard',
      response_format: 'url',
    });

    const imageUrl = response.data?.[0]?.url;
    const revisedPrompt = response.data?.[0]?.revised_prompt;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: '이미지 URL을 받지 못했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, imageUrl, revisedPrompt });
  } catch (error) {
    console.error('Image generation error:', error);
    const message = error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
