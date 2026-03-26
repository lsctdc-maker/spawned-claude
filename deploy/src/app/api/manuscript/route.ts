import { NextRequest, NextResponse } from 'next/server';
import { ProductInfo, USP, InterviewMessage, ManuscriptSection, ManuscriptSectionType, ToneKey, ColorPalette, FontRecommendation, ReferenceGuide } from '@/lib/types';

const SYSTEM_PROMPT = `당신은 한국 이커머스 상세페이지 전문 카피라이터입니다.
상품 정보, USP, 인터뷰 내용을 바탕으로 상세페이지 원고를 작성합니다.

원칙:
1. 고객의 Pain Point를 정확히 짚어 공감을 이끌어내세요
2. 구체적인 수치와 근거를 적극 활용하세요
3. 한국 소비자의 구매 심리에 맞는 표현을 사용하세요
4. 각 섹션이 자연스럽게 연결되도록 흐름을 유지하세요
5. 이모지 사용 금지
6. 리뷰/고객 피드백이 없는 경우 social_proof 섹션을 전문가 의견, 성분 검증, 브랜드 스토리, 수상 이력 등으로 대체하세요
7. 경쟁사 대비 약점이 있는 경우 정면 비교를 피하고, 자사만의 포지셔닝을 강조하는 카피를 작성하세요 (프리미엄, 소량생산, 전문성 등)
8. 약점을 회피하지 말고 다른 관점으로 재프레이밍하세요 (예: 가격이 비싸다 → "타협 없는 원료 선택의 결과")`;

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
    productInfo.price ? `가격: ${productInfo.price}` : null,
    `타겟 고객: ${productInfo.targetAudience || '미정'}`,
    `간단 설명: ${productInfo.shortDescription}`,
    productInfo.keywords?.length ? `키워드: ${productInfo.keywords.join(', ')}` : null,
    `톤앤매너: ${toneDesc}`,
  ].filter(Boolean).join('\n');

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

[한국형 9단계 상세페이지 구조]
아래 섹션 타입을 순서대로 사용하세요. 제품 특성에 따라 일부 섹션은 생략 가능하나, 반드시 hooking → features → cta 순서는 지켜야 합니다.

섹션 타입 및 작성 가이드:
- hooking: 후킹/첫 화면 — 감정을 자극하는 강렬한 한 줄 카피(제목) + 서브카피. "이거 없이 어떻게 살았지?" 수준의 감정 자극. 제품명이나 기능 설명 금지. 감성/욕망/공포 소구.
- problem: 문제 공감 — 고객이 겪는 불편/고민을 짚어줌. "혹시 이런 경험 있으신가요?" 감정적 연결. 2~3가지 구체적 고민 시나리오를 각 단락으로.
- solution: 솔루션 제시 — "그래서 만들었습니다" 자연스러운 제품 소개. 문제→해결 흐름. 제품의 핵심 철학 포함.
- features: 핵심 특장점 — 3~5가지 차별점을 각각 크게 풀어서. 제목과 상세 설명 포함. 가장 긴 영역이어야 함.
- howto: 사용 방법/활용법 — 단계별. 각 단계 제목 + 설명.
- social_proof: 사회적 증거 — 리뷰, 판매량, 수상, 언론, Before&After. 리뷰가 없다면 전문가 의견, 성분 검증, 브랜드 스토리로 대체.
- specs: 스펙/상세 정보 — 성분, 사이즈, 소재, 용량 등 스펙 목록. "항목: 값" 형식으로.
- guarantee: 보증/신뢰 — 교환/환불 정책, 인증마크, 배송 정책, 제조 철학. 불안 해소 중심.
- cta: 최종 구매 유도 — 핵심 혜택 요약 3가지 + 긴급성 문구 + 구매 버튼 텍스트.

작성 판단 가이드:
- 가격이 높은 제품 → social_proof와 guarantee를 두껍게 작성
- 사용법이 복잡한 제품 → howto를 features 바로 뒤에 배치
- 리뷰가 없는 신제품 → social_proof를 브랜드 스토리/전문가 추천으로 대체
- 경쟁사 약점이 있는 경우 → 정면 비교 금지, 포지셔닝 재프레이밍

각 섹션의 imageGuide에는 반드시 "추천 색상 톤"과 "폰트 스타일" 힌트를 포함하세요.

[가격/이벤트 배너 처리]
인터뷰 답변에서 가격 처리 방식을 파악하여 아래 세 가지 경우에 맞게 처리하세요:

