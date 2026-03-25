import { NextRequest, NextResponse } from 'next/server';
import { ProductInfo, USP, InterviewMessage, ManuscriptSection, ManuscriptSectionType, ToneKey, ColorPalette, FontRecommendation } from '@/lib/types';

const SYSTEM_PROMPT = `당신은 한국 이커머스 상세페이지 전문 카피라이터입니다.
상품 정보, USP, 인터뷰 내용을 바탕으로 상세페이지 원고를 작성합니다.

원칙:
1. 고객의 Pain Point를 정확히 짚어 공감을 이끌어내세요
2. 구체적인 수치와 근거를 적극 활용하세요
3. 한국 소비자의 구매 심리에 맞는 표현을 사용하세요
4. 각 섹션이 자연스럽게 연결되도록 흐름을 유지하세요
5. 이모지 사용 금지`;

const TONE_DESCRIPTIONS: Record<string, string> = {
  trust: '신뢰형 — 데이터, 인증, 검증 수치 중심. 권위 있고 안정적인 어조.',
  emotional: '감성형 — 공감, 스토리, 일상 변화 중심. 따뜻하고 친근한 어조.',
  impact: '임팩트형 — 강렬한 카피, 긴급성, 혜택 강조 중심. 파워풀하고 단호한 어조.',
};

function buildPrompt(productInfo: ProductInfo, usps: USP[], interviewMessages: InterviewMessage[], tone?: ToneKey | ''): string {
  const toneKey = tone || 'trust';
  const toneDesc = TONE_DESCRIPTIONS[toneKey] || TONE_DESCRIPTIONS.trust;

  const productText = [
    `상품명: ${productInfo.name}`,
    `카테고리: ${productInfo.category}`,
    `가격: ${productInfo.price || '미정'}`,
    `타겟 고객: ${productInfo.targetAudience || '미정'}`,
    `간단 설명: ${productInfo.shortDescription}`,
    `키워드: ${productInfo.keywords?.join(', ') || ''}`,
    `톤앤매너: ${toneDesc}`,
  ].join('\n');

  const uspText = usps.map((u, i) => `${i + 1}. ${u.title}: ${u.description}`).join('\n');

  const interviewText = interviewMessages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .filter((c) => c && c !== '(건너뜀)')
    .join('\n---\n');

  return `다음 정보를 바탕으로 상세페이지 원고를 작성해주세요.

[상품 정보]
${productText}

[USP]
${uspText || '없음'}

[인터뷰 답변 요약]
${interviewText || '없음'}

아래 JSON 형식으로 응답하세요. sections 6개 + 색상 팔레트 + 폰트 추천을 모두 포함해야 합니다.

각 섹션의 imageGuide에는 반드시 "추천 색상 톤"과 "폰트 스타일" 힌트를 포함하세요.
예시: "제품 메인 사진 (흰 배경 제품컷). 색상 톤: 크림 베이지 배경에 딥 브라운 텍스트. 폰트: 세리프 계열 제목으로 고급스러운 느낌 권장."

{
  "sections": [
    {
      "sectionType": "hero",
      "title": "히어로 카피",
      "body": "헤드라인: (15자 이내의 강렬한 카피)\\n서브카피: (30자 이내의 보조 설명)\\nCTA: (구매 유도 버튼 텍스트 8자 이내)",
      "imageGuide": "이미지 설명. 색상 톤: (배경색/텍스트색 권장). 폰트: (제목/본문 폰트 스타일 권장)."
    },
    {
      "sectionType": "features",
      "title": "핵심 특장점",
      "body": "1. (특장점 제목)\\n(특장점 설명 2~3줄)\\n\\n2. (특장점 제목)\\n(특장점 설명 2~3줄)\\n\\n3. (특장점 제목)\\n(특장점 설명 2~3줄)",
      "imageGuide": "이미지 설명. 색상 톤: (권장). 폰트: (권장)."
    },
    {
      "sectionType": "detail",
      "title": "상세 설명",
      "body": "(제품에 대한 심층적인 설명. 3~4단락. 각 단락 소제목 포함)",
      "imageGuide": "이미지 설명. 색상 톤: (권장). 폰트: (권장)."
    },
    {
      "sectionType": "howto",
      "title": "사용 방법",
      "body": "1단계: (제목)\\n(설명)\\n\\n2단계: (제목)\\n(설명)\\n\\n3단계: (제목)\\n(설명)",
      "imageGuide": "이미지 설명. 색상 톤: (권장). 폰트: (권장)."
    },
    {
      "sectionType": "trust",
      "title": "신뢰 요소",
      "body": "(인증, 검사 결과, 고객 만족도, 수상 이력 등 신뢰를 높이는 내용. 인터뷰에서 언급된 내용 활용)",
      "imageGuide": "이미지 설명. 색상 톤: (권장). 폰트: (권장)."
    },
    {
      "sectionType": "cta",
      "title": "구매 유도",
      "body": "메인 카피: (구매를 이끌어내는 강렬한 문장)\\n서브 카피: (혜택 또는 긴급성 강조)\\n버튼 텍스트: (행동 유도 텍스트)",
      "imageGuide": "이미지 설명. 색상 톤: (권장). 폰트: (권장)."
    }
  ],
  "colorPalette": {
    "colors": [
      {"hex": "#hexcode", "label": "주 배경색 (용도 설명)"},
      {"hex": "#hexcode", "label": "본문 텍스트색 (용도 설명)"},
      {"hex": "#hexcode", "label": "강조색 (용도 설명)"}
    ],
    "accent": {"hex": "#hexcode", "label": "포인트 액센트 색상"},
    "rationale": "이 색상 조합을 추천하는 이유 (20자 이내)"
  },
  "fontRecommendation": {
    "headline": "제목 폰트 추천 (예: 세리프 계열 / Noto Serif KR — 이유)",
    "body": "본문 폰트 추천 (예: 산세리프 계열 / Pretendard — 이유)",
    "mood": "전체 타이포그래피 분위기 (20자 이내)"
  }
}

JSON만 응답하세요.`;
}

