"""카테고리별 AI 인터뷰 질문 프롬프트"""

from typing import Dict, List

from app.models.product import CategoryType, InterviewQuestion

# ──────────────────────────────────────────────
# 카테고리별 인터뷰 질문 세트
# ──────────────────────────────────────────────

INTERVIEW_QUESTIONS: Dict[CategoryType, List[InterviewQuestion]] = {
    # ── 식품 ──
    CategoryType.FOOD: [
        InterviewQuestion(
            question_id=101,
            question_text="원재료의 원산지는 어디인가요? 산지 직송이나 특별한 생산 방식이 있다면 알려주세요.",
            category=CategoryType.FOOD,
            placeholder="예: 전남 보성 녹차밭에서 직접 재배한 유기농 녹차잎 사용",
        ),
        InterviewQuestion(
            question_id=102,
            question_text="식품 관련 인증을 보유하고 있나요? (HACCP, 유기농, 무항생제, GAP 등)",
            category=CategoryType.FOOD,
            placeholder="예: HACCP 인증, 유기가공식품 인증 보유",
        ),
        InterviewQuestion(
            question_id=103,
            question_text="주요 타겟 고객은 누구인가요? 어떤 상황에서 이 제품을 구매할까요?",
            category=CategoryType.FOOD,
            placeholder="예: 30~40대 건강을 챙기는 직장인, 간편한 아침 대용식을 찾는 분",
        ),
        InterviewQuestion(
            question_id=104,
            question_text="경쟁 제품 대비 가장 큰 차별점은 무엇인가요? 맛, 품질, 가격 등 구체적으로 알려주세요.",
            category=CategoryType.FOOD,
            placeholder="예: 인공감미료 0% 사용, 자연 과즙만으로 단맛을 냄",
        ),
        InterviewQuestion(
            question_id=105,
            question_text="고객이 이 제품을 선택해야 하는 이유를 3가지로 요약하면?",
            category=CategoryType.FOOD,
            placeholder="예: 1) 무첨가 2) 원산지 직송 신선함 3) 합리적 가격",
        ),
        InterviewQuestion(
            question_id=106,
            question_text="추천하는 섭취/조리 방법이 있나요?",
            category=CategoryType.FOOD,
            placeholder="예: 찬물에 1포 타서 간편하게 섭취, 요거트에 섞어서 먹으면 더 맛있음",
        ),
    ],

    # ── 화장품 ──
    CategoryType.COSMETICS: [
        InterviewQuestion(
            question_id=201,
            question_text="핵심 성분과 그 효능은 무엇인가요? 함량도 알려주세요.",
            category=CategoryType.COSMETICS,
            placeholder="예: 나이아신아마이드 5% 함유 - 피부 톤 개선 및 미백 기능",
        ),
        InterviewQuestion(
            question_id=202,
            question_text="어떤 피부 타입에 적합한가요? 특정 피부 고민을 해결하나요?",
            category=CategoryType.COSMETICS,
            placeholder="예: 건성~복합성 피부 적합, 특히 환절기 건조한 피부 보습에 효과적",
        ),
        InterviewQuestion(
            question_id=203,
            question_text="임상시험이나 효능 테스트 결과가 있나요?",
            category=CategoryType.COSMETICS,
            placeholder="예: 피부과 테스트 완료, 4주 사용 시 수분량 200% 증가 임상 결과",
        ),
        InterviewQuestion(
            question_id=204,
            question_text="경쟁 브랜드 대비 차별화 포인트는?",
            category=CategoryType.COSMETICS,
            placeholder="예: 동일 성분 대비 2배 함량, 국내 피부과 공동 연구 개발",
        ),
        InterviewQuestion(
            question_id=205,
            question_text="브랜드 스토리나 개발 비하인드가 있나요?",
            category=CategoryType.COSMETICS,
            placeholder="예: 피부과 전문의가 아토피 딸을 위해 직접 개발한 제품",
        ),
        InterviewQuestion(
            question_id=206,
            question_text="사용법과 추천 루틴을 알려주세요.",
            category=CategoryType.COSMETICS,
            placeholder="예: 세안 후 토너 다음 단계에 2~3방울 도포, 아침/저녁 사용",
        ),
    ],

    # ── 건강기능식품 ──
    CategoryType.HEALTH: [
        InterviewQuestion(
            question_id=301,
            question_text="핵심 원료와 함량은? 원료의 등급이나 특허가 있나요?",
            category=CategoryType.HEALTH,
            placeholder="예: rTG 오메가3 1200mg, 노르웨이 산 초임계 추출 원료",
        ),
        InterviewQuestion(
            question_id=302,
            question_text="어떤 건강 고민을 가진 분에게 추천하나요?",
            category=CategoryType.HEALTH,
            placeholder="예: 눈 건강이 걱정되는 40대 이상, 장시간 모니터 작업자",
        ),
        InterviewQuestion(
            question_id=303,
            question_text="식약처 인증이나 GMP 인증 등 보유 인증을 알려주세요.",
            category=CategoryType.HEALTH,
            placeholder="예: 식약처 건강기능식품 인정, GMP 인증 시설에서 생산",
        ),
        InterviewQuestion(
            question_id=304,
            question_text="관련 논문이나 임상 데이터가 있나요?",
            category=CategoryType.HEALTH,
            placeholder="예: SCI급 논문 3편 게재, 12주 임상시험 결과 혈중 농도 30% 개선",
        ),
        InterviewQuestion(
            question_id=305,
            question_text="추천 복용법과 주의사항은?",
            category=CategoryType.HEALTH,
            placeholder="예: 1일 1회 2캡슐, 식후 복용 권장, 임산부 섭취 주의",
        ),
        InterviewQuestion(
            question_id=306,
            question_text="경쟁 제품 대비 원료/함량/가격 면에서 어떤 우위가 있나요?",
            category=CategoryType.HEALTH,
            placeholder="예: 동일 원료 대비 함량 2배, 1일 비용 500원대로 업계 최저",
        ),
    ],

    # ── 가전/전자 ──
    CategoryType.ELECTRONICS: [
        InterviewQuestion(
            question_id=401,
            question_text="핵심 스펙과 기술적 차별점을 알려주세요.",
            category=CategoryType.ELECTRONICS,
            placeholder="예: BLDC 모터 탑재, 최대 40,000RPM, 소음 55dB 이하",
        ),
        InterviewQuestion(
            question_id=402,
            question_text="기존 제품 대비 어떤 점이 개선되었나요?",
            category=CategoryType.ELECTRONICS,
            placeholder="예: 전작 대비 배터리 수명 2배 향상, 무게 30% 경량화",
        ),
        InterviewQuestion(
            question_id=403,
            question_text="주요 사용 시나리오를 설명해주세요. 어떤 상황에서 빛을 발하나요?",
            category=CategoryType.ELECTRONICS,
            placeholder="예: 원룸에서 빨래 건조 시, 장마철 실내 습도 관리 시",
        ),
        InterviewQuestion(
            question_id=404,
            question_text="A/S 정책과 보증 기간은?",
            category=CategoryType.ELECTRONICS,
            placeholder="예: 본체 3년 무상 보증, 모터 10년 보증, 전국 서비스센터 운영",
        ),
        InterviewQuestion(
            question_id=405,
            question_text="적용된 특허 기술이나 수상 이력이 있나요?",
            category=CategoryType.ELECTRONICS,
            placeholder="예: 국내 특허 2건, CES 2024 혁신상 수상",
        ),
        InterviewQuestion(
            question_id=406,
            question_text="패키지 구성품과 설치 방법을 알려주세요.",
            category=CategoryType.ELECTRONICS,
            placeholder="예: 본체 + 리모컨 + 필터 2개 + 설치 키트, 자가설치 가능",
        ),
    ],

    # ── 패션 ──
    CategoryType.FASHION: [
        InterviewQuestion(
            question_id=501,
            question_text="소재와 원단 정보를 상세히 알려주세요.",
            category=CategoryType.FASHION,
            placeholder="예: 이태리 수입 메리노 울 100%, 안감 실크 혼방",
        ),
        InterviewQuestion(
            question_id=502,
            question_text="추천 스타일링과 코디법을 알려주세요.",
            category=CategoryType.FASHION,
            placeholder="예: 슬랙스와 매치하면 세미 포멀룩, 청바지와 함께 캐주얼하게",
        ),
        InterviewQuestion(
            question_id=503,
            question_text="사이즈와 핏 정보를 알려주세요. 모델 착용 사이즈도 있으면 좋습니다.",
            category=CategoryType.FASHION,
            placeholder="예: 오버핏, 모델(175cm/65kg) M 착용, 일반 사이즈 대비 한 사이즈 크게 제작",
        ),
        InterviewQuestion(
            question_id=504,
            question_text="세탁 및 관리 방법은?",
            category=CategoryType.FASHION,
            placeholder="예: 드라이클리닝 권장, 울 전용 세제 사용 시 손세탁 가능",
        ),
        InterviewQuestion(
            question_id=505,
            question_text="디자인 포인트와 디테일을 알려주세요.",
            category=CategoryType.FASHION,
            placeholder="예: YKK 지퍼 사용, 히든 포켓 2개, 리브 소매 마감",
        ),
        InterviewQuestion(
            question_id=506,
            question_text="타겟 고객과 착용 시즌/TPO는?",
            category=CategoryType.FASHION,
            placeholder="예: 20~30대 남성, 봄/가을 간절기 데일리 아우터",
        ),
    ],

    # ── 생활용품 ──
    CategoryType.LIVING: [
        InterviewQuestion(
            question_id=601,
            question_text="제품의 소재와 제조 방식을 알려주세요.",
            category=CategoryType.LIVING,
            placeholder="예: 100% 천연 대나무 소재, 수작업 가공",
        ),
        InterviewQuestion(
            question_id=602,
            question_text="어떤 문제를 해결하는 제품인가요?",
            category=CategoryType.LIVING,
            placeholder="예: 좁은 욕실 수납 문제 해결, 벽에 구멍 없이 설치 가능",
        ),
        InterviewQuestion(
            question_id=603,
            question_text="사용 편의성은 어떤가요? 특별한 기능이 있나요?",
            category=CategoryType.LIVING,
            placeholder="예: 원터치 분리 세척, 식기세척기 사용 가능, 접이식 보관",
        ),
        InterviewQuestion(
            question_id=604,
            question_text="안전 인증이나 테스트 결과가 있나요?",
            category=CategoryType.LIVING,
            placeholder="예: KC 안전인증, 식품 접촉 안전 테스트 통과, BPA free",
        ),
        InterviewQuestion(
            question_id=605,
            question_text="설치/사용 방법을 알려주세요.",
            category=CategoryType.LIVING,
            placeholder="예: 부착 테이프로 벽에 고정, 3단계로 간단 조립, 설명서 포함",
        ),
        InterviewQuestion(
            question_id=606,
            question_text="구성품과 사이즈 옵션을 알려주세요.",
            category=CategoryType.LIVING,
            placeholder="예: S/M/L 3종 세트, 색상 4종 택 1, 수납 파우치 포함",
        ),
    ],
}


def get_questions_for_category(category: CategoryType) -> List[InterviewQuestion]:
    """특정 카테고리의 인터뷰 질문 목록 반환"""
    return INTERVIEW_QUESTIONS.get(category, INTERVIEW_QUESTIONS[CategoryType.LIVING])


def get_question_by_id(category: CategoryType, question_id: int) -> InterviewQuestion | None:
    """질문 ID로 특정 질문 조회"""
    questions = get_questions_for_category(category)
    for q in questions:
        if q.question_id == question_id:
            return q
    return None