(1) 본문에 직접 가격 포함한다고 한 경우:
cta 섹션 body에 가격 정보를 자연스럽게 포함하세요. 예: "정가 59,900원 → 오늘 특가 39,900원 (33% 할인)" 형태로 혜택 요약에 녹여 넣으세요.

(2) 별도 이벤트 배너로 만들겠다고 한 경우:
sections 배열에 "event_banner" 타입 섹션을 cta 바로 앞에 추가하세요:
- sectionType: "event_banner"
- body: "정가: (금액)\n할인가: (금액)\n할인율: (%)\n이벤트 문구: (예: 출시 기념 특가 / 오늘만 특가)"
이때 cta 섹션에는 가격 정보를 넣지 마세요.

(3) 가격 포함 안 한다고 했거나 가격 정보가 없는 경우:
event_banner 섹션 생략, cta에도 가격 언급 없이 혜택과 긴급성만으로 작성하세요.

[SEO 키워드 자동 추출]
제품명, 카테고리, 원고 내용을 종합하여 네이버/쿠팡 검색에 유효한 SEO 키워드 5~10개를 추출하세요.
예: ["국산 보습크림", "민감성 피부 크림", "수분 크림 추천", ...]

아래 JSON 형식으로 응답하세요 (sections + colorPalette + fontRecommendation + layoutRationale + referenceGuide + keywords 모두 포함):

