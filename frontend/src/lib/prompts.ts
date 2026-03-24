// 서버사이드 전용 프롬프트 - API Routes에서만 사용
import { CategoryKey, ToneKey } from './types';

// ===== USP 추출 시스템 프롬프트 =====
export const USP_SYSTEM_PROMPT = `당신은 한국 이커머스 마케팅 전문가입니다.
상품 정보와 인터뷰 답변을 분석하여 가장 효과적인 USP(Unique Selling Points)를 추출합니다.

USP 추출 원칙:
1. 고객 관점에서 가장 매력적인 포인트를 선별
2. 경쟁 제품과 명확히 차별화되는 요소 우선
3. 구체적인 수치나 데이터가 뒷받침되는 USP 우선
4. 한국 소비자의 구매 결정 요인에 맞게 구성`;

export const USP_EXTRACTION_PROMPT = `다음 상품 정보와 인터뷰 답변을 분석하여 USP 3~5개를 추출해주세요.

[상품 정보]
{product_info}

[인터뷰 답변]
{interview_answers}

각 USP는 아래 JSON 형식으로 작성해주세요:
{
  "usps": [
    {
      "title": "USP 핵심 키워드 (4~8자)",
      "description": "USP 설명 (20~40자, 구체적 혜택 중심)",
      "icon": "적절한 이모지 1개"
    }
  ]
}

USP 선별 기준:
1. 고객의 Pain Point를 직접 해결하는 포인트
2. 경쟁사가 쉽게 따라할 수 없는 고유 강점
3. 숫자나 인증으로 뒷받침 가능한 포인트
4. 한국 소비자가 특히 중요시하는 요소 (원산지, 인증, 가성비, 후기 등)

JSON만 응답하세요.`;

// ===== 카피라이팅 시스템 프롬프트 =====
export const COPYWRITING_SYSTEM_PROMPT = `당신은 한국 이커머스 상세페이지 전문 카피라이터입니다.
쿠팡, 네이버 스마트스토어, 카카오 쇼핑 등 한국 온라인 쇼핑몰에서 전환율이 높은 상세페이지 카피를 작성합니다.

핵심 원칙:
1. 고객의 Pain Point를 정확히 짚어 공감을 이끌어내세요.
2. 스크롤을 멈추게 하는 강렬한 헤드카피를 작성하세요.
3. 신뢰를 쌓는 구체적인 수치와 근거를 활용하세요.
4. 한국 소비자의 구매 심리에 맞는 표현을 사용하세요.
5. 모바일 환경(860px 이하)에서의 가독성을 고려하세요.`;

// ===== 톤앤매너별 지침 =====
export const TONE_INSTRUCTIONS: Record<ToneKey, string> = {
  trust: `[신뢰감 톤 지침]
- 데이터와 수치를 적극적으로 활용하세요.
- 인증, 수상 이력, 논문 등 객관적 근거를 강조하세요.
- 전문가 추천, 기관 인증 등 권위 요소를 활용하세요.
- 차분하고 전문적인 어조를 유지하세요.`,
  emotional: `[감성적 톤 지침]
- 고객의 일상 속 Pain Point에 공감하는 스토리텔링을 사용하세요.
- 감성적인 표현과 따뜻한 어조를 사용하세요.
- 제품을 통한 삶의 변화를 그려주세요.
- "당신", "우리" 등 친근한 호칭을 활용하세요.`,
  impact: `[임팩트 톤 지침]
- 강렬하고 짧은 헤드카피로 시선을 끄세요.
- 숫자를 크게 강조하세요 (예: "1초에 1개씩 팔리는").
- 비교 표현을 적극 활용하세요 (예: "기존 대비 300% 향상").
- 긴급성을 자연스럽게 부여하세요 (한정 수량, 특가 등).`,
};

