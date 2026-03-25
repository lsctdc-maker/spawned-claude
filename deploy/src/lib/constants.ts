import { CategoryInfo, CategoryKey, ToneInfo, ToneKey, InterviewQuestion } from './types';

export const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  food: { label: '식품', primary: '#c3c0ff', secondary: '#1c1b2e' },
  cosmetics: { label: '화장품', primary: '#bbc3ff', secondary: '#1b1c2e' },
  health: { label: '건강기능식품', primary: '#a5a1ff', secondary: '#1a1b2e' },
  electronics: { label: '가전', primary: '#c0c1ff', secondary: '#1c1c2e' },
  fashion: { label: '패션', primary: '#dad7ff', secondary: '#1d1c2e' },
  living: { label: '생활용품', primary: '#e2dfff', secondary: '#1e1c2e' },
  pets: { label: '반려동물', primary: '#ffd6a5', secondary: '#2e251b' },
  kids: { label: '유아/아동', primary: '#ffadad', secondary: '#2e1b1b' },
  sports: { label: '스포츠/아웃도어', primary: '#a0e7e5', secondary: '#1b2e2d' },
  interior: { label: '인테리어/가구', primary: '#d4a5ff', secondary: '#261b2e' },
  automotive: { label: '자동차용품', primary: '#b5dead', secondary: '#1b2e1e' },
  stationery: { label: '문구/오피스', primary: '#ffc6ff', secondary: '#2e1b2e' },
  beverages: { label: '주류/음료', primary: '#ffb3b3', secondary: '#2e1b1f' },
  digital: { label: '디지털/SW', primary: '#a5c8ff', secondary: '#1b222e' },
  others: { label: '기타', primary: '#c8c8c8', secondary: '#232323' },
} as const;

export const TONE_STYLES: Record<ToneKey, ToneInfo> = {
  trust: { label: '신뢰형', desc: '검증된 품질, 확실한 선택 — 데이터와 인증으로 신뢰를 주는 스타일' },
  emotional: { label: '감성형', desc: '일상을 바꿔줄 특별한 — 공감과 스토리로 마음을 움직이는 스타일' },
  impact: { label: '임팩트형', desc: '지금 바로, 놓치지 마세요 — 강렬한 카피로 행동을 유도하는 스타일' },
} as const;

