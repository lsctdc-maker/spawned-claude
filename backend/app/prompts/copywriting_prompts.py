"""카피라이팅 생성 프롬프트 (Claude API용)"""

from app.models.product import ToneStyle
from app.models.template import SectionType

# ──────────────────────────────────────────────
# 시스템 프롬프트
# ──────────────────────────────────────────────

SYSTEM_PROMPT = """당신은 한국 이커머스 상세페이지 전문 카피라이터입니다.
쿠팡, 네이버 스마트스토어, 카카오 쇼핑 등 한국 온라인 쇼핑몰에서 전환율이 높은 상세페이지 카피를 작성합니다.

핵심 원칙:
1. 고객의 Pain Point를 정확히 짚어 공감을 이끌어내세요.
2. 스크롤을 멈추게 하는 강렬한 헤드카피를 작성하세요.
3. 신뢰를 쌓는 구체적인 수치와 근거를 활용하세요.
4. 한국 소비자의 구매 심리에 맞는 표현을 사용하세요.
5. 모바일 환경(860px 이하)에서의 가독성을 고려하세요.

작성 시 유의사항:
- 과장 광고나 허위 표현은 절대 금지
- '~입니다체' 또는 '~해요체' 사용 (카테고리에 맞게)
- 이모지는 적절히 활용하되 과하지 않게
- 핵심 키워드는 반복하되 자연스럽게
- 숫자와 통계는 구체적으로 (예: "많은 분" → "누적 판매 15만 개")
"""

# ──────────────────────────────────────────────
# 톤앤매너별 지침
# ──────────────────────────────────────────────

TONE_INSTRUCTIONS = {
    ToneStyle.TRUST: """
[신뢰감 톤 지침]
- 데이터와 수치를 적극적으로 활용하세요.
- 인증, 수상 이력, 논문 등 객관적 근거를 강조하세요.
- 전문가 추천, 기관 인증 등 권위 요소를 활용하세요.
- 차분하고 전문적인 어조를 유지하세요.
- 예시 톤: "임상시험 결과, 4주 만에 수분량 200% 개선이 확인되었습니다."
""",
    ToneStyle.EMOTIONAL: """
[감성적 톤 지침]
- 고객의 일상 속 Pain Point에 공감하는 스토리텔링을 사용하세요.
- 감성적인 표현과 따뜻한 어조를 사용하세요.
- 제품을 통한 삶의 변화를 그려주세요.
- "당신", "우리" 등 친근한 호칭을 활용하세요.
- 예시 톤: "매일 아침, 거울 앞에서 웃을 수 있는 자신감을 선물하세요."
""",
    ToneStyle.IMPACT: """
[임팩트 톤 지침]
- 강렬하고 짧은 헤드카피로 시선을 끄세요.
- 숫자를 크게 강조하세요 (예: "1초에 1개씩 팔리는").
- 비교 표현을 적극 활용하세요 (예: "기존 대비 300% 향상").
- 긴급성을 자연스럽게 부여하세요 (한정 수량, 특가 등).
- 예시 톤: "단 3일, 누적 판매 10만 개 돌파."
""",
}

# ──────────────────────────────────────────────
# 섹션별 프롬프트
# ──────────────────────────────────────────────