// ===== 카테고리별 USP 가이드라인 =====
export const CATEGORY_USP_GUIDELINES: Record<CategoryKey, string> = {
  food: `식품 카테고리 USP 가이드: 원산지/산지 직송, 무첨가/유기농, HACCP 인증, 맛/식감 차별성, 가성비, 간편성`,
  cosmetics: `화장품 카테고리 USP 가이드: 핵심 성분/함량, 피부과 테스트/임상, 피부 타입별 적합성, 텍스처/발림성, ml당 가격`,
  health: `건강기능식품 카테고리 USP 가이드: 원료 등급/특허 원료, 식약처 인증, 함량, 임상/논문 근거, 복용 편의성, 1일 비용`,
  electronics: `가전/전자 카테고리 USP 가이드: 핵심 스펙, 특허 기술, 에너지 효율/소음, A/S/보증 기간, 디자인/크기/무게`,
  fashion: `패션 카테고리 USP 가이드: 소재/원단, 핏/실루엣, 디테일/마감, 사계절 활용도, 세탁/관리 용이성, 가격 대비 퀄리티`,
  living: `생활용품 카테고리 USP 가이드: 문제 해결력, 소재/안전 인증, 사용 편의성, 내구성/수명, 수납/공간 효율, 디자인/컬러`,
  pets: `반려동물 카테고리 USP 가이드: 원재료 안전성, 기호성/수용성, 수의사 추천/AAFCO 기준, 종/크기/연령별 맞춤, 반려인 만족도`,
  kids: `유아/아동 카테고리 USP 가이드: KC 안전인증, 무독성/BPA-free 소재, 연령별 발달 적합성, 교육적 효과, 세척/관리 편의성`,
  sports: `스포츠/아웃도어 카테고리 USP 가이드: 퍼포먼스 향상 수치, 소재/기술력, 경량/내구성, 프로 선수 추천, 다양한 활동 호환`,
  interior: `인테리어/가구 카테고리 USP 가이드: 소재/마감 퀄리티, 공간 분위기 연출, 조립 편의성, 크기/무게, 디자인 스타일 호환`,
  automotive: `자동차용품 카테고리 USP 가이드: 차종 호환성, 설치 편의성, 내구성/내열성, 안전 인증, 운전 편의 개선 효과`,
  stationery: `문구/오피스 카테고리 USP 가이드: 디자인 차별성, 필기감/사용감, 소재 퀄리티, 다용도 활용, 가성비`,
  beverages: `주류/음료 카테고리 USP 가이드: 맛/향 차별성, 원재료/제조 공정, 페어링 제안, 도수/칼로리, 수상/인증 이력`,
  digital: `디지털/소프트웨어 카테고리 USP 가이드: 핵심 문제 해결력, 기존 솔루션 대비 장점, UI/UX, 호환성/지원 플랫폼, 가격 경쟁력`,
  others: `기타 카테고리 USP 가이드: 핵심 매력 포인트, 타 제품 대비 차별성, 품질/소재, 고객 만족 포인트, 가성비`,
};

// ===== 섹션별 카피 생성 프롬프트 빌더 =====
export function buildCopywritingPrompt(
  productInfo: string,
  uspContext: string,
  tone: ToneKey,
  category: CategoryKey
): string {
  const toneInstruction = TONE_INSTRUCTIONS[tone];

  return `${toneInstruction}

다음 상품 정보와 USP를 바탕으로 상세페이지의 모든 섹션 카피를 한 번에 생성해주세요.

[상품 정보]
${productInfo}

[USP]
${uspContext}

아래 JSON 형식으로 응답하세요:
{
  "hero": {
    "headline": "메인 헤드카피 (15자 이내)",
    "subheadline": "서브 헤드카피 (30자 이내)",
    "ctaText": "CTA 버튼 텍스트 (8자 이내)",
    "backgroundStyle": "gradient"
  },
  "usp_points": {
    "points": [
      { "title": "USP 제목", "description": "USP 설명 (40자 이내)", "icon": "이모지" }
    ]
  },
  "detail": {
    "paragraphs": [
      { "title": "소제목", "text": "설명 (100자 이내)", "imagePosition": "right" },
      { "title": "소제목", "text": "설명 (100자 이내)", "imagePosition": "left" }
    ]
  },
  "comparison": {
    "headers": ["항목", "상품명", "일반 제품"],
    "rows": [
      { "label": "비교항목", "values": ["우리제품 값", "일반제품 값"] }
    ]
  },
  "howto": {
    "steps": [
      { "step": 1, "title": "단계 제목", "description": "단계 설명" }
    ]
  },
  "certification": {
    "items": [
      { "name": "인증명", "description": "설명", "icon": "이모지" }
    ]
  },
  "reviews": {
    "reviews": [
      { "author": "김**", "rating": 5, "text": "리뷰 내용", "date": "2024-01-15" }
    ]
  },
  "faq": {
    "items": [
      { "question": "질문", "answer": "답변" }
    ]
  },
  "cta": {
    "headline": "CTA 헤드카피",
    "subtext": "서브텍스트",
    "buttonText": "버튼 텍스트",
    "urgencyText": "긴급 텍스트"
  }
}

JSON만 응답하세요.`;
}
