'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DetailPageState } from '@/lib/types';

const sampleState: DetailPageState = {
  currentStep: 4,
  productInfo: {
    name: '28 Days Teatree Serum',
    category: 'cosmetics',
    price: '32,000',
    targetAudience: '피부 트러블·모공 고민이 있는 20~40대',
    shortDescription: 'AHA/BHA/PHA + 펩타이드 복합 티트리 세럼. 티트리 25,000ppm 고함량 배합으로 28일간 피부 진정·각질 케어·모공 관리를 동시에.',
    keywords: ['티트리세럼', '여드름세럼', '피부진정', 'AHA BHA PHA', '트러블케어'],
    imageUrl: '',
  },
  productPhotos: [],
  interviewMessages: [],
  interviewCompleted: true,
  extractedUSPs: [
    {
      id: 'usp-1',
      title: '티트리 25,000ppm 초고함량',
      description: '호주산 프리미엄 티트리 오일 25,000ppm 함유. 피부 진정과 트러블 케어에 집중한 고농축 포뮬러.',
    },
    {
      id: 'usp-2',
      title: 'AHA·BHA·PHA 트리플 필링',
      description: '3종 산(AHA/BHA/PHA)이 묵은 각질을 부드럽게 제거하고 모공 속 노폐물을 정리. 자극 없이 매끈한 피부결.',
    },
    {
      id: 'usp-3',
      title: '펩타이드 장벽 강화',
      description: '펩타이드-3가 손상된 피부 장벽을 복구하고 수분을 잠금. 필링 후에도 당기지 않는 촉촉함.',
    },
  ],
  selectedTone: 'trust',

  manuscriptSections: [
    {
      id: 'ms-hooking',
      sectionType: 'hooking',
      title: '28일, 피부가 달라지는 시간',
      body: '반복되는 트러블, 넓어지는 모공, 거칠어진 피부결.\n"이 세럼 하나로 정말 달라질까?"\n티트리 25,000ppm이 증명합니다.',
      imageGuide: '깨끗한 유리 질감의 세럼 병이 중앙에 놓인 히어로 이미지. 티트리 잎이 자연스럽게 배치된 청량한 그린 톤.',
      visible: true,
      order: 0,
    },
    {
      id: 'ms-problem',
      sectionType: 'problem',
      title: '이런 고민, 공감되시나요?',
      body: '아침마다 새로 올라오는 트러블\n화장이 들뜨게 만드는 울퉁불퉁한 피부결\n모공이 눈에 띄어 자신감이 떨어지는 순간\n자극적인 제품은 오히려 피부를 악화시킨 경험',
      imageGuide: '피부 고민을 시각화하는 감성적 이미지. 거울을 보며 피부를 신경 쓰는 자연스러운 모습.',
      visible: true,
      order: 1,
    },
    {
      id: 'ms-solution',
      sectionType: 'solution',
      title: '진정 × 필링 × 장벽 강화, 한 병에',
      body: '28 Days Teatree Serum은 트러블의 근본 원인에 접근합니다.\n\n티트리 오일이 피부를 진정시키고, AHA/BHA/PHA가 모공 속 노폐물을 정리하며, 펩타이드가 약해진 장벽을 복구합니다.\n\n공격과 방어를 동시에 — 그래서 28일이면 충분합니다.',
      imageGuide: '세럼 텍스처 클로즈업. 투명한 세럼 방울이 피부 위에 놓인 매크로 샷.',
      visible: true,
      order: 2,
    },
    {
      id: 'ms-features',
      sectionType: 'features',
      title: '핵심 성분 3가지',
      body: '1. 티트리 25,000ppm — 호주산 프리미엄 티트리 오일. 항균·항염 효과로 트러블을 빠르게 진정.\n\n2. AHA/BHA/PHA 트리플 액시드 — 각질층별 맞춤 필링. 표피 각질(AHA), 모공 속 피지(BHA), 민감 피부용 저자극 필링(PHA).\n\n3. 펩타이드-3 — 피부 장벽 리페어. 수분 증발을 막고 외부 자극으로부터 보호.',
      imageGuide: '3가지 핵심 성분을 시각화. 티트리 잎, 산(acid) 분자 구조, 펩타이드 체인을 모던하게 표현.',
      visible: true,
      order: 3,
    },
    {
      id: 'ms-howto',
      sectionType: 'howto',
      title: '이렇게 사용하세요',
      body: 'Step 1: 세안 후 토너로 피부결 정돈\nStep 2: 스포이트로 2~3방울 덜어 트러블 부위 중심으로 도포\nStep 3: 손바닥으로 가볍게 감싸 흡수\nStep 4: 크림으로 마무리 보습\n\nTIP: 저녁 루틴에 사용하면 효과 극대화. AHA/BHA 특성상 낮에는 자외선 차단제 필수!',
      imageGuide: '4단계 사용법을 보여주는 라이프스타일 이미지. 깔끔한 세면대에서 세럼을 사용하는 모습.',
      visible: true,
      order: 4,
    },
    {
      id: 'ms-social',
      sectionType: 'social_proof',
      title: '실사용 후기',
      body: '"2주 만에 턱 라인 트러블이 확실히 줄었어요. 자극도 없고 순해요." — 김○○, 28세\n\n"모공이 조여지는 느낌? 화장 밀착력이 완전 달라졌습니다." — 이○○, 34세\n\n"민감성인데 AHA/BHA가 들어있어서 걱정했는데, PHA가 같이 들어있어서 그런지 하나도 안 따가워요." — 박○○, 26세',
      imageGuide: '실제 사용자 후기 느낌의 이미지. 깨끗한 피부의 클로즈업, 신뢰감 있는 톤.',
      visible: true,
      order: 5,
    },
    {
      id: 'ms-specs',
      sectionType: 'specs',
      title: '제품 상세 스펙',
      body: '용량: 50ml\n주요 성분: 티트리 오일 25,000ppm, 살리실산(BHA), 글리콜산(AHA), 글루코노락톤(PHA), 펩타이드-3\npH: 5.5 약산성\n제형: 워터 에센스 타입 (산뜻한 흡수)\n원산지: 대한민국\n유통기한: 제조일로부터 24개월\n피부 테스트: 완료 (저자극 테스트 통과)\n비건·크루얼티프리 인증',
      imageGuide: '제품 스펙을 보여주는 인포그래픽 스타일. 깔끔한 아이콘과 수치 정보.',
      visible: true,
      order: 6,
    },
    {
      id: 'ms-guarantee',
      sectionType: 'guarantee',
      title: '28일 체험 보장',
      body: '28일간 사용 후 만족하지 못하시면 전액 환불해 드립니다.\n피부과 전문의 자문을 거친 포뮬러.\nSGS 국제 인증 완료.\n\n걱정 없이 시작하세요.',
      imageGuide: '신뢰감을 주는 보증 이미지. 인증 마크, 전문의 추천 느낌의 클린한 디자인.',
      visible: true,
      order: 7,
    },
    {
      id: 'ms-cta',
      sectionType: 'cta',
      title: '지금 시작하세요',
      body: '28일 후, 거울 속 내 피부에 놀라게 될 거예요.\n\n정가 42,000원 → 런칭 특가 32,000원 (24% 할인)\n오늘 주문 시 미니 토너 증정\n무료 배송',
      imageGuide: '구매를 유도하는 CTA 이미지. 제품 패키지 풀샷, 할인 배지, 밝고 긍정적인 톤.',
      visible: true,
      order: 8,
    },
  ],

  colorPalette: {
    colors: [
      { hex: '#0b3d2e', label: '딥 포레스트 그린' },
      { hex: '#1a5c3a', label: '티트리 그린' },
      { hex: '#f4f1ec', label: '내추럴 아이보리' },
    ],
    accent: { hex: '#c8a96e', label: '골드 액센트' },
    rationale: '제품 패키지의 딥 그린 톤을 메인으로, 자연 성분을 강조하는 포레스트 팔레트. 골드 액센트로 프리미엄 느낌 부여.',
  },

  fontRecommendation: {
    headline: 'Noto Sans KR (Bold)',
    body: 'Noto Sans KR (Regular)',
    mood: '신뢰감 있고 깔끔한 한국형 코스메틱 상세페이지',
  },

  layoutRationale: '코스메틱 상세페이지 표준 구성: 후킹(감성) → 문제제기 → 솔루션 → 성분 상세 → 사용법 → 후기 → 스펙 → 보증 → CTA. 총 9개 섹션.',
  referenceGuide: null,
  generatedSections: [],
  isGenerating: false,
  error: null,
  images: {},
  imageGenerating: {},
  priceInfo: {
    originalPrice: 42000,
    salePrice: 32000,
    discountRate: 24,
    eventText: '런칭 특가',
  },
  packageItems: [
    { name: '28 Days Teatree Serum 50ml', description: '본품', price: 32000 },
    { name: '미니 티트리 토너 30ml', description: '오늘 주문 시 증정', price: 0 },
  ],
};

