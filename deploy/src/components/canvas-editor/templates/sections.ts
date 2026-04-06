import { SectionTemplate } from './types';
import { ManuscriptSectionType } from '@/lib/types';

// ===== Korean e-commerce detail page templates =====
// Design principles:
// 1. Alternating photo/solid backgrounds for visual rhythm
// 2. NO CTA buttons (Korean detail pages don't have purchase buttons in images)
// 3. Decorative elements: accent bars, circles, cards, dividers
// 4. Clean typography hierarchy with proper spacing
// 5. Product photos prominently featured where appropriate
// 6. Solid bg sections use dark text (#1a1a1a / #555555)

const templateVariants: Record<ManuscriptSectionType, SectionTemplate[]> = {

  // ========== HOOKING — photo background, first impression ==========
  hooking: [
    // A: 좌텍스트 + 우제품
    {
      sectionType: 'hooking',
      variantId: 'A',
      canvasHeight: 540,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: true,
      productImagePosition: { left: 520, top: 60, maxWidth: 300, maxHeight: 420 },
      textObjects: [
        { binding: 'label', customText: 'BRAND STORY', left: 60, top: 80, width: 400, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '카테고리 라벨', opacity: 0.9 },
        { binding: 'title', left: 60, top: 120, width: 420, fontSize: 40, fontWeight: 900, useHeadline: true, lineHeight: 1.2, letterSpacing: -1, name: '메인 타이틀' },
        { binding: 'bodyPreview', left: 60, top: 300, width: 400, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.75, name: '서브 카피' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 270, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
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
        { binding: 'label', customText: 'BRAND STORY', left: 0, top: 100, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 8, name: '카테고리 라벨', opacity: 0.8 },
        { binding: 'title', left: 80, top: 150, width: 700, fontSize: 46, fontWeight: 900, useHeadline: true, textAlign: 'center', lineHeight: 1.2, letterSpacing: -1, name: '메인 타이틀' },
        { binding: 'bodyPreview', left: 120, top: 350, width: 620, fontSize: 16, fontWeight: 400, useHeadline: false, textAlign: 'center', opacity: 0.8, lineHeight: 1.8, name: '서브 카피' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 325, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '중앙 구분선' },
      ],
    },
    // C: 하단 텍스트 + 상단 이미지
    {
      sectionType: 'hooking',
      variantId: 'C',
      canvasHeight: 600,
      overlayColor: 'rgba(0,0,0,0.35)',
      hasProductImage: true,
      productImagePosition: { left: 280, top: 30, maxWidth: 300, maxHeight: 280 },
      textObjects: [
        { binding: 'label', customText: 'BRAND STORY', left: 0, top: 340, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '카테고리 라벨', opacity: 0.8 },
        { binding: 'title', left: 80, top: 375, width: 700, fontSize: 38, fontWeight: 900, useHeadline: true, textAlign: 'center', lineHeight: 1.2, name: '메인 타이틀' },
        { binding: 'bodyPreview', left: 100, top: 490, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, textAlign: 'center', opacity: 0.8, lineHeight: 1.75, name: '서브 카피' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 360, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  // ========== HERO — photo background ==========
  hero: [
    {
      sectionType: 'hero',
      variantId: 'A',
      canvasHeight: 540,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: true,
      productImagePosition: { left: 520, top: 60, maxWidth: 300, maxHeight: 420 },
      textObjects: [
        { binding: 'label', customText: 'BRAND STORY', left: 60, top: 80, width: 400, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '카테고리 라벨', opacity: 0.9 },
        { binding: 'title', left: 60, top: 120, width: 420, fontSize: 40, fontWeight: 900, useHeadline: true, lineHeight: 1.2, name: '메인 타이틀' },
        { binding: 'bodyPreview', left: 60, top: 300, width: 400, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.75, name: '서브 카피' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 270, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  // ========== PROBLEM — solid background (공감/문제 제기) ==========
  problem: [
    // A: 중앙정렬 클린 화이트
    {
      sectionType: 'problem',
      variantId: 'A',
      canvasHeight: 500,
      solidBackground: '#FFFFFF',
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: '이런 고민, 하고 계신가요?', left: 0, top: 70, width: 860, fontSize: 13, fontWeight: 600, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 2, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 120, width: 700, fontSize: 30, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.4, name: '문제 제시' },
        { binding: 'body', left: 100, top: 240, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, textAlign: 'center', name: '공감 설명' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 210, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '중앙 구분선' },
        { type: 'circle', left: 720, top: 40, radius: 80, fill: '{colors.accent}', opacity: 0.06, selectable: false, name: '장식 서클' },
      ],
    },
    // B: 좌정렬 + 우측 제품
    {
      sectionType: 'problem',
      variantId: 'B',
      canvasHeight: 500,
      solidBackground: '#F8F8F8',
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 520, top: 80, maxWidth: 280, maxHeight: 340 },
      textObjects: [
        { binding: 'label', customText: 'PROBLEM', left: 60, top: 70, width: 400, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 110, width: 420, fontSize: 28, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.4, name: '문제 제시' },
        { binding: 'body', left: 60, top: 230, width: 420, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, name: '공감 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 200, width: 32, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'rect', left: 48, top: 108, width: 4, height: 70, fill: '{colors.accent}', opacity: 0.4, selectable: false, name: '좌측 악센트' },
      ],
    },
    // C: 카드형 중앙정렬
    {
      sectionType: 'problem',
      variantId: 'C',
      canvasHeight: 520,
      solidBackground: '#FFFFFF',
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'PAIN POINT', left: 0, top: 60, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 130, top: 135, width: 600, fontSize: 26, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.4, name: '문제 제시' },
        { binding: 'body', left: 150, top: 250, width: 560, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, textAlign: 'center', name: '공감 설명' },
      ],
      shapes: [
        { type: 'rect', left: 110, top: 100, width: 640, height: 370, fill: '#F5F5F5', rx: 16, ry: 16, selectable: false, name: '카드 배경' },
        { type: 'rect', left: 400, top: 225, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '카드 내 구분선' },
      ],
    },
  ],

  // ========== SOLUTION — photo background ==========
  solution: [
    // A: 좌제품 + 우텍스트
    {
      sectionType: 'solution',
      variantId: 'A',
      canvasHeight: 500,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: true,
      productImagePosition: { left: 40, top: 60, maxWidth: 360, maxHeight: 380 },
      textObjects: [
        { binding: 'label', customText: 'SOLUTION', left: 440, top: 80, width: 380, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 440, top: 120, width: 380, fontSize: 28, fontWeight: 800, useHeadline: true, lineHeight: 1.35, name: '솔루션 타이틀' },
        { binding: 'bodyPreview', left: 440, top: 260, width: 370, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.8, name: '솔루션 설명' },
      ],
      shapes: [
        { type: 'rect', left: 440, top: 235, width: 32, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
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
        { binding: 'label', customText: 'SOLUTION', left: 0, top: 70, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 110, width: 700, fontSize: 30, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.35, name: '솔루션 타이틀' },
        { binding: 'bodyPreview', left: 100, top: 230, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, textAlign: 'center', opacity: 0.8, lineHeight: 1.85, name: '솔루션 설명' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 205, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // C: 우제품 + 좌텍스트
    {
      sectionType: 'solution',
      variantId: 'C',
      canvasHeight: 500,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: true,
      productImagePosition: { left: 500, top: 60, maxWidth: 320, maxHeight: 380 },
      textObjects: [
        { binding: 'label', customText: 'SOLUTION', left: 60, top: 80, width: 400, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 120, width: 400, fontSize: 28, fontWeight: 800, useHeadline: true, lineHeight: 1.35, name: '솔루션 타이틀' },
        { binding: 'bodyPreview', left: 60, top: 260, width: 400, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.8, name: '솔루션 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 235, width: 32, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  // ========== FEATURES — solid background (핵심 특장점) ==========
  features: [
    // A: 중앙정렬 + 하단 제품 이미지
    {
      sectionType: 'features',
      variantId: 'A',
      canvasHeight: 600,
      solidBackground: '#FFFFFF',
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 280, top: 340, maxWidth: 300, maxHeight: 220 },
      textObjects: [
        { binding: 'label', customText: 'KEY FEATURES', left: 0, top: 60, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 100, width: 700, fontSize: 30, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.35, name: '특장점 타이틀' },
        { binding: 'body', left: 100, top: 200, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, textAlign: 'center', name: '특장점 설명' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 175, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // B: 좌정렬 + 넘버링 스타일
    {
      sectionType: 'features',
      variantId: 'B',
      canvasHeight: 600,
      solidBackground: '#F5F5F5',
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'POINT', left: 60, top: 60, width: 400, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 500, fontSize: 28, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.35, name: '특장점 타이틀' },
        { binding: 'body', left: 60, top: 200, width: 740, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, name: '특장점 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 175, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'circle', left: 680, top: 50, radius: 32, fill: '{colors.accent}', opacity: 0.08, selectable: false, name: '장식 원 1' },
        { type: 'circle', left: 750, top: 100, radius: 20, fill: '{colors.accent}', opacity: 0.06, selectable: false, name: '장식 원 2' },
        { type: 'rect', left: 48, top: 98, width: 4, height: 80, fill: '{colors.accent}', opacity: 0.3, selectable: false, name: '좌측 악센트 바' },
      ],
    },
    // C: 좌텍스트 + 우측 제품 영역
    {
      sectionType: 'features',
      variantId: 'C',
      canvasHeight: 580,
      solidBackground: '#FFFFFF',
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 490, top: 70, maxWidth: 320, maxHeight: 440 },
      textObjects: [
        { binding: 'label', customText: 'KEY FEATURES', left: 60, top: 60, width: 380, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 380, fontSize: 26, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.35, name: '특장점 타이틀' },
        { binding: 'body', left: 60, top: 210, width: 380, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, name: '특장점 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 185, width: 32, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'rect', left: 460, top: 0, width: 400, height: 580, fill: '#F8F8F8', selectable: false, name: '우측 배경 영역' },
      ],
    },
  ],

  // ========== DETAIL — solid background (상세 정보) ==========
  detail: [
    // A: 중앙정렬 + 상단 제품
    {
      sectionType: 'detail',
      variantId: 'A',
      canvasHeight: 580,
      solidBackground: '#FFFFFF',
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 280, top: 40, maxWidth: 300, maxHeight: 240 },
      textObjects: [
        { binding: 'label', customText: 'DETAIL', left: 0, top: 300, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 335, width: 700, fontSize: 26, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.35, name: '상세 타이틀' },
        { binding: 'body', left: 100, top: 420, width: 660, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, textAlign: 'center', name: '상세 설명' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 400, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // B: 좌정렬 라이트그레이
    {
      sectionType: 'detail',
      variantId: 'B',
      canvasHeight: 560,
      solidBackground: '#F5F5F5',
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'DETAIL', left: 60, top: 60, width: 400, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 500, fontSize: 26, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.35, name: '상세 타이틀' },
        { binding: 'body', left: 60, top: 200, width: 740, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, name: '상세 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 175, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'rect', left: 48, top: 98, width: 4, height: 70, fill: '{colors.accent}', opacity: 0.3, selectable: false, name: '좌측 악센트' },
      ],
    },
    // C: 좌텍스트 + 우제품
    {
      sectionType: 'detail',
      variantId: 'C',
      canvasHeight: 560,
      solidBackground: '#FFFFFF',
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 480, top: 60, maxWidth: 340, maxHeight: 440 },
      textObjects: [
        { binding: 'label', customText: 'DETAIL', left: 60, top: 60, width: 380, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 380, fontSize: 26, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.35, name: '상세 타이틀' },
        { binding: 'body', left: 60, top: 210, width: 380, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, name: '상세 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 185, width: 32, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  // ========== HOWTO — solid background (사용법) ==========
  howto: [
    // A: 좌텍스트 + 우제품
    {
      sectionType: 'howto',
      variantId: 'A',
      canvasHeight: 540,
      solidBackground: '#FFFFFF',
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 500, top: 80, maxWidth: 320, maxHeight: 380 },
      textObjects: [
        { binding: 'label', customText: 'HOW TO USE', left: 60, top: 60, width: 400, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 400, fontSize: 28, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.35, name: '사용법 타이틀' },
        { binding: 'body', left: 60, top: 200, width: 400, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, name: '사용법 설명' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 175, width: 32, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'circle', left: 60, top: 380, radius: 24, fill: '{colors.accent}', opacity: 0.08, selectable: false, name: '장식 원' },
      ],
    },
    // B: 중앙정렬 라이트그레이
    {
      sectionType: 'howto',
      variantId: 'B',
      canvasHeight: 540,
      solidBackground: '#F8F8F8',
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'HOW TO USE', left: 0, top: 60, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 100, width: 700, fontSize: 28, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.35, name: '사용법 타이틀' },
        { binding: 'body', left: 100, top: 200, width: 660, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, textAlign: 'center', name: '사용법 설명' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 175, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  // ========== SOCIAL PROOF — mixed (photo + solid) ==========
  social_proof: [
    // A: 중앙정렬 photo background
    {
      sectionType: 'social_proof',
      variantId: 'A',
      canvasHeight: 500,
      overlayColor: 'rgba(0,0,0,0.5)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'PROVEN RESULTS', left: 0, top: 70, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 110, width: 700, fontSize: 28, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.4, name: '사회적 증거' },
        { binding: 'body', left: 100, top: 230, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.85, textAlign: 'center', name: '리뷰/증거 내용' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 200, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // B: 좌정렬 리뷰 스타일 — solid background
    {
      sectionType: 'social_proof',
      variantId: 'B',
      canvasHeight: 500,
      solidBackground: '#FFFFFF',
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'REVIEW', left: 80, top: 70, width: 400, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 110, width: 700, fontSize: 26, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.4, name: '사회적 증거' },
        { binding: 'body', left: 80, top: 230, width: 700, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, name: '리뷰/증거 내용' },
      ],
      shapes: [
        { type: 'rect', left: 68, top: 108, width: 4, height: 70, fill: '{colors.accent}', opacity: 0.4, selectable: false, name: '좌측 악센트' },
        { type: 'rect', left: 80, top: 200, width: 32, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // C: 수치 강조형 — photo background
    {
      sectionType: 'social_proof',
      variantId: 'C',
      canvasHeight: 500,
      overlayColor: 'rgba(0,0,0,0.45)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'PROVEN RESULTS', left: 0, top: 60, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨', opacity: 0.8 },
        { binding: 'title', left: 80, top: 100, width: 700, fontSize: 48, fontWeight: 900, useHeadline: true, textAlign: 'center', lineHeight: 1.2, name: '핵심 수치' },
        { binding: 'body', left: 100, top: 260, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.8, textAlign: 'center', name: '수치 설명' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 235, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],

  // ========== TRUST — solid background ==========
  trust: [
    {
      sectionType: 'trust',
      variantId: 'A',
      canvasHeight: 480,
      solidBackground: '#F8F8F8',
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'WHY TRUST US', left: 0, top: 60, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 100, width: 700, fontSize: 26, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.35, name: '신뢰 타이틀' },
        { binding: 'body', left: 100, top: 200, width: 660, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, textAlign: 'center', name: '신뢰 설명' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 175, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'rect', left: 200, top: 330, width: 200, height: 100, fill: '#FFFFFF', rx: 12, ry: 12, selectable: false, name: '인증 카드 1' },
        { type: 'rect', left: 460, top: 330, width: 200, height: 100, fill: '#FFFFFF', rx: 12, ry: 12, selectable: false, name: '인증 카드 2' },
      ],
    },
  ],

  // ========== SPECS — solid background ==========
  specs: [
    // A: 좌정렬 + 우측 제품
    {
      sectionType: 'specs',
      variantId: 'A',
      canvasHeight: 520,
      solidBackground: '#FFFFFF',
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 520, top: 80, maxWidth: 280, maxHeight: 360 },
      textObjects: [
        { binding: 'label', customText: 'SPECIFICATIONS', left: 60, top: 60, width: 400, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 420, fontSize: 26, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.3, name: '스펙 타이틀' },
        { binding: 'body', left: 60, top: 200, width: 420, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, name: '스펙 내용' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 175, width: 32, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // B: 카드 내부 중앙정렬
    {
      sectionType: 'specs',
      variantId: 'B',
      canvasHeight: 540,
      solidBackground: '#F5F5F5',
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'SPECIFICATIONS', left: 0, top: 55, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 130, top: 120, width: 600, fontSize: 24, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.3, name: '스펙 타이틀' },
        { binding: 'body', left: 150, top: 210, width: 560, fontSize: 13, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.85, name: '스펙 내용' },
      ],
      shapes: [
        { type: 'rect', left: 110, top: 90, width: 640, height: 400, fill: '#FFFFFF', rx: 16, ry: 16, selectable: false, name: '카드 배경' },
        { type: 'rect', left: 400, top: 190, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '카드 내 구분선' },
      ],
    },
  ],

  // ========== GUARANTEE — photo background ==========
  guarantee: [
    // A: 중앙정렬
    {
      sectionType: 'guarantee',
      variantId: 'A',
      canvasHeight: 460,
      overlayColor: 'rgba(0,0,0,0.45)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'GUARANTEE', left: 0, top: 70, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 110, width: 700, fontSize: 28, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.35, name: '보증 타이틀' },
        { binding: 'body', left: 100, top: 220, width: 660, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.85, textAlign: 'center', name: '보증 내용' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 195, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // B: 카드형
    {
      sectionType: 'guarantee',
      variantId: 'B',
      canvasHeight: 480,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'GUARANTEE', left: 0, top: 60, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 5, name: '섹션 라벨' },
        { binding: 'title', left: 130, top: 125, width: 600, fontSize: 26, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.35, name: '보증 타이틀' },
        { binding: 'body', left: 150, top: 230, width: 560, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.85, textAlign: 'center', name: '보증 내용' },
      ],
      shapes: [
        { type: 'rect', left: 110, top: 95, width: 640, height: 340, fill: 'rgba(255,255,255,0.08)', rx: 16, ry: 16, selectable: false, name: '카드 배경' },
        { type: 'rect', left: 400, top: 205, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '카드 내 구분선' },
      ],
    },
  ],

  // ========== EVENT BANNER — photo background ==========
  event_banner: [
    {
      sectionType: 'event_banner',
      variantId: 'A',
      canvasHeight: 300,
      overlayColor: 'rgba(0,0,0,0.35)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'SPECIAL OFFER', left: 0, top: 60, width: 860, fontSize: 11, fontWeight: 700, useHeadline: false, fill: '#ffffff', textAlign: 'center', letterSpacing: 5, name: '오퍼 라벨', opacity: 0.8 },
        { binding: 'title', left: 80, top: 100, width: 700, fontSize: 34, fontWeight: 900, useHeadline: true, fill: '#ffffff', textAlign: 'center', lineHeight: 1.25, name: '이벤트 타이틀' },
        { binding: 'bodyPreview', left: 100, top: 200, width: 660, fontSize: 16, fontWeight: 400, useHeadline: false, fill: '#ffffff', textAlign: 'center', opacity: 0.85, name: '가격/할인 정보' },
      ],
      shapes: [],
    },
  ],

  // ========== CTA → closing section (NO CTA buttons) ==========
  cta: [
    // A: 중앙정렬 클로징
    {
      sectionType: 'cta',
      variantId: 'A',
      canvasHeight: 340,
      overlayColor: 'rgba(0,0,0,0.4)',
      hasProductImage: false,
      textObjects: [
        { binding: 'title', left: 80, top: 80, width: 700, fontSize: 34, fontWeight: 900, useHeadline: true, fill: '#ffffff', textAlign: 'center', lineHeight: 1.3, name: '클로징 타이틀' },
        { binding: 'bodyPreview', left: 100, top: 200, width: 660, fontSize: 16, fontWeight: 400, useHeadline: false, fill: '#ffffff', textAlign: 'center', opacity: 0.85, lineHeight: 1.6, name: '클로징 서브' },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 175, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
    // B: 좌정렬 클로징
    {
      sectionType: 'cta',
      variantId: 'B',
      canvasHeight: 320,
      overlayColor: 'rgba(0,0,0,0.45)',
      hasProductImage: false,
      textObjects: [
        { binding: 'title', left: 60, top: 70, width: 500, fontSize: 30, fontWeight: 900, useHeadline: true, fill: '#ffffff', lineHeight: 1.3, name: '클로징 타이틀' },
        { binding: 'bodyPreview', left: 60, top: 190, width: 500, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#ffffff', opacity: 0.8, lineHeight: 1.6, name: '클로징 서브' },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 165, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
      ],
    },
  ],
};

// ===== Category-based variant preferences =====
// Based on analysis of 26 Korean e-commerce detail pages
const CATEGORY_VARIANT_PREFERENCES: Record<string, Partial<Record<ManuscriptSectionType, string[]>>> = {
  food: {
    hooking: ['A', 'C'],
    features: ['A', 'B'],
    social_proof: ['C', 'A'],
  },
  cosmetics: {
    hooking: ['B', 'C'],
    features: ['B', 'A'],
    social_proof: ['C', 'A'],
  },
  interior: {
    hooking: ['B', 'A'],
    features: ['A', 'C'],
    detail: ['C', 'A'],
  },
  industrial: {
    hooking: ['A', 'B'],
    features: ['A', 'B'],
  },
  living: {
    features: ['B', 'A'],
    social_proof: ['A', 'B'],
  },
};

/**
 * Get a template for a section type.
 * When `order` is provided, auto-selects variant based on order index
 * to ensure visual diversity across sections.
 */
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
