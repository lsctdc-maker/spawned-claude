import {
  ProductInfo,
  InterviewMessage,
  USP,
  ToneKey,
  DetailPageSection,
  APIResponse,
  GenerateUSPResponse,
  GenerateSectionsResponse,
  ExportResponse,
  ImageType,
} from './types';

// ===== USP 추출 =====
export async function extractUSPs(
  productInfo: ProductInfo,
  interviewMessages: InterviewMessage[]
): Promise<APIResponse<GenerateUSPResponse>> {
  try {
    const response = await fetch('/api/usp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productInfo,
        interviewAnswers: interviewMessages
          .filter((m) => m.role === 'user')
          .map((m) => m.content),
      }),
    });
    const data = await response.json();
    if (data.usps) {
      return { success: true, data: { usps: data.usps } };
    }
    throw new Error(data.error || 'USP 추출 실패');
  } catch (error) {
    console.warn('USP API 호출 실패, 모의 데이터를 사용합니다:', error);
    return {
      success: true,
      data: { usps: generateMockUSPs(productInfo) },
    };
  }
}

// ===== 상세페이지 섹션 생성 =====
export async function generateSections(
  productInfo: ProductInfo,
  usps: USP[],
  tone: ToneKey
): Promise<APIResponse<GenerateSectionsResponse>> {
  try {
    const response = await fetch('/api/copywriting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productInfo, usps, tone }),
    });
    const data = await response.json();
    if (data.sections) {
      return { success: true, data: { sections: data.sections } };
    }
    throw new Error(data.error || '섹션 생성 실패');
  } catch (error) {
    console.warn('Copywriting API 호출 실패, 모의 데이터를 사용합니다:', error);
    return {
      success: true,
      data: { sections: generateMockSections(productInfo, usps, tone) },
    };
  }
}

// ===== HTML 내보내기 =====
export async function exportHTML(
  sections: DetailPageSection[],
  productInfo: ProductInfo,
  tone: ToneKey
): Promise<APIResponse<ExportResponse>> {
  try {
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections, productInfo, tone }),
    });
    const data = await response.json();
    if (data.html) {
      return { success: true, data: { html: data.html } };
    }
    throw new Error(data.error || 'HTML 내보내기 실패');
  } catch (error) {
    console.warn('Export API 호출 실패, 로컬 생성을 사용합니다:', error);
    return {
      success: true,
      data: { html: buildLocalHTML(sections, productInfo) },
    };
  }
}

// ===== 이미지 생성 =====
export async function generateImage(
  type: ImageType,
  productInfo: ProductInfo,
  usps: USP[],
  tone: ToneKey | ''
): Promise<APIResponse<{ imageUrl: string; isPlaceholder: boolean }>> {
  try {
    const response = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        productName: productInfo.name,
        category: productInfo.category,
        usps: usps.map((u) => u.title),
        tone: tone || 'trust',
      }),
    });
    const data = await response.json();
    if (data.success && data.imageUrl) {
      return { success: true, data: { imageUrl: data.imageUrl, isPlaceholder: data.isPlaceholder || false } };
    }
    throw new Error(data.error || '이미지 생성 실패');
  } catch (error) {
    console.warn('Image API 호출 실패:', error);
    return { success: false, error: '이미지 생성 중 오류가 발생했습니다.' };
  }
}

// ===== 배경 제거 =====
export async function removeBackground(
  imageFile: File
): Promise<APIResponse<{ imageUrl: string }>> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/api/image/remove-bg', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.success && data.imageUrl) {
      return { success: true, data: { imageUrl: data.imageUrl } };
    }
    throw new Error(data.error || '배경 제거 실패');
  } catch (error) {
    console.warn('Remove BG API 호출 실패:', error);
    return { success: false, error: '배경 제거 중 오류가 발생했습니다.' };
  }
}