function buildFallbackSections(productInfo: ProductInfo, usps: USP[]): ManuscriptSection[] {
  const name = productInfo.name || '제품';
  return [
    {
      id: 'ms-hero',
      sectionType: 'hero' as ManuscriptSectionType,
      title: '히어로 카피',
      body: `헤드라인: ${name}, 선택이 다릅니다\n서브카피: ${productInfo.shortDescription || `${name}의 특별한 경험을 지금 시작하세요`}\nCTA: 지금 구매하기`,
      imageGuide: '제품 메인 사진 1장 (흰 배경 제품컷 또는 라이프스타일 연출 사진)',
      visible: true,
      order: 0,
    },
    {
      id: 'ms-features',
      sectionType: 'features' as ManuscriptSectionType,
      title: '핵심 특장점',
      body: usps.length > 0
        ? usps.map((u, i) => `${i + 1}. ${u.title}\n${u.description}`).join('\n\n')
        : `1. 프리미엄 품질\n엄선된 원료와 철저한 품질 관리를 통해 최상의 결과물을 보장합니다.\n\n2. 검증된 효과\n수많은 고객 후기와 전문가 테스트를 통해 효능을 검증했습니다.\n\n3. 합리적 가격\n동급 대비 뛰어난 가성비로 부담 없이 만나보세요.`,
      imageGuide: '각 특장점을 시각적으로 표현하는 아이콘 이미지 또는 제품 클로즈업 사진',
      visible: true,
      order: 1,
    },
    {
      id: 'ms-detail',
      sectionType: 'detail' as ManuscriptSectionType,
      title: '상세 설명',
      body: `왜 ${name}인가\n${name}은(는) 고객의 니즈를 깊이 연구하여 탄생한 제품입니다. 최고급 소재와 정교한 기술이 만나 완벽한 결과물을 만들어냅니다.\n\n차별화된 품질\n모든 공정에서 엄격한 품질 관리를 거치며, 고객 만족을 최우선으로 합니다. 작은 디테일 하나까지 놓치지 않았습니다.\n\n실제 사용 후기\n실제 사용자들이 경험한 놀라운 변화를 확인해보세요.`,
      imageGuide: '제품 사용 전/후 비교 사진 또는 핵심 성분/소재 클로즈업 이미지',
      visible: true,
      order: 2,
    },
    {
      id: 'ms-howto',
      sectionType: 'howto' as ManuscriptSectionType,
      title: '사용 방법',
      body: `1단계: 준비하기\n제품을 개봉하고 구성품을 확인합니다.\n\n2단계: 적용하기\n제품 설명서에 따라 올바르게 사용합니다.\n\n3단계: 효과 확인\n꾸준히 사용하며 변화를 느껴보세요.`,
      imageGuide: '사용 단계별 시연 사진 3장 (순서대로 배치)',
      visible: true,
      order: 3,
    },
    {
      id: 'ms-trust',
      sectionType: 'trust' as ManuscriptSectionType,
      title: '신뢰 요소',
      body: `인증 및 검증\n관련 국가 공인 품질 인증을 획득했으며, 안전성 테스트 전 항목을 통과했습니다.\n\n고객 만족도\n누적 구매 고객 리뷰 평균 4.8점 / 5.0점, 재구매율 72%\n\n전문가 추천\n해당 분야 전문가들이 검증한 성분과 효능`,
      imageGuide: '인증서 이미지, 임상 데이터 그래프, 수상 트로피 등 신뢰 요소 시각화',
      visible: true,
      order: 4,
    },
    {
      id: 'ms-cta',
      sectionType: 'cta' as ManuscriptSectionType,
      title: '구매 유도',
      body: `메인 카피: ${name}, 지금 시작하세요\n서브 카피: 오늘 주문 시 무료 배송 + 특별 할인 적용\n버튼 텍스트: 특가로 구매하기`,
      imageGuide: '강렬한 제품 이미지 또는 라이프스타일 사진 (구매 욕구를 자극하는 비주얼)',
      visible: true,
      order: 5,
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productInfo, extractedUSPs, interviewMessages, selectedTone, productPhotoBase64, productPhotoMimeType } = body as {
      productInfo: ProductInfo;
      extractedUSPs: USP[];
      interviewMessages: InterviewMessage[];
      selectedTone?: ToneKey | '';
      productPhotoBase64?: string;
      productPhotoMimeType?: string;
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        sections: buildFallbackSections(productInfo, extractedUSPs),
      });
    }

    const userContent: unknown[] = [];

    // 제품 사진이 있으면 Vision으로 함께 분석
    if (productPhotoBase64) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: productPhotoMimeType || 'image/jpeg',
          data: productPhotoBase64,
        },
      });
    }

    userContent.push({
      type: 'text',
      text: buildPrompt(productInfo, extractedUSPs, interviewMessages, selectedTone),
    });

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 5000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    let rawText = claudeData.content?.[0]?.text?.trim() || '';

    // JSON 블록 추출
    if (rawText.includes('```json')) {
      rawText = rawText.split('```json')[1].split('```')[0].trim();
    } else if (rawText.includes('```')) {
      rawText = rawText.split('```')[1].split('```')[0].trim();
    }

    const parsed = JSON.parse(rawText);
    const sections: ManuscriptSection[] = (parsed.sections || []).map(
      (s: Omit<ManuscriptSection, 'id' | 'visible' | 'order'>, idx: number) => ({
        id: `ms-${s.sectionType}-${idx}`,
        sectionType: s.sectionType,
        title: s.title,
        body: s.body,
        imageGuide: s.imageGuide,
        visible: true,
        order: idx,
      })
    );

    const colorPalette: ColorPalette | null = parsed.colorPalette || null;
    const fontRecommendation: FontRecommendation | null = parsed.fontRecommendation || null;

    return NextResponse.json({ sections, colorPalette, fontRecommendation });
  } catch (error) {
    console.error('Manuscript API error:', error);
    // 에러 시 폴백
    try {
      const body = await request.clone().json().catch(() => ({}));
      const { productInfo, extractedUSPs } = body as { productInfo?: ProductInfo; extractedUSPs?: USP[] };
      return NextResponse.json({
        sections: buildFallbackSections(
          productInfo || { name: '', category: '', price: '', targetAudience: '', shortDescription: '', keywords: [] },
          extractedUSPs || []
        ),
      });
    } catch {
      return NextResponse.json({ error: '원고 생성에 실패했습니다.', sections: [] }, { status: 500 });
    }
  }
}
