import { CategoryInfo, CategoryKey, ToneInfo, ToneKey, InterviewQuestion } from './types';

export const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  food: { label: '식품', primary: '#FF6B35', secondary: '#FFF3E0', icon: '🍽️' },
  cosmetics: { label: '화장품', primary: '#E91E8C', secondary: '#FCE4EC', icon: '💄' },
  health: { label: '건강기능식품', primary: '#2E7D32', secondary: '#E8F5E9', icon: '💊' },
  electronics: { label: '가전', primary: '#1565C0', secondary: '#E3F2FD', icon: '⚡' },
  fashion: { label: '패션', primary: '#212121', secondary: '#F5F5F5', icon: '👔' },
  living: { label: '생활용품', primary: '#7B1FA2', secondary: '#F3E5F5', icon: '🏠' },
} as const;

export const TONE_STYLES: Record<ToneKey, ToneInfo> = {
  trust: { label: '신뢰형', icon: '🎯', desc: '검증된 품질, 확실한 선택 — 데이터와 인증으로 신뢰를 주는 스타일' },
  emotional: { label: '감성형', icon: '💝', desc: '일상을 바꿔줄 특별한 — 공감과 스토리로 마음을 움직이는 스타일' },
  impact: { label: '임팩트형', icon: '⚡', desc: '지금 바로, 놓치지 마세요 — 강렬한 카피로 행동을 유도하는 스타일' },
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
};

export const DEFAULT_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  { id: 'default-1', question: '이 제품을 한 문장으로 소개한다면?', placeholder: '예: 매일 아침을 활기차게 시작하게 해주는 건강 음료' },
  { id: 'default-2', question: '고객이 이 제품을 사야 하는 가장 큰 이유는?', placeholder: '예: 시중 제품 대비 2배 높은 효과...' },
  { id: 'default-3', question: '타겟 고객은 주로 어떤 고민을 가지고 있나요?', placeholder: '예: 바쁜 직장인, 건강이 걱정되는 40대...' },
];

export const STEP_LABELS = [
  { step: 1, label: '상품 정보', icon: '📦' },
  { step: 2, label: 'AI 인터뷰', icon: '💬' },
  { step: 3, label: '톤앤매너', icon: '🎨' },
  { step: 4, label: '미리보기', icon: '👁️' },
  { step: 5, label: '내보내기', icon: '📥' },
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