SECTION_PROMPTS = {
    SectionType.HERO: """
[히어로 섹션 카피 작성]
다음 정보를 바탕으로 상세페이지 최상단 히어로 섹션의 카피를 작성하세요.

필수 작성 항목:
1. headline: 메인 헤드카피 (15자 이내, 임팩트 있게)
2. subheadline: 서브 헤드카피 (30자 이내, 핵심 가치 전달)
3. body_text: 한 줄 설명 (50자 이내, 제품 핵심 요약)
4. cta_text: CTA 버튼 텍스트 (8자 이내)

JSON 형식으로 응답하세요.
""",

    SectionType.USP_POINTS: """
[USP 포인트 섹션 카피 작성]
다음 정보를 바탕으로 제품의 USP(고유 판매 포인트) 3~5개를 작성하세요.

각 USP 항목별 필수 작성:
1. title: USP 제목 (8자 이내, 핵심 키워드)
2. description: USP 설명 (40자 이내, 구체적 혜택)
3. icon: 적절한 이모지 1개

bullet_points 배열에 각 USP를 "icon title - description" 형식으로 넣어주세요.
headline에는 USP 섹션의 헤드카피를 작성하세요.

JSON 형식으로 응답하세요.
""",

    SectionType.DETAIL_DESC: """
[상세 설명 섹션 카피 작성]
다음 정보를 바탕으로 제품의 상세 설명 카피를 작성하세요.

필수 작성 항목:
1. headline: 섹션 헤드카피 (20자 이내)
2. subheadline: 보조 설명 (40자 이내)
3. body_text: 상세 설명 (200~400자, 단락 나누어 작성)
4. bullet_points: 핵심 포인트 3~5개 (각 30자 이내)

구체적인 수치, 원료, 기술 등을 포함하여 설득력 있게 작성하세요.

JSON 형식으로 응답하세요.
""",

    SectionType.COMPARISON: """
[비교표 섹션 카피 작성]
다음 정보를 바탕으로 "우리 제품 vs 일반 제품" 비교표 카피를 작성하세요.

필수 작성 항목:
1. headline: 비교표 섹션 헤드카피 (20자 이내)
2. subheadline: 보조 설명 (30자 이내)
3. bullet_points: 비교 항목 4~6개
   - 각 항목은 "비교기준|우리제품|일반제품" 형식으로 작성
4. extra_data에 "our_brand" 키로 브랜드명을 포함

비교 시 과장되지 않으면서도 차별점이 명확하게 드러나도록 작성하세요.

JSON 형식으로 응답하세요.
""",

    SectionType.HOWTO: """
[사용법(HOW TO) 섹션 카피 작성]
다음 정보를 바탕으로 제품 사용법/활용법 카피를 작성하세요.

필수 작성 항목:
1. headline: HOW TO 섹션 헤드카피 (15자 이내)
2. subheadline: 보조 설명 (30자 이내)
3. bullet_points: 사용 단계 3~5개
   - 각 단계는 "STEP N. 단계 설명" 형식
4. body_text: 사용 시 팁이나 주의사항 (100자 이내)

누구나 쉽게 따라할 수 있도록 간결하게 작성하세요.

JSON 형식으로 응답하세요.
""",

    SectionType.CERTIFICATION: """
[인증/신뢰 섹션 카피 작성]
다음 정보를 바탕으로 인증, 수상, 테스트 결과 등 신뢰 요소 카피를 작성하세요.

필수 작성 항목:
1. headline: 신뢰 섹션 헤드카피 (15자 이내)
2. subheadline: 보조 설명 (30자 이내)
3. bullet_points: 인증/신뢰 항목 3~5개
   - 각 항목은 "인증마크이모지 인증명 - 상세설명" 형식
4. body_text: 품질에 대한 자신감 표현 한 문장

구체적인 인증 기관명과 날짜가 있다면 포함하세요.

JSON 형식으로 응답하세요.
""",

    SectionType.REVIEWS: """
[리뷰/후기 섹션 카피 작성]
다음 정보를 바탕으로 리뷰 섹션의 안내 카피를 작성하세요.
(실제 리뷰가 아닌, 리뷰 섹션을 꾸미기 위한 카피)

필수 작성 항목:
1. headline: 리뷰 섹션 헤드카피 (15자 이내, 예: "실제 고객 후기")
2. subheadline: 보조 설명 (30자 이내, 예: "직접 사용해본 고객님들의 솔직 후기")
3. bullet_points: 예시 리뷰 요약 3~5개
   - 각 항목은 "⭐⭐⭐⭐⭐ 리뷰 핵심 한줄 요약 - 작성자(닉네임)" 형식
4. body_text: 리뷰 통계 요약 (예: "평균 평점 4.8점, 리뷰 3,200건")

고객 신뢰를 높이는 방향으로 작성하세요.

JSON 형식으로 응답하세요.
""",

    SectionType.FAQ: """
[FAQ 섹션 카피 작성]
다음 정보를 바탕으로 자주 묻는 질문 FAQ를 작성하세요.

필수 작성 항목:
1. headline: FAQ 섹션 헤드카피 (15자 이내)
2. subheadline: 보조 설명 (30자 이내)
3. bullet_points: Q&A 4~6개
   - 각 항목은 "Q. 질문 내용|A. 답변 내용" 형식으로 작성
4. body_text: 추가 문의 안내 (고객센터 등)

실제 구매 고객이 궁금해할 핵심 질문 위주로 작성하세요.

JSON 형식으로 응답하세요.
""",

    SectionType.CTA: """
[CTA(구매 유도) 섹션 카피 작성]
다음 정보를 바탕으로 최하단 구매 유도 CTA 카피를 작성하세요.

필수 작성 항목:
1. headline: 최종 CTA 헤드카피 (20자 이내, 구매 욕구 자극)
2. subheadline: 구매를 망설이는 고객을 설득하는 한 마디 (40자 이내)
3. cta_text: CTA 버튼 텍스트 (10자 이내, 예: "지금 바로 구매하기")
4. body_text: 혜택/보장 요약 (무료배송, 교환/반품, 할인 등 60자 이내)
5. bullet_points: 구매 혜택 2~3개 (각 20자 이내)

긴급성과 혜택을 동시에 어필하세요.

JSON 형식으로 응답하세요.
""",
}


def get_section_prompt(section_type: SectionType) -> str:
    """섹션 타입에 맞는 프롬프트 반환"""
    return SECTION_PROMPTS.get(section_type, "")


def get_tone_instruction(tone: ToneStyle) -> str:
    """톤 스타일에 맞는 지침 반환"""
    return TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS[ToneStyle.TRUST])


def build_copywriting_prompt(
    section_type: SectionType,
    tone: ToneStyle,
    product_info: str,
    interview_context: str,
    usp_context: str,
) -> str:
    """최종 카피라이팅 프롬프트 조합"""
    section_prompt = get_section_prompt(section_type)
    tone_instruction = get_tone_instruction(tone)

    return f"""{tone_instruction}

{section_prompt}

[상품 정보]
{product_info}

[인터뷰 분석 결과]
{interview_context}

[USP (고유 판매 포인트)]
{usp_context}

위 정보를 종합하여 해당 섹션의 카피를 JSON 형식으로 작성해주세요.
JSON 키: headline, subheadline, body_text, bullet_points(배열), cta_text, extra_data(객체)
빈 값은 빈 문자열("")이나 빈 배열([])로 작성하세요.
"""