export const INTERVIEW_QUESTIONS: Record<CategoryKey, InterviewQuestion[]> = {
  food: [
    { id: 'food-1', question: '이 식품의 주요 원재료와 원산지는 어디인가요?', placeholder: '예: 국내산 유기농 현미, 전남 해남산 고구마...' },
    { id: 'food-2', question: '다른 유사 제품과 비교했을 때 가장 큰 차별점은 무엇인가요?', placeholder: '예: 무첨가, 저칼로리, 특허 공법...' },
    { id: 'food-3', question: '맛이나 식감의 특징을 설명해주세요.', placeholder: '예: 바삭한 식감, 달지 않은 담백한 맛...' },
    { id: 'food-4', question: '어떤 인증이나 검사를 받았나요?', placeholder: '예: HACCP, 유기농 인증, 무항생제...' },
    { id: 'food-5', question: '추천하는 섭취 방법이나 레시피가 있나요?', placeholder: '예: 아침 공복에 한 포, 샐러드 토핑으로...' },
  ],
  cosmetics: [
    { id: 'cos-1', question: '핵심 성분과 그 효능은 무엇인가요?', placeholder: '예: 히알루론산 – 48시간 보습, 나이아신아마이드 – 미백...' },
    { id: 'cos-2', question: '어떤 피부 타입이나 고민에 특히 효과적인가요?', placeholder: '예: 건성 피부, 모공 고민, 칙칙한 피부톤...' },
    { id: 'cos-3', question: '사용감이나 텍스처는 어떤가요?', placeholder: '예: 가벼운 워터 타입, 끈적임 없이 흡수...' },
    { id: 'cos-4', question: '임상 실험이나 피부 테스트 결과가 있나요?', placeholder: '예: 피부 자극 테스트 완료, 4주 임상시험 결과...' },
    { id: 'cos-5', question: '추천하는 사용 방법과 루틴을 알려주세요.', placeholder: '예: 세안 후 토너 다음 단계로 2~3방울...' },
  ],
  health: [
    { id: 'health-1', question: '주요 기능성 원료와 함량은 무엇인가요?', placeholder: '예: 루테인 20mg, 프로바이오틱스 100억 CFU...' },
    { id: 'health-2', question: '건강기능식품 인증 번호나 관련 허가 사항이 있나요?', placeholder: '예: 식약처 인증 제OOOO호...' },
    { id: 'health-3', question: '어떤 건강 고민을 가진 분들에게 추천하나요?', placeholder: '예: 눈 피로, 장 건강, 피부 노화...' },
    { id: 'health-4', question: '효과를 뒷받침하는 연구나 임상 결과가 있나요?', placeholder: '예: 국내 인체적용시험 8주 결과, 해외 논문...' },
    { id: 'health-5', question: '섭취 방법과 주의사항을 알려주세요.', placeholder: '예: 1일 1회 2정, 식후 30분 이내, 임산부 주의...' },
  ],
  electronics: [
    { id: 'elec-1', question: '핵심 스펙과 성능 수치를 알려주세요.', placeholder: '예: 4K UHD, 600W 출력, 배터리 12시간...' },
    { id: 'elec-2', question: '기존 제품이나 경쟁 제품 대비 개선된 점은?', placeholder: '예: 전작 대비 30% 성능 향상, 소음 50% 감소...' },
    { id: 'elec-3', question: '실제 사용 시나리오를 설명해주세요.', placeholder: '예: 거실에서 영화 감상, 재택근무용, 캠핑...' },
    { id: 'elec-4', question: '보증, A/S, 관련 인증 정보가 있나요?', placeholder: '예: 2년 무상 보증, KC 인증, 에너지 1등급...' },
    { id: 'elec-5', question: '패키지 구성(기본 포함)은 어떻게 되나요?', placeholder: '예: 본체, 리모컨, 충전 케이블, 설명서...' },
  ],
  fashion: [
    { id: 'fashion-1', question: '소재와 원단의 특징을 알려주세요.', placeholder: '예: 100% 오가닉 코튼, 스트레치 원단...' },
    { id: 'fashion-2', question: '핏이나 디자인의 특별한 점은?', placeholder: '예: 오버사이즈 핏, 숨겨진 포켓, 하이웨이스트...' },
    { id: 'fashion-3', question: '어떤 체형이나 스타일에 잘 어울리나요?', placeholder: '예: 체형 커버, 캐주얼룩, 오피스룩...' },
    { id: 'fashion-4', question: '세탁 및 관리 방법은 어떻게 되나요?', placeholder: '예: 세탁기 사용 가능, 드라이클리닝 권장...' },
    { id: 'fashion-5', question: '사이즈와 색상 옵션을 알려주세요.', placeholder: '예: S~3XL, 5가지 컬러, 모델 착용 사이즈 M...' },
  ],
  living: [
    { id: 'living-1', question: '제품의 주요 기능과 용도를 설명해주세요.', placeholder: '예: 음식물 건조, 공기 정화, 수납 정리...' },
    { id: 'living-2', question: '소재와 내구성은 어떤가요?', placeholder: '예: 스테인리스 스틸, BPA-free, 10년 보증...' },
    { id: 'living-3', question: '사용이 편리한 점이나 설계 특징은?', placeholder: '예: 원터치 작동, 분리 세척, 무소음 설계...' },
    { id: 'living-4', question: '안전 관련 인증이나 테스트 결과가 있나요?', placeholder: '예: KC 안전인증, 전자파 적합, 친환경 인증...' },
    { id: 'living-5', question: '비슷한 제품과 비교했을 때 장점은?', placeholder: '예: 용량 대비 저렴, 디자인 세련, 다용도...' },
  ],
  pets: [
    { id: 'pets-1', question: '어떤 반려동물(종, 크기, 연령)에 적합한 제품인가요?', placeholder: '예: 소형견, 성견, 고양이 전용...' },
    { id: 'pets-2', question: '원재료나 성분에서 안전성 포인트가 있나요?', placeholder: '예: 무첨가, 저알러지, 천연 소재...' },
    { id: 'pets-3', question: '기존 제품 대비 반려인들이 만족하는 포인트는?', placeholder: '예: 기호성 우수, 소화 흡수율 높음...' },
    { id: 'pets-4', question: '관련 인증이나 수의사 추천이 있나요?', placeholder: '예: AAFCO 기준 충족, 수의사 감수...' },
    { id: 'pets-5', question: '급여 방법이나 사용법을 알려주세요.', placeholder: '예: 체중별 급여량, 하루 1~2회...' },
  ],
  kids: [
    { id: 'kids-1', question: '어떤 연령대의 아이에게 적합한가요?', placeholder: '예: 0~12개월, 3~5세, 초등학생...' },
    { id: 'kids-2', question: '안전 인증이나 소재 안전성은 어떤가요?', placeholder: '예: KC 안전인증, 무독성, BPA-free...' },
    { id: 'kids-3', question: '부모님들이 가장 만족하는 포인트는?', placeholder: '예: 세척 용이, 내구성, 교육 효과...' },
    { id: 'kids-4', question: '기존 유사 제품 대비 차별점은?', placeholder: '예: 특허 디자인, 성장단계별 맞춤...' },
    { id: 'kids-5', question: '사용 시 주의사항이 있나요?', placeholder: '예: 보호자 동반 사용, 연령 제한...' },
  ],
  sports: [
    { id: 'sports-1', question: '어떤 운동이나 활동에 특화되어 있나요?', placeholder: '예: 러닝, 요가, 등산, 헬스...' },
    { id: 'sports-2', question: '초보자용인지 전문가용인지, 타겟 레벨은?', placeholder: '예: 입문자~중급, 프로 선수급...' },
    { id: 'sports-3', question: '소재나 기술적 특징이 있나요?', placeholder: '예: 고어텍스, 충격 흡수, 경량 설계...' },
    { id: 'sports-4', question: '퍼포먼스 향상 효과를 수치로 설명할 수 있나요?', placeholder: '예: 에너지 리턴 15% 향상...' },
    { id: 'sports-5', question: '사이즈나 호환성 정보를 알려주세요.', placeholder: '예: 프리사이즈, 조절 가능, 범용...' },
  ],
  interior: [
    { id: 'interior-1', question: '어떤 공간이나 스타일에 어울리나요?', placeholder: '예: 북유럽 스타일, 원룸, 거실...' },
    { id: 'interior-2', question: '소재와 마감 퀄리티는 어떤가요?', placeholder: '예: 원목, 스틸 프레임, 프리미엄 패브릭...' },
    { id: 'interior-3', question: '크기, 무게, 조립 방식은?', placeholder: '예: 가로 120cm, 간편 조립, 완제품 배송...' },
    { id: 'interior-4', question: '공간에 어떤 분위기를 만들어주나요?', placeholder: '예: 따뜻한 분위기, 모던한 느낌...' },
    { id: 'interior-5', question: '관리나 유지보수는 쉬운가요?', placeholder: '예: 물걸레 가능, 스크래치 방지...' },
  ],
  automotive: [
    { id: 'auto-1', question: '어떤 차종이나 차량에 호환되나요?', placeholder: '예: 전 차종 호환, SUV 전용...' },
    { id: 'auto-2', question: '해결해주는 운전 중 불편함이 뭔가요?', placeholder: '예: 주차 어려움, 시야 확보, 수납...' },
    { id: 'auto-3', question: '설치가 쉬운가요? 전문 시공이 필요한가요?', placeholder: '예: 셀프 부착, 간편 클립형...' },
    { id: 'auto-4', question: '내구성이나 안전 인증은?', placeholder: '예: 고온 내열, KC 인증, 자동차 부품 인증...' },
    { id: 'auto-5', question: '기존 제품 대비 개선된 점은?', placeholder: '예: 흡착력 3배, 무소음, 미끄럼 방지...' },
  ],
  stationery: [
    { id: 'stat-1', question: '이 제품의 디자인이나 기능적 차별점은?', placeholder: '예: 인체공학 그립, 잉크 번짐 없음...' },
    { id: 'stat-2', question: '어떤 용도에 가장 적합한가요?', placeholder: '예: 다이어리, 업무용, 학생용...' },
    { id: 'stat-3', question: '소재나 제작 퀄리티는?', placeholder: '예: 프리미엄 종이, 독일산 잉크...' },
    { id: 'stat-4', question: '일상에서 쓸 때 차이를 느끼는 순간은?', placeholder: '예: 필기감이 부드러움, 정리가 편함...' },
    { id: 'stat-5', question: '구성품이나 옵션은 어떻게 되나요?', placeholder: '예: 3종 세트, 리필 가능, 8가지 컬러...' },
  ],
  beverages: [
    { id: 'bev-1', question: '맛이나 향에서 가장 특별한 점은?', placeholder: '예: 과일 본연의 향, 단맛 없는 깔끔함...' },
    { id: 'bev-2', question: '어떤 상황에서 마시면 가장 잘 어울리나요?', placeholder: '예: 식사와 페어링, 파티, 혼술...' },
    { id: 'bev-3', question: '원재료나 제조 공정의 특징은?', placeholder: '예: 100% 국내산, 전통 발효...' },
    { id: 'bev-4', question: '도수나 칼로리, 성분 정보가 있나요?', placeholder: '예: 알코올 12%, 저칼로리, 무설탕...' },
    { id: 'bev-5', question: '관련 인증이나 수상 이력이 있나요?', placeholder: '예: 국제 와인 대회 수상, HACCP...' },
  ],
  digital: [
    { id: 'digital-1', question: '이 제품이 해결하는 핵심 문제가 뭔가요?', placeholder: '예: 업무 자동화, 데이터 관리...' },
    { id: 'digital-2', question: '기존 솔루션 대비 가장 큰 장점은?', placeholder: '예: 속도 2배, 직관적 UI, 무료 기능...' },
    { id: 'digital-3', question: '호환성이나 지원 플랫폼은?', placeholder: '예: Windows/Mac, 모바일 지원...' },
    { id: 'digital-4', question: '가격 체계나 라이선스 형태는?', placeholder: '예: 월 구독, 1회 구매, 프리미엄...' },
    { id: 'digital-5', question: '고객 지원이나 업데이트 정책은?', placeholder: '예: 24시간 지원, 무료 업데이트...' },
  ],
  others: [
    { id: 'others-1', question: '이 제품의 핵심 용도와 기능은?', placeholder: '예: 다용도, 선물용, 수집용...' },
    { id: 'others-2', question: '고객이 가장 만족하는 포인트는?', placeholder: '예: 품질, 디자인, 가성비...' },
    { id: 'others-3', question: '경쟁 제품 대비 차별점은?', placeholder: '예: 독자적 기술, 특허, 희소성...' },
    { id: 'others-4', question: '관련 인증이나 보증이 있나요?', placeholder: '예: 품질 보증, 교환/환불 정책...' },
    { id: 'others-5', question: '추천 사용법이나 활용 팁이 있나요?', placeholder: '예: 이렇게 쓰면 더 좋아요...' },
  ],
};