{
  "layoutRationale": "이 순서로 구성한 이유 — 제품 특성 기반 한 줄 설명 (40자 이내)",
  "sections": [
    {
      "sectionType": "hooking",
      "title": "감정을 자극하는 강렬한 한 줄 카피 (15자 이내)",
      "body": "서브카피: (공감을 이끄는 2~3문장. 제품 설명 금지, 감정/상황 묘사만)",
      "imageGuide": "이미지 설명. 색상 톤: (배경색/텍스트색 권장). 폰트: (제목/본문 폰트 스타일 권장)."
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
  },
  "referenceGuide": {
    "summary": "${productInfo.category} 카테고리에서 전환율이 높은 상세페이지 구조 분석 (30자 이내)",
    "sections": [
      {"label": "섹션명", "percentage": 20, "tip": "이 섹션에서 핵심 포인트 (20자 이내)"},
      {"label": "섹션명", "percentage": 35, "tip": "이 섹션에서 핵심 포인트 (20자 이내)"}
    ]
  },
  "keywords": ["SEO 키워드1", "SEO 키워드2", "SEO 키워드3"]
}

referenceGuide.sections의 percentage 합계는 반드시 100이어야 합니다.
JSON만 응답하세요.`;
}

function buildFallbackSections(productInfo: ProductInfo, usps: USP[]): ManuscriptSection[] {
  const name = productInfo.name || '제품';
  return [
    {
      id: 'ms-hooking',
      sectionType: 'hooking' as ManuscriptSectionType,
      title: `${name} 없이는 못 살 것 같습니다`,
      body: `지금 이 순간에도 당신은 불편함을 참고 있지 않나요?\n${productInfo.shortDescription || `${name}이(가) 당신의 일상을 바꿉니다.`}\n더 이상 타협하지 마세요.`,
      imageGuide: '제품 메인 사진 (감성적인 라이프스타일 연출). 색상 톤: 어두운 배경에 강렬한 대비. 폰트: 굵고 임팩트 있는 헤드라인.',
      visible: true,
      order: 0,
    },
    {
      id: 'ms-problem',
      sectionType: 'problem' as ManuscriptSectionType,
      title: '혹시 이런 고민 있으신가요?',
      body: `매번 같은 문제가 반복되는 느낌\n${name}을 찾기 전, 많은 분들이 이런 불편함을 겪었습니다. 원하는 결과가 나오지 않아 실망하고, 시간과 돈을 낭비한 경험.\n\n어떤 걸 써도 만족스럽지 않다\n선택지는 많은데 정작 나에게 딱 맞는 건 없고, 다 비슷비슷한 것 같아 선택 장애만 생기는 상황.\n\n가격 대비 효과가 의심스러울 때\n비싼 걸 써봤지만 큰 차이를 못 느끼거나, 저렴한 걸 쓰자니 찜찜한 그 딜레마.`,
      imageGuide: '고민하는 상황 연출 이미지. 색상 톤: 어두운 배경으로 문제감 강조. 폰트: 본문 중심 가독성 높은 서체.',
      visible: true,
      order: 1,
    },
    {
      id: 'ms-solution',
      sectionType: 'solution' as ManuscriptSectionType,
      title: `그래서 ${name}을(를) 만들었습니다`,
      body: `모든 불편함을 해결하기 위해 처음부터 다시 설계했습니다.\n${productInfo.shortDescription || `${name}은(는) 기존 제품들의 한계를 극복하고, 진짜 필요한 것에만 집중했습니다.`}\n\n타협 없는 원료와 설계, 실제로 효과가 있는 제품. ${name}이 그 답입니다.`,
      imageGuide: '제품 등장 씬 — 깔끔하고 자신감 있는 제품 이미지. 색상 톤: 밝아지는 전환 느낌. 폰트: 신뢰감 있는 서체.',
      visible: true,
      order: 2,
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
      order: 3,
    },
    {
      id: 'ms-howto',
      sectionType: 'howto' as ManuscriptSectionType,
      title: '이렇게 사용하세요',
      body: `1단계: 준비하기\n제품을 개봉하고 구성품을 확인합니다.\n\n2단계: 적용하기\n제품 설명서에 따라 올바르게 사용합니다.\n\n3단계: 효과 확인\n꾸준히 사용하며 변화를 느껴보세요.`,
      imageGuide: '사용 단계별 시연 사진 3장 (순서대로 배치)',
      visible: true,
      order: 4,
    },
    {
      id: 'ms-social_proof',
      sectionType: 'social_proof' as ManuscriptSectionType,
      title: '이미 많은 분들이 경험했습니다',
      body: `"처음엔 반신반의했는데 써보고 나서 주변에 다 추천했어요" — 실제 구매 고객\n\n누적 판매량 10,000개 돌파\n출시 이후 꾸준한 재구매율 68%, 평균 평점 4.7점.\n\n전문가 검증\n해당 분야 전문가들이 성분과 효능을 직접 테스트하고 추천했습니다.`,
      imageGuide: '리뷰 스크린샷 또는 별점/판매량 그래픽. 색상 톤: 신뢰감 있는 밝은 배경.',
      visible: true,
      order: 5,
    },
    {
      id: 'ms-specs',
      sectionType: 'specs' as ManuscriptSectionType,
      title: '제품 상세 정보',
      body: `제품명: ${name}\n용량/크기: 확인 필요\n주요 성분/소재: 확인 필요\n제조국: 대한민국\n유통기한/사용기간: 확인 필요\n보관 방법: 직사광선을 피해 서늘한 곳에 보관`,
      imageGuide: '제품 성분표 또는 스펙 이미지. 깔끔한 표 형태 레이아웃.',
      visible: true,
      order: 6,
    },
    {
      id: 'ms-guarantee',
      sectionType: 'guarantee' as ManuscriptSectionType,
      title: '안심하고 구매하세요',
      body: `무료 배송\n모든 주문에 무료 배송 제공. 주문 후 2~3일 이내 도착.\n\n100% 만족 보장\n받아보시고 만족스럽지 않으시면 30일 이내 전액 환불. 복잡한 절차 없이 빠른 처리.\n\n정품 인증\n공식 판매처에서만 구매 가능한 정품입니다. 위조품 걱정 없이 안심하세요.`,
      imageGuide: '배송 박스 이미지 또는 인증 마크. 신뢰감 있는 깔끔한 레이아웃.',
      visible: true,
      order: 7,
    },
    {
      id: 'ms-cta',
      sectionType: 'cta' as ManuscriptSectionType,
      title: `지금 ${name} 시작하세요`,
      body: `무료 배송 + 30일 환불 보장\n오늘 구매 시 특별 할인 적용\n지금 바로 경험해보세요\n\n긴급성: 이 가격은 한정 기간만 제공됩니다\n구매 버튼: 특가로 구매하기`,
      imageGuide: '강렬한 제품 이미지 또는 라이프스타일 사진 (구매 욕구를 자극하는 비주얼)',
      visible: true,
      order: 8,
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
        max_tokens: 6000,
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
    const layoutRationale: string | null = parsed.layoutRationale || null;
    const referenceGuide: ReferenceGuide | null = parsed.referenceGuide || null;
    const keywords: string[] | null = Array.isArray(parsed.keywords) ? parsed.keywords : null;

    return NextResponse.json({ sections, colorPalette, fontRecommendation, layoutRationale, referenceGuide, keywords });
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