// ===== 모의 데이터 생성 함수 =====
function generateMockUSPs(productInfo: ProductInfo): USP[] {
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

function generateMockSections(
  productInfo: ProductInfo,
  usps: USP[],
  tone: ToneKey
): DetailPageSection[] {
  const name = productInfo.name || '제품';
  const toneTexts = {
    trust: { headline: `${name}, 데이터가 증명합니다`, cta: '지금 확인하세요' },
    emotional: { headline: `당신의 일상을 바꿔줄 ${name}`, cta: '특별함을 경험하세요' },
    impact: { headline: `${name} — 지금이 아니면 늦습니다`, cta: '바로 구매하기' },
  };
  const t = toneTexts[tone] || toneTexts.trust;

  return [
    {
      id: 'section-hero', type: 'hero', title: '히어로 배너', visible: true, order: 0,
      content: {
        headline: t.headline,
        subheadline: productInfo.shortDescription || `${name}의 놀라운 경험을 시작하세요`,
        ctaText: t.cta,
        backgroundStyle: 'gradient' as const,
      },
    },
    {
      id: 'section-priceBanner', type: 'priceBanner', title: '이벤트 가격', visible: true, order: 1,
      content: {
        originalPrice: 59900,
        salePrice: 39900,
        discountRate: 33,
        eventText: '오늘만 특가!',
        freeShipping: true,
      },
    },
    {
      id: 'section-usp', type: 'usp', title: 'USP 포인트', visible: true, order: 2,
      content: { points: usps },
    },
    {
      id: 'section-detail', type: 'detail', title: '제품 상세', visible: true, order: 3,
      content: {
        paragraphs: [
          { title: `왜 ${name}인가요?`, text: `${name}은(는) 고객의 니즈를 깊이 연구하여 탄생한 제품입니다. 최고급 소재와 정교한 기술이 만나 완벽한 결과물을 만들어냅니다.`, imagePosition: 'right' as const },
          { title: '세심한 디테일', text: '모든 공정에서 엄격한 품질 관리를 거치며, 고객 만족을 최우선으로 합니다. 작은 디테일 하나까지 놓치지 않았습니다.', imagePosition: 'left' as const },
        ],
      },
    },
    {
      id: 'section-comparison', type: 'comparison', title: '비교표', visible: true, order: 4,
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
      id: 'section-howto', type: 'howto', title: '사용법', visible: true, order: 5,
      content: {
        steps: [
          { step: 1, title: '준비하기', description: '제품을 개봉하고 구성품을 확인합니다.' },
          { step: 2, title: '적용하기', description: '제품 설명서에 따라 올바르게 사용합니다.' },
          { step: 3, title: '효과 확인', description: '꾸준히 사용하며 변화를 느껴보세요.' },
        ],
      },
    },
    {
      id: 'section-certification', type: 'certification', title: '인증/신뢰', visible: true, order: 6,
      content: {
        items: [
          { name: '품질 인증', description: '국가 공인 품질 인증 획득', icon: '🏅' },
          { name: '안전 테스트', description: '안전성 테스트 전 항목 통과', icon: '✅' },
          { name: '고객 만족', description: '누적 리뷰 평점 4.8/5.0', icon: '⭐' },
        ],
      },
    },
    {
      id: 'section-reviews', type: 'reviews', title: '고객 리뷰', visible: true, order: 7,
      content: {
        reviews: [
          { author: '김**', rating: 5, text: '정말 만족합니다! 기대 이상이에요.', date: '2024-01-15' },
          { author: '이**', rating: 5, text: '주변에 추천하고 있어요. 품질이 확실히 다릅니다.', date: '2024-01-10' },
          { author: '박**', rating: 4, text: '가격 대비 정말 좋아요. 재구매 의사 있습니다.', date: '2024-01-05' },
        ],
      },
    },
    {
      id: 'section-faq', type: 'faq', title: 'FAQ', visible: true, order: 8,
      content: {
        items: [
          { question: '배송은 얼마나 걸리나요?', answer: '주문 후 1~3일 이내에 배송됩니다. (주말/공휴일 제외)' },
          { question: '교환/환불이 가능한가요?', answer: '수령 후 7일 이내 미개봉 상태에서 교환 및 환불이 가능합니다.' },
          { question: '문의는 어디로 하나요?', answer: '고객센터 1588-0000 또는 카카오톡 채널로 문의해주세요.' },
        ],
      },
    },
    {
      id: 'section-package', type: 'package', title: '구성품/가격', visible: true, order: 9,
      content: {
        items: [
          { name: `${name} 본품`, description: '정품 1개', price: 39900, icon: '📦' },
          { name: '전용 케이스', description: '프리미엄 보관 케이스', price: 15000, icon: '👜' },
          { name: '사용 가이드', description: '상세 사용법 안내서', icon: '📖' },
        ],
        totalOriginalPrice: 54900,
        totalSalePrice: 39900,
        freeShipping: true,
      },
    },
    {
      id: 'section-cta', type: 'cta', title: 'CTA', visible: true, order: 10,
      content: {
        headline: `${name}, 지금 시작하세요`,
        subtext: '한정 수량 특별 할인 진행 중',
        buttonText: '구매하러 가기',
        urgencyText: '오늘 주문 시 무료 배송!',
      },
    },
  ];
}

function buildLocalHTML(sections: DetailPageSection[], productInfo: ProductInfo): string {
  const visibleSections = sections.filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const name = productInfo.name || '상세페이지';

  let sectionsHTML = '';
  for (const section of visibleSections) {
    sectionsHTML += `<div class="section section-${section.type}">
      <h2>${section.title}</h2>
      <p>${JSON.stringify(section.content)}</p>
    </div>\n`;
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=860">
  <title>${name} 상세페이지</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans KR', sans-serif; max-width: 860px; margin: 0 auto; }
    .section { padding: 40px 20px; }
  </style>
</head>
<body>
  ${sectionsHTML}
</body>
</html>`;
}
