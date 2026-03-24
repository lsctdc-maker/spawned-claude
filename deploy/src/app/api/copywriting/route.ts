import { NextRequest, NextResponse } from 'next/server';
import { ProductInfo, USP, ToneKey, DetailPageSection, CategoryKey } from '@/lib/types';
import { COPYWRITING_SYSTEM_PROMPT, buildCopywritingPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productInfo, usps, tone } = body as {
      productInfo: ProductInfo;
      usps: USP[];
      tone: ToneKey;
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // API 키가 있으면 Anthropic API 사용
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

        const uspContext = usps
          .map((u) => `${u.icon || '✅'} ${u.title}: ${u.description}`)
          .join('\n');

        const prompt = buildCopywritingPrompt(
          productInfoText,
          uspContext,
          tone,
          (productInfo.category || 'living') as CategoryKey
        );

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: COPYWRITING_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        });

        let responseText = response.content[0].type === 'text' ? response.content[0].text : '';

        if (responseText.includes('```json')) {
          responseText = responseText.split('```json')[1].split('```')[0];
        } else if (responseText.includes('```')) {
          responseText = responseText.split('```')[1].split('```')[0];
        }

        const data = JSON.parse(responseText.trim());
        const sections = buildSectionsFromAI(data, productInfo, usps);
        return NextResponse.json({ sections });
      } catch (apiError) {
        console.error('Anthropic API error, falling back to template:', apiError);
      }
    }

    // 폴백: 템플릿 기반 섹션 생성
    const sections = generateFallbackSections(productInfo, usps, tone);
    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Copywriting API error:', error);
    return NextResponse.json(
      { error: '카피 생성에 실패했습니다.', sections: [] },
      { status: 500 }
    );
  }
}

function buildSectionsFromAI(
  data: any,
  productInfo: ProductInfo,
  usps: USP[]
): DetailPageSection[] {
  const sections: DetailPageSection[] = [];
  const name = productInfo.name || '제품';

  // Hero
  if (data.hero) {
    sections.push({
      id: 'section-hero', type: 'hero', title: '히어로 배너', visible: true, order: 0,
      content: {
        headline: data.hero.headline || `${name}`,
        subheadline: data.hero.subheadline || productInfo.shortDescription,
        ctaText: data.hero.ctaText || '자세히 보기',
        backgroundStyle: data.hero.backgroundStyle || 'gradient',
      },
    });
  }

  // USP
  if (data.usp_points) {
    sections.push({
      id: 'section-usp', type: 'usp', title: 'USP 포인트', visible: true, order: 1,
      content: {
        points: (data.usp_points.points || usps).map((p: any, i: number) => ({
          id: p.id || `usp-ai-${i}`,
          title: p.title,
          description: p.description,
          icon: p.icon || '✅',
        })),
      },
    });
  }

  // Detail
  if (data.detail) {
    sections.push({
      id: 'section-detail', type: 'detail', title: '제품 상세', visible: true, order: 2,
      content: {
        paragraphs: (data.detail.paragraphs || []).map((p: any) => ({
          title: p.title,
          text: p.text,
          imagePosition: p.imagePosition || 'right',
        })),
      },
    });
  }

  // Comparison
  if (data.comparison) {
    sections.push({
      id: 'section-comparison', type: 'comparison', title: '비교표', visible: true, order: 3,
      content: {
        headers: data.comparison.headers || ['항목', name, '일반 제품'],
        rows: (data.comparison.rows || []).map((r: any) => ({
          label: r.label,
          values: r.values,
        })),
      },
    });
  }

  // HowTo
  if (data.howto) {
    sections.push({
      id: 'section-howto', type: 'howto', title: '사용법', visible: true, order: 4,
      content: {
        steps: (data.howto.steps || []).map((s: any) => ({
          step: s.step,
          title: s.title,
          description: s.description,
        })),
      },
    });
  }

  // Certification
  if (data.certification) {
    sections.push({
      id: 'section-certification', type: 'certification', title: '인증/신뢰', visible: true, order: 5,
      content: {
        items: (data.certification.items || []).map((item: any) => ({
          name: item.name,
          description: item.description,
          icon: item.icon || '🏅',
        })),
      },
    });
  }

  // Reviews
  if (data.reviews) {
    sections.push({
      id: 'section-reviews', type: 'reviews', title: '고객 리뷰', visible: true, order: 6,
      content: {
        reviews: (data.reviews.reviews || []).map((r: any) => ({
          author: r.author,
          rating: r.rating || 5,
          text: r.text,
          date: r.date || '2024-01-01',
        })),
      },
    });
  }

  // FAQ
  if (data.faq) {
    sections.push({
      id: 'section-faq', type: 'faq', title: 'FAQ', visible: true, order: 7,
      content: {
        items: (data.faq.items || []).map((item: any) => ({
          question: item.question,
          answer: item.answer,
        })),
      },
    });
  }

  // CTA
  if (data.cta) {
    sections.push({
      id: 'section-cta', type: 'cta', title: 'CTA', visible: true, order: 8,
      content: {
        headline: data.cta.headline || `${name}, 지금 시작하세요`,
        subtext: data.cta.subtext || '한정 수량 특별 할인 진행 중',
        buttonText: data.cta.buttonText || '구매하러 가기',
        urgencyText: data.cta.urgencyText || '',
      },
    });
  }

  return sections;
}

