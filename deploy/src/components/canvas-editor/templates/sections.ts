import { SectionTemplate } from './types';
import { ManuscriptSectionType } from '@/lib/types';

// ===== Section templates: multiple layout variants per section type =====
// Each section type has 2-3 variants (A, B, C) for visual diversity.
// Variants are auto-selected based on section order in composeSectionCanvas.

const templateVariants: Record<ManuscriptSectionType, SectionTemplate[]> = {
  hooking: [
    // A: 좌텍스트 + 우제품 (기존)
    {
      sectionType: 'hooking',
      variantId: 'A',
      canvasHeight: 520,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: true,
      productImagePosition: { left: 560, top: 70, maxWidth: 260, maxHeight: 380 },
      textObjects: [
        { binding: 'label', customText: 'FIRST IMPRESSION', left: 60, top: 72, width: 400, fontSize: 10, fontWeight: 800, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '카테고리', opacity: 0.9 },
        { binding: 'title', left: 60, top: 110, width: 420, fontSize: 42, fontWeight: 900, useHeadline: true, lineHeight: 1.18, letterSpacing: -1, name: '메인 타이틀' },
        { binding: 'bodyPreview', left: 60, top: 260, width: 380, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.75, name: '서브 카피' },
        { binding: 'cta', customText: '지금 구매하기', left: 60, top: 380, width: 160, fontSize: 14, fontWeight: 800, useHeadline: false, fill: '#ffffff', name: 'CTA 버튼' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 240, width: 36, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'rect', left: 50, top: 370, width: 180, height: 48, fill: '{colors.accent}', rx: 8, ry: 8, name: 'CTA 배경' },
      ],
    },
    // B: 중앙정렬 풀와이드
    {
      sectionType: 'hooking',
      variantId: 'B',
      canvasHeight: 560,
      overlayColor: 'rgba(0,0,0,0.45)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'FIRST IMPRESSION', left: 0, top: 80, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 8, name: '카테고리', opacity: 0.8 },
        { binding: 'title', left: 80, top: 140, width: 700, fontSize: 48, fontWeight: 900, useHeadline: true, textAlign: 'center', lineHeight: 1.2, letterSpacing: -1, name: '메인 타이틀' },
        { binding: 'bodyPreview', left: 120, top: 320, width: 620, fontSize: 16, fontWeight: 400, useHeadline: false, textAlign: 'center', opacity: 0.75, lineHeight: 1.8, name: '서브 카피' },
        { binding: 'cta', customText: '지금 구매하기', left: 350, top: 440, width: 160, fontSize: 14, fontWeight: 800, useHeadline: false, fill: '#ffffff', textAlign: 'center', name: 'CTA 버튼' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 300, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'rect', left: 340, top: 430, width: 180, height: 48, fill: '{colors.accent}', rx: 8, ry: 8, name: 'CTA 배경' },
      ],
    },
    // C: 하단 텍스트 + 상단 이미지 영역
    {
      sectionType: 'hooking',
      variantId: 'C',
      canvasHeight: 600,
      overlayColor: 'rgba(0,0,0,0.35)',
      hasProductImage: true,
      productImagePosition: { left: 300, top: 30, maxWidth: 260, maxHeight: 260 },
      textObjects: [
        { binding: 'label', customText: 'FIRST IMPRESSION', left: 0, top: 320, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '카테고리', opacity: 0.8 },
        { binding: 'title', left: 80, top: 355, width: 700, fontSize: 40, fontWeight: 900, useHeadline: true, textAlign: 'center', lineHeight: 1.2, name: '메인 타이틀' },
        { binding: 'bodyPreview', left: 100, top: 470, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, textAlign: 'center', opacity: 0.75, lineHeight: 1.75, name: '서브 카피' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 340, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  hero: [
    {
      sectionType: 'hero',
      variantId: 'A',
      canvasHeight: 520,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: true,
      productImagePosition: { left: 560, top: 70, maxWidth: 260, maxHeight: 380 },
      textObjects: [
        { binding: 'label', customText: 'FIRST IMPRESSION', left: 60, top: 72, width: 400, fontSize: 10, fontWeight: 800, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '카테고리', opacity: 0.9 },
        { binding: 'title', left: 60, top: 110, width: 420, fontSize: 42, fontWeight: 900, useHeadline: true, lineHeight: 1.18, name: '메인 타이틀' },
        { binding: 'bodyPreview', left: 60, top: 260, width: 380, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.75, name: '서브 카피' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 240, width: 36, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  problem: [
    // A: 중앙정렬 (기존)
    {
      sectionType: 'problem',
      variantId: 'A',
      canvasHeight: 480,
      overlayColor: 'rgba(0,0,0,0.55)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'PAIN POINT', left: 0, top: 60, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨', opacity: 0.7 },
        { binding: 'title', left: 80, top: 100, width: 700, fontSize: 30, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.35, name: '문제 제시' },
        { binding: 'body', left: 100, top: 200, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.75, lineHeight: 1.85, textAlign: 'center', name: '공감 설명' },
      ],
      shapes: [],
    },
    // B: 좌측정렬 + 큰 따옴표 장식
    {
      sectionType: 'problem',
      variantId: 'B',
      canvasHeight: 480,
      overlayColor: 'rgba(0,0,0,0.5)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'PAIN POINT', left: 80, top: 56, width: 400, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨', opacity: 0.7 },
        { binding: 'title', left: 80, top: 100, width: 500, fontSize: 28, fontWeight: 800, useHeadline: true, lineHeight: 1.35, name: '문제 제시' },
        { binding: 'body', left: 80, top: 200, width: 520, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.75, lineHeight: 1.85, name: '공감 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 96, width: 4, height: 80, fill: '{colors.accent}', opacity: 0.5, selectable: false, name: '좌측 라인' },
      ],
    },
    // C: 카드형 (패딩 넓은 박스 내부)
    {
      sectionType: 'problem',
      variantId: 'C',
      canvasHeight: 500,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'PAIN POINT', left: 0, top: 50, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨', opacity: 0.7 },
        { binding: 'title', left: 120, top: 110, width: 620, fontSize: 26, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.35, name: '문제 제시' },
        { binding: 'body', left: 140, top: 210, width: 580, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, textAlign: 'center', name: '공감 설명' },
      ],
      shapes: [
        { type: 'rect', left: 100, top: 80, width: 660, height: 360, fill: 'rgba(0,0,0,0.3)', rx: 16, ry: 16, selectable: false, name: '카드 배경' },
      ],
    },
  ],

  solution: [
    // A: 좌제품 + 우텍스트 (기존)
    {
      sectionType: 'solution',
      variantId: 'A',
      canvasHeight: 480,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: true,
      productImagePosition: { left: 40, top: 60, maxWidth: 340, maxHeight: 360 },
      textObjects: [
        { binding: 'label', customText: 'SOLUTION', left: 430, top: 80, width: 380, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 430, top: 120, width: 380, fontSize: 28, fontWeight: 800, useHeadline: true, lineHeight: 1.35, name: '솔루션 타이틀' },
        { binding: 'bodyPreview', left: 430, top: 240, width: 380, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.75, lineHeight: 1.8, name: '솔루션 설명' },
      ],
      shapes: [
        { type: 'rect', left: 430, top: 210, width: 28, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // B: 중앙정렬 풀와이드
    {
      sectionType: 'solution',
      variantId: 'B',
      canvasHeight: 480,
      overlayColor: 'rgba(0,0,0,0.5)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'SOLUTION', left: 0, top: 60, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 100, width: 700, fontSize: 30, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.35, name: '솔루션 타이틀' },
        { binding: 'bodyPreview', left: 100, top: 200, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, textAlign: 'center', opacity: 0.75, lineHeight: 1.85, name: '솔루션 설명' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 180, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // C: 우제품 + 좌텍스트 (미러)
    {
      sectionType: 'solution',
      variantId: 'C',
      canvasHeight: 480,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: true,
      productImagePosition: { left: 520, top: 60, maxWidth: 300, maxHeight: 360 },
      textObjects: [
        { binding: 'label', customText: 'SOLUTION', left: 60, top: 80, width: 400, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 120, width: 420, fontSize: 28, fontWeight: 800, useHeadline: true, lineHeight: 1.35, name: '솔루션 타이틀' },
        { binding: 'bodyPreview', left: 60, top: 240, width: 420, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.75, lineHeight: 1.8, name: '솔루션 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 210, width: 28, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  features: [
    // A: 중앙정렬 (기존)
    {
      sectionType: 'features',
      variantId: 'A',
      canvasHeight: 560,
      overlayColor: 'rgba(0,0,0,0.5)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'FEATURES', left: 0, top: 56, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 90, width: 700, fontSize: 30, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.3, name: '특장점 타이틀' },
        { binding: 'body', left: 80, top: 180, width: 700, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, name: '특장점 설명' },
      ],
      shapes: [],
    },
    // B: 좌정렬 + 넘버링 스타일
    {
      sectionType: 'features',
      variantId: 'B',
      canvasHeight: 560,
      overlayColor: 'rgba(0,0,0,0.5)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'FEATURES', left: 60, top: 56, width: 400, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 90, width: 500, fontSize: 28, fontWeight: 800, useHeadline: true, lineHeight: 1.3, name: '특장점 타이틀' },
        { binding: 'body', left: 60, top: 180, width: 740, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, name: '특장점 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 160, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // C: 우측 배경 + 좌측 텍스트 (2분할)
    {
      sectionType: 'features',
      variantId: 'C',
      canvasHeight: 560,
      overlayColor: 'rgba(0,0,0,0.45)',
      hasProductImage: true,
      productImagePosition: { left: 500, top: 40, maxWidth: 320, maxHeight: 480 },
      textObjects: [
        { binding: 'label', customText: 'FEATURES', left: 60, top: 56, width: 380, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 90, width: 380, fontSize: 26, fontWeight: 800, useHeadline: true, lineHeight: 1.3, name: '특장점 타이틀' },
        { binding: 'body', left: 60, top: 190, width: 380, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, name: '특장점 설명' },
      ],
      shapes: [],
    },
  ],

  detail: [
    {
      sectionType: 'detail',
      variantId: 'A',
      canvasHeight: 560,
      overlayColor: 'rgba(0,0,0,0.5)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'DETAIL', left: 0, top: 56, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 90, width: 700, fontSize: 28, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.3, name: '상세 타이틀' },
        { binding: 'body', left: 80, top: 180, width: 700, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, name: '상세 설명' },
      ],
      shapes: [],
    },
    {
      sectionType: 'detail',
      variantId: 'B',
      canvasHeight: 560,
      overlayColor: 'rgba(0,0,0,0.45)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'DETAIL', left: 60, top: 56, width: 400, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 90, width: 500, fontSize: 26, fontWeight: 800, useHeadline: true, lineHeight: 1.3, name: '상세 타이틀' },
        { binding: 'body', left: 60, top: 180, width: 740, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, name: '상세 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 160, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // C: 좌텍스트 + 우제품 (NAS 학습: 인테리어/가전에서 자주 사용)
    {
      sectionType: 'detail',
      variantId: 'C',
      canvasHeight: 560,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: true,
      productImagePosition: { left: 500, top: 60, maxWidth: 320, maxHeight: 440 },
      textObjects: [
        { binding: 'label', customText: 'DETAIL', left: 60, top: 56, width: 380, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 90, width: 380, fontSize: 26, fontWeight: 800, useHeadline: true, lineHeight: 1.3, name: '상세 타이틀' },
        { binding: 'body', left: 60, top: 190, width: 380, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, name: '상세 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 170, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  howto: [
    // A: 좌텍스트 + 우제품 (기존)
    {
      sectionType: 'howto',
      variantId: 'A',
      canvasHeight: 520,
      overlayColor: 'rgba(0,0,0,0.45)',
      hasProductImage: true,
      productImagePosition: { left: 580, top: 80, maxWidth: 220, maxHeight: 280 },
      textObjects: [
        { binding: 'label', customText: 'HOW TO USE', left: 60, top: 56, width: 400, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 90, width: 480, fontSize: 28, fontWeight: 800, useHeadline: true, lineHeight: 1.3, name: '사용법 타이틀' },
        { binding: 'body', left: 60, top: 180, width: 480, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, name: '사용법 설명' },
      ],
      shapes: [],
    },
    // B: 중앙정렬
    {
      sectionType: 'howto',
      variantId: 'B',
      canvasHeight: 520,
      overlayColor: 'rgba(0,0,0,0.5)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'HOW TO USE', left: 0, top: 56, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 90, width: 700, fontSize: 28, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.3, name: '사용법 타이틀' },
        { binding: 'body', left: 100, top: 180, width: 660, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, textAlign: 'center', name: '사용법 설명' },
      ],
      shapes: [],
    },
  ],

  social_proof: [
    // A: 중앙정렬 (기존)
    {
      sectionType: 'social_proof',
      variantId: 'A',
      canvasHeight: 480,
      overlayColor: 'rgba(0,0,0,0.5)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'SOCIAL PROOF', left: 0, top: 60, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 100, width: 700, fontSize: 28, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.35, name: '사회적 증거' },
        { binding: 'body', left: 100, top: 190, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.8, textAlign: 'center', name: '리뷰/증거 내용' },
      ],
      shapes: [],
    },
    // B: 좌정렬 + 큰따옴표 장식
    {
      sectionType: 'social_proof',
      variantId: 'B',
      canvasHeight: 480,
      overlayColor: 'rgba(0,0,0,0.5)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'REVIEWS', left: 80, top: 56, width: 400, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨', opacity: 0.7 },
        { binding: 'title', left: 80, top: 100, width: 600, fontSize: 26, fontWeight: 800, useHeadline: true, lineHeight: 1.35, name: '사회적 증거' },
        { binding: 'body', left: 80, top: 200, width: 600, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.8, name: '리뷰/증거 내용' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 96, width: 4, height: 80, fill: '{colors.accent}', opacity: 0.5, selectable: false, name: '좌측 라인' },
      ],
    },
    // C: 수치 데이터 강조형 (NAS 학습: 화장품/생활용품에서 %, 배 등 수치 강조)
    {
      sectionType: 'social_proof',
      variantId: 'C',
      canvasHeight: 480,
      overlayColor: 'rgba(0,0,0,0.45)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'PROVEN RESULTS', left: 0, top: 50, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨', opacity: 0.7 },
        { binding: 'title', left: 80, top: 90, width: 700, fontSize: 48, fontWeight: 900, useHeadline: true, textAlign: 'center', lineHeight: 1.2, name: '핵심 수치' },
        { binding: 'body', left: 100, top: 230, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.8, textAlign: 'center', name: '수치 설명' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 210, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  trust: [
    {
      sectionType: 'trust',
      variantId: 'A',
      canvasHeight: 440,
      overlayColor: 'rgba(0,0,0,0.5)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'TRUST', left: 0, top: 56, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 90, width: 700, fontSize: 26, fontWeight: 800, useHeadline: true, textAlign: 'center', name: '신뢰 타이틀' },
        { binding: 'body', left: 80, top: 170, width: 700, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, textAlign: 'center', name: '신뢰 설명' },
      ],
      shapes: [],
    },
  ],

  specs: [
    // A: 좌정렬 (기존)
    {
      sectionType: 'specs',
      variantId: 'A',
      canvasHeight: 480,
      overlayColor: 'rgba(0,0,0,0.55)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'SPECIFICATIONS', left: 60, top: 56, width: 400, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 90, width: 700, fontSize: 26, fontWeight: 800, useHeadline: true, name: '스펙 타이틀' },
        { binding: 'body', left: 60, top: 170, width: 740, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, name: '스펙 내용' },
      ],
      shapes: [],
    },
    // B: 카드 내부
    {
      sectionType: 'specs',
      variantId: 'B',
      canvasHeight: 500,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'SPECIFICATIONS', left: 0, top: 50, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 120, top: 105, width: 620, fontSize: 24, fontWeight: 800, useHeadline: true, textAlign: 'center', name: '스펙 타이틀' },
        { binding: 'body', left: 140, top: 185, width: 580, fontSize: 13, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.85, name: '스펙 내용' },
      ],
      shapes: [
        { type: 'rect', left: 100, top: 80, width: 660, height: 370, fill: 'rgba(0,0,0,0.3)', rx: 16, ry: 16, selectable: false, name: '카드 배경' },
      ],
    },
  ],

  guarantee: [
    // A: 중앙정렬 (기존)
    {
      sectionType: 'guarantee',
      variantId: 'A',
      canvasHeight: 440,
      overlayColor: 'rgba(0,0,0,0.45)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'GUARANTEE', left: 0, top: 56, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 95, width: 700, fontSize: 26, fontWeight: 800, useHeadline: true, textAlign: 'center', name: '보증 타이틀' },
        { binding: 'body', left: 100, top: 180, width: 660, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.85, textAlign: 'center', name: '보증 내용' },
      ],
      shapes: [],
    },
    // B: 카드형 + 아이콘 영역
    {
      sectionType: 'guarantee',
      variantId: 'B',
      canvasHeight: 460,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'GUARANTEE', left: 0, top: 50, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 120, top: 105, width: 620, fontSize: 24, fontWeight: 800, useHeadline: true, textAlign: 'center', name: '보증 타이틀' },
        { binding: 'body', left: 140, top: 190, width: 580, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.85, textAlign: 'center', name: '보증 내용' },
      ],
      shapes: [
        { type: 'rect', left: 100, top: 80, width: 660, height: 330, fill: 'rgba(0,0,0,0.3)', rx: 16, ry: 16, selectable: false, name: '카드 배경' },
      ],
    },
  ],

  event_banner: [
    {
      sectionType: 'event_banner',
      variantId: 'A',
      canvasHeight: 280,
      overlayColor: 'rgba(0,0,0,0.3)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'LIMITED OFFER', left: 0, top: 50, width: 860, fontSize: 10, fontWeight: 700, useHeadline: false, fill: '#ffffff', textAlign: 'center', letterSpacing: 5, name: '오퍼 라벨', opacity: 0.7 },
        { binding: 'title', left: 80, top: 90, width: 700, fontSize: 32, fontWeight: 900, useHeadline: true, fill: '#ffffff', textAlign: 'center', lineHeight: 1.25, name: '이벤트 타이틀' },
        { binding: 'bodyPreview', left: 100, top: 180, width: 660, fontSize: 16, fontWeight: 400, useHeadline: false, fill: '#ffffff', textAlign: 'center', opacity: 0.8, name: '가격/할인 정보' },
      ],
      shapes: [],
    },
  ],

  cta: [
    // A: 중앙정렬 (기존)
    {
      sectionType: 'cta',
      variantId: 'A',
      canvasHeight: 320,
      overlayColor: 'rgba(0,0,0,0.35)',
      hasProductImage: false,
      textObjects: [
        { binding: 'title', left: 80, top: 70, width: 700, fontSize: 36, fontWeight: 900, useHeadline: true, fill: '#ffffff', textAlign: 'center', lineHeight: 1.3, name: 'CTA 타이틀' },
        { binding: 'bodyPreview', left: 100, top: 170, width: 660, fontSize: 16, fontWeight: 400, useHeadline: false, fill: '#ffffff', textAlign: 'center', opacity: 0.85, lineHeight: 1.6, name: 'CTA 서브' },
        { binding: 'cta', customText: '구매하기', left: 350, top: 240, width: 160, fontSize: 16, fontWeight: 800, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', name: 'CTA 버튼 텍스트' },
      ],
      shapes: [
        { type: 'rect', left: 340, top: 230, width: 180, height: 50, fill: '#ffffff', rx: 8, ry: 8, name: 'CTA 버튼 배경' },
      ],
    },
    // B: 좌정렬 + 우측 버튼
    {
      sectionType: 'cta',
      variantId: 'B',
      canvasHeight: 300,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: false,
      textObjects: [
        { binding: 'title', left: 60, top: 70, width: 480, fontSize: 32, fontWeight: 900, useHeadline: true, fill: '#ffffff', lineHeight: 1.3, name: 'CTA 타이틀' },
        { binding: 'bodyPreview', left: 60, top: 170, width: 440, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#ffffff', opacity: 0.8, lineHeight: 1.6, name: 'CTA 서브' },
        { binding: 'cta', customText: '구매하기', left: 620, top: 120, width: 160, fontSize: 16, fontWeight: 800, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', name: 'CTA 버튼 텍스트' },
      ],
      shapes: [
        { type: 'rect', left: 610, top: 110, width: 180, height: 50, fill: '#ffffff', rx: 8, ry: 8, name: 'CTA 버튼 배경' },
      ],
    },
  ],
};

/**
 * Get a template for a section type.
 * When `order` is provided, auto-selects variant based on order index
 * to ensure visual diversity across sections.
 */
// 카테고리별 선호 variant 순서 (클라이언트 사이드 정적 매핑)
// 실제 한국 상세페이지 26개 분석 기반
const CATEGORY_VARIANT_PREFERENCES: Record<string, Partial<Record<ManuscriptSectionType, string[]>>> = {
  food: {
    hooking: ['A', 'C'],      // 좌텍스트+우제품, 하단텍스트+상단이미지
    features: ['A', 'B'],      // 아이콘그리드, 넘버링 포인트
    social_proof: ['C', 'A'],  // 데이터증명, 인증그리드
  },
  cosmetics: {
    hooking: ['B', 'C'],      // 중앙정렬 풀와이드, 모델+제품
    features: ['B', 'A'],      // 넘버링 포인트(Point 1/2/3), 아이콘그리드
    social_proof: ['C', 'A'],  // 수치 데이터 강조, 인증마크
  },
  interior: {
    hooking: ['B', 'A'],      // 풀와이드 영문 브랜딩
    features: ['A', 'C'],
    detail: ['C', 'A'],        // 좌텍스트+우제품
  },
  industrial: {
    hooking: ['A', 'B'],      // 좌텍스트 (기술 설명)
    features: ['A', 'B'],
  },
  living: {
    features: ['B', 'A'],      // 넘버링 포인트 (Point 1/2/3/4)
    social_proof: ['A', 'B'],
  },
};

export function getTemplate(sectionType: ManuscriptSectionType, order?: number, category?: string): SectionTemplate {
  const variants = templateVariants[sectionType] || templateVariants.features;
  if (variants.length <= 1) return variants[0];

  // 카테고리별 선호 variant가 있으면 우선 적용
  if (category && CATEGORY_VARIANT_PREFERENCES[category]) {
    const prefs = CATEGORY_VARIANT_PREFERENCES[category][sectionType];
    if (prefs && prefs.length > 0) {
      const prefIndex = (order ?? 0) % prefs.length;
      const preferredId = prefs[prefIndex];
      const found = variants.find(v => v.variantId === preferredId);
      if (found) return found;
    }
  }

  // 폴백: 기존 order 기반 순환
  if (order === undefined) return variants[0];
  const variantIndex = order % variants.length;
  return variants[variantIndex];
}

export function getAllTemplates(): Record<ManuscriptSectionType, SectionTemplate[]> {
  return templateVariants;
}