export default function SeedPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Clear any stale canvas editor data
      localStorage.removeItem('dm_canvas_editor');
      // Write the sample state
      localStorage.setItem('dm_plan_state', JSON.stringify(sampleState));
      setDone(true);
      // Client-side navigation to avoid hydration mismatch
      setTimeout(() => {
        router.replace('/design');
      }, 1500);
    } catch (e: any) {
      setError(e.message || 'Failed to seed data');
    }
  }, [router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-[#e5e2e1] gap-4">
      {error ? (
        <>
          <div className="text-red-400 text-lg font-bold">Error</div>
          <div className="text-sm text-red-300">{error}</div>
        </>
      ) : done ? (
        <>
          <div className="text-lg font-bold text-[#c3c0ff]">28 Days Teatree Serum</div>
          <div className="text-sm text-[#c7c4d8]">샘플 원고 로드 완료! 에디터로 이동 중...</div>
          <div className="w-8 h-8 border-2 border-[#c3c0ff] border-t-transparent rounded-full animate-spin" />
        </>
      ) : (
        <>
          <div className="text-sm text-[#c7c4d8]">샘플 데이터 로딩 중...</div>
          <div className="w-8 h-8 border-2 border-[#c3c0ff] border-t-transparent rounded-full animate-spin" />
        </>
      )}
    </div>
  );
}