function generateFallbackSections(
  productInfo: ProductInfo,
  usps: USP[],
  tone: ToneKey
): DetailPageSection[] {
  const name = productInfo.name || '제품';
  const toneTexts: Record<ToneKey, { headline: string; cta: string }> = {
    trust: { headline: `${name}, 데이터가 증명합니다`, cta: '지금 확인하세요' },
    emotional: { headline: `당신의 일상을 바꿔줄 ${name}`, cta: '특별함을 경험하세요' },
    impact: { headline: `${name} — 지금이 아니면 늦습니다`, cta: '바로 구매하기' },
  };
  const t = toneTexts[tone] || toneTexts.trust;

  return [
    {
      id: 'section-hero', type: 'hero', title: '히어로 배너', visible: true, order: 0,
      content: { headline: t.headline, subheadline: productInfo.shortDescription || `${name}의 놀라운 경험을 시작하세요`, ctaText: t.cta, backgroundStyle: 'gradient' },
    },
    {
      id: 'section-usp', type: 'usp', title: 'USP 포인트', visible: true, order: 1,
      content: { points: usps },
    },
    {
      id: 'section-detail', type: 'detail', title: '제품 상세', visible: true, order: 2,
      content: {
        paragraphs: [
          { title: `왜 ${name}인가요?`, text: `${name}은(는) 고객의 니즈를 깊이 연구하여 탄생한 제품입니다.`, imagePosition: 'right' },
          { title: '세심한 디테일', text: '모든 공정에서 엄격한 품질 관리를 거치며, 고객 만족을 최우선으로 합니다.', imagePosition: 'left' },
        ],
      },
    },
    {
      id: 'section-comparison', type: 'comparison', title: '비교표', visible: true, order: 3,
      content: {
        headers: ['항목', name, '일반 제품'],
        rows: [
          { label: '품질', values: ['프리미엄', '보통'] },
          { label: '가격 대비 효과', values: ['★★★★★', '★★★'] },
          { label: '고객 만족도', values: ['98%', '75%'] },
          { label: '인증/검증', values: ['다수 보유', '일부'] },
        ],
      },
    },
    {
      id: 'section-howto', type: 'howto', title: '사용법', visible: true, order: 4,
      content: {
        steps: [
          { step: 1, title: '준비하기', description: '제품을 개봉하고 구성품을 확인합니다.' },
          { step: 2, title: '적용하기', description: '제품 설명서에 따라 올바르게 사용합니다.' },
          { step: 3, title: '효과 확인', description: '꾸준히 사용하며 변화를 느껴보세요.' },
        ],
      },
    },
    {
      id: 'section-certification', type: 'certification', title: '인증/신뢰', visible: true, order: 5,
      content: {
        items: [
          { name: '품질 인증', description: '국가 공인 품질 인증 획득', icon: '🏅' },
          { name: '안전 테스트', description: '안전성 테스트 전 항목 통과', icon: '✅' },
          { name: '고객 만족', description: '누적 리뷰 평점 4.8/5.0', icon: '⭐' },
        ],
      },
    },
    {
      id: 'section-reviews', type: 'reviews', title: '고객 리뷰', visible: true, order: 6,
      content: {
        reviews: [
          { author: '김**', rating: 5, text: '정말 만족합니다! 기대 이상이에요.', date: '2024-01-15' },
          { author: '이**', rating: 5, text: '주변에 추천하고 있어요.', date: '2024-01-10' },
          { author: '박**', rating: 4, text: '가격 대비 정말 좋아요.', date: '2024-01-05' },
        ],
      },
    },
    {
      id: 'section-faq', type: 'faq', title: 'FAQ', visible: true, order: 7,
      content: {
        items: [
          { question: '배송은 얼마나 걸리나요?', answer: '주문 후 1~3일 이내에 배송됩니다.' },
          { question: '교환/환불이 가능한가요?', answer: '수령 후 7일 이내 가능합니다.' },
          { question: '문의는 어디로 하나요?', answer: '고객센터 1588-0000으로 문의해주세요.' },
        ],
      },
    },
    {
      id: 'section-cta', type: 'cta', title: 'CTA', visible: true, order: 8,
      content: {
        headline: `${name}, 지금 시작하세요`,
        subtext: '한정 수량 특별 할인 진행 중',
        buttonText: '구매하러 가기',
        urgencyText: '오늘 주문 시 무료 배송!',
      },
    },
  ];
}
