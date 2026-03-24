"""USP(고유 판매 포인트) 추출 프롬프트"""

from app.models.product import CategoryType

SYSTEM_PROMPT = """당신은 한국 이커머스 마케팅 전문가입니다.
상품 정보와 인터뷰 답변을 분석하여 가장 효과적인 USP(Unique Selling Points)를 추출합니다.

USP 추출 원칙:
1. 고객 관점에서 가장 매력적인 포인트를 선별
2. 경쟁 제품과 명확히 차별화되는 요소 우선
3. 구체적인 수치나 데이터가 뒷받침되는 USP 우선
4. 한국 소비자의 구매 결정 요인에 맞게 구성
"""

USP_EXTRACTION_PROMPT = """다음 상품 정보와 인터뷰 답변을 분석하여 USP 3~5개를 추출해주세요.

[상품 정보]
{product_info}

[인터뷰 Q&A]
{interview_qa}

각 USP는 아래 JSON 형식으로 작성해주세요:
{{
  "usps": [
    {{
      "title": "USP 핵심 키워드 (4~8자)",
      "description": "USP 설명 (20~40자, 구체적 혜택 중심)",
      "icon": "적절한 이모지 1개"
    }}
  ]
}}

USP 선별 기준:
1. 고객의 Pain Point를 직접 해결하는 포인트
2. 경쟁사가 쉽게 따라할 수 없는 고유 강점
3. 숫자나 인증으로 뒷받침 가능한 포인트
4. 한국 소비자가 특히 중요시하는 요소 (원산지, 인증, 가성비, 후기 등)

JSON만 응답하세요.
"""

# 카테고리별 USP 가이드라인
CATEGORY_USP_GUIDELINES = {
    CategoryType.FOOD: """
식품 카테고리 USP 가이드:
- 원산지/산지 직송 (신선도 강조)
- 무첨가/유기농 등 클린라벨
- HACCP, 유기농 인증
- 맛/식감의 차별성
- 가격 대비 용량 (가성비)
- 간편성 (조리 시간, 포장 단위)
""",
    CategoryType.COSMETICS: """
화장품 카테고리 USP 가이드:
- 핵심 성분과 함량
- 피부과 테스트/임상 결과
- 피부 타입별 적합성
- 브랜드 스토리/개발 배경
- 텍스처/발림성
- 가격 대비 용량 (ml당 가격)
""",
    CategoryType.HEALTH: """
건강기능식품 카테고리 USP 가이드:
- 원료 등급/특허 원료
- 식약처 인증/기능성 표시
- 함량 (일일 섭취량 대비)
- 임상/논문 근거
- 복용 편의성
- 1일 비용 (가성비)
""",
    CategoryType.ELECTRONICS: """
가전/전자 카테고리 USP 가이드:
- 핵심 스펙 (성능 수치)
- 특허 기술/독점 기능
- 에너지 효율/소음
- A/S/보증 기간
- 디자인/크기/무게
- 수상 이력
""",
    CategoryType.FASHION: """
패션 카테고리 USP 가이드:
- 소재/원단 품질
- 핏/실루엣
- 디테일/마감 퀄리티
- 사계절 활용도
- 세탁/관리 용이성
- 가격 대비 퀄리티
""",
    CategoryType.LIVING: """
생활용품 카테고리 USP 가이드:
- 문제 해결력 (Before/After)
- 소재/안전 인증
- 사용 편의성
- 내구성/수명
- 수납/공간 효율
- 디자인/컬러 선택지
""",
}


def build_usp_prompt(product_info: str, interview_qa: str, category: CategoryType) -> str:
    """USP 추출용 프롬프트 생성"""
    guideline = CATEGORY_USP_GUIDELINES.get(
        category, CATEGORY_USP_GUIDELINES[CategoryType.LIVING]
    )
    base_prompt = USP_EXTRACTION_PROMPT.format(
        product_info=product_info,
        interview_qa=interview_qa,
    )
    return f"{base_prompt}\n\n{guideline}"
