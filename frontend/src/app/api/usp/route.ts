import { NextRequest, NextResponse } from 'next/server';
import { ProductInfo, USP } from '@/lib/types';
import { USP_SYSTEM_PROMPT, USP_EXTRACTION_PROMPT, CATEGORY_USP_GUIDELINES } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productInfo, interviewAnswers } = body as {
      productInfo: ProductInfo;
      interviewAnswers: string[];
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey && apiKey !== 'sk-ant-xxx') {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const client = new Anthropic({ apiKey });

        const productInfoText = [
          `상품명: ${productInfo.name}`,
          `카테고리: ${productInfo.category}`,
          `가격: ${productInfo.price}`,
          `타겟: ${productInfo.targetAudience}`,
          `설명: ${productInfo.shortDescription}`,
          `키워드: ${productInfo.keywords?.join(', ') || ''}`,
        ].join('\n');

        const answersText = interviewAnswers
          .filter((a) => a && a !== '(건너뜀)')
          .map((a, i) => `답변 ${i + 1}: ${a}`)
          .join('\n');

        const categoryGuide = productInfo.category
          ? CATEGORY_USP_GUIDELINES[productInfo.category as keyof typeof CATEGORY_USP_GUIDELINES] || ''
          : '';

        const prompt = USP_EXTRACTION_PROMPT
          .replace('{product_info}', productInfoText)
          .replace('{interview_answers}', answersText)
          + (categoryGuide ? `\n\n${categoryGuide}` : '');

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: USP_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        });

        let responseText = response.content[0].type === 'text' ? response.content[0].text : '';

        if (responseText.includes('```json')) {
          responseText = responseText.split('```json')[1].split('```')[0];
        } else if (responseText.includes('```')) {
          responseText = responseText.split('```')[1].split('```')[0];
        }

        const data = JSON.parse(responseText.trim());
        const usps: USP[] = (data.usps || []).map((item: { title: string; description: string; icon?: string }, idx: number) => ({
          id: `usp-${idx + 1}`,
          title: item.title,
          description: item.description,
          icon: item.icon || '✅',
        }));

        return NextResponse.json({ usps });
      } catch (apiError) {
        console.error('Anthropic API error, falling back to template:', apiError);
      }
    }

    const usps = generateFallbackUSPs(productInfo);
    return NextResponse.json({ usps });
  } catch (error) {
    console.error('USP API error:', error);
    return NextResponse.json(
      { error: 'USP 추출에 실패했습니다.', usps: [] },
      { status: 500 }
    );
  }
}

function generateFallbackUSPs(productInfo: ProductInfo): USP[] {
  const name = productInfo.name || '제품';
  return [
    {
      id: 'usp-1',
      title: '프리미엄 품질',
      description: `${name}은(는) 엄선된 원료와 철저한 품질 관리를 통해 최상의 결과물을 보장합니다.`,
      icon: '✨',
    },
    {
      id: 'usp-2',
      title: '검증된 효과',
      description: `수많은 고객 후기와 전문가 테스트를 통해 검증된 ${name}의 효능을 경험하세요.`,
      icon: '🏆',
    },
    {
      id: 'usp-3',
      title: '합리적 가격',
      description: `동급 대비 뛰어난 가성비로 ${name}을(를) 부담 없이 만나보세요.`,
      icon: '💰',
    },
  ];
}