export const DEFAULT_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  { id: 'default-1', question: '이 제품을 한 문장으로 소개한다면?', placeholder: '예: 매일 아침을 활기차게 시작하게 해주는 건강 음료' },
  { id: 'default-2', question: '고객이 이 제품을 사야 하는 가장 큰 이유는?', placeholder: '예: 시중 제품 대비 2배 높은 효과...' },
  { id: 'default-3', question: '타겟 고객은 주로 어떤 고민을 가지고 있나요?', placeholder: '예: 바쁜 직장인, 건강이 걱정되는 40대...' },
];

export const STEP_LABELS = [
  { step: 1, label: '제품 등록' },
  { step: 2, label: 'AI 인터뷰' },
  { step: 3, label: '원고 확인/수정' },
  { step: 4, label: '내보내기' },
];

export const DEFAULT_SECTIONS_ORDER: Array<{ type: string; title: string }> = [
  { type: 'hero', title: '히어로 배너' },
  { type: 'usp', title: 'USP 포인트' },
  { type: 'detail', title: '제품 상세' },
  { type: 'comparison', title: '비교표' },
  { type: 'howto', title: '사용법' },
  { type: 'certification', title: '인증/신뢰' },
  { type: 'reviews', title: '고객 리뷰' },
  { type: 'faq', title: 'FAQ' },
  { type: 'cta', title: 'CTA' },
];
