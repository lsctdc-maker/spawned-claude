import { SectionTemplate } from './types';
import { ManuscriptSectionType } from '@/lib/types';
import { enrichTemplate } from './enrichTemplate';

// ===== Korean e-commerce detail page templates =====
// Design principles:
// 1. Alternating photo/solid backgrounds for visual rhythm
// 2. NO CTA buttons (Korean detail pages don't have purchase buttons in images)
// 3. Decorative elements: icons, badges, gradients, accent bars
// 4. Clean typography hierarchy with proper spacing
// 5. Product photos prominently featured where appropriate
// 6. Solid bg sections use dark text (#1a1a1a / #555555)
// 7. Text shadow/stroke for depth and readability (photo bg: strong, solid bg: subtle)

// ===== Shadow presets =====
const PHOTO_TITLE_SHADOW = { color: 'rgba(0,0,0,0.5)', offsetX: 0, offsetY: 2, blur: 8 };
const PHOTO_LABEL_SHADOW = { color: 'rgba(0,0,0,0.3)', offsetX: 0, offsetY: 1, blur: 3 };
const PHOTO_BODY_SHADOW = { color: 'rgba(0,0,0,0.25)', offsetX: 0, offsetY: 1, blur: 4 };
const SOLID_TITLE_SHADOW = { color: 'rgba(0,0,0,0.08)', offsetX: 0, offsetY: 1, blur: 3 };

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
        { binding: 'label', customText: 'BRAND STORY', left: 60, top: 80, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 8, name: '카테고리 라벨', opacity: 0.9, shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 60, top: 120, width: 420, fontSize: 42, fontWeight: 900, useHeadline: true, lineHeight: 1.2, letterSpacing: -1, name: '메인 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'bodyPreview', left: 60, top: 310, width: 420, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.75, name: '서브 카피', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 280, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'gradient-rect', left: 0, top: 480, width: 860, height: 60, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 60 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.15)' }] }, selectable: false, name: '하단 그라데이션' },
        { type: 'icon', left: 60, top: 430, iconName: 'sparkles', iconSize: 20, fill: '{colors.accent}', opacity: 0.15, selectable: false, name: '장식 아이콘' },
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
        { binding: 'label', customText: 'BRAND STORY', left: 0, top: 100, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 8, name: '카테고리 라벨', opacity: 0.8, shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 80, top: 150, width: 700, fontSize: 48, fontWeight: 900, useHeadline: true, textAlign: 'center', lineHeight: 1.2, letterSpacing: -1, name: '메인 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'bodyPreview', left: 120, top: 350, width: 620, fontSize: 16, fontWeight: 400, useHeadline: false, textAlign: 'center', opacity: 0.8, lineHeight: 1.8, name: '서브 카피', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 325, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '중앙 구분선' },
        { type: 'gradient-rect', left: 0, top: 500, width: 860, height: 60, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 60 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.15)' }] }, selectable: false, name: '하단 그라데이션' },
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
        { binding: 'label', customText: 'BRAND STORY', left: 0, top: 340, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 8, name: '카테고리 라벨', opacity: 0.8, shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 80, top: 375, width: 700, fontSize: 42, fontWeight: 900, useHeadline: true, textAlign: 'center', lineHeight: 1.2, name: '메인 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'bodyPreview', left: 100, top: 490, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, textAlign: 'center', opacity: 0.8, lineHeight: 1.75, name: '서브 카피', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 360, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'gradient-rect', left: 0, top: 540, width: 860, height: 60, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 60 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.15)' }] }, selectable: false, name: '하단 그라데이션' },
        { type: 'icon', left: 770, top: 350, iconName: 'sparkles', iconSize: 24, fill: '{colors.accent}', opacity: 0.12, selectable: false, name: '장식 아이콘' },
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
        { binding: 'label', customText: 'BRAND STORY', left: 60, top: 80, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 8, name: '카테고리 라벨', opacity: 0.9, shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 60, top: 120, width: 420, fontSize: 42, fontWeight: 900, useHeadline: true, lineHeight: 1.2, name: '메인 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'bodyPreview', left: 60, top: 310, width: 420, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.75, name: '서브 카피', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 280, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'gradient-rect', left: 0, top: 480, width: 860, height: 60, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 60 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.15)' }] }, selectable: false, name: '하단 그라데이션' },
        { type: 'icon', left: 740, top: 430, iconName: 'sparkles', iconSize: 28, fill: '{colors.accent}', opacity: 0.12, selectable: false, name: '장식 아이콘' },
      ],
    },
  ],

  // ========== PROBLEM — solid background (공감/문제 제기) ==========
  problem: [
    // A: 공감 카드 (좌 accent bar + 큰 ? 장식)
    {
      sectionType: 'problem',
      variantId: 'A',
      canvasHeight: 500,
      solidBackground: '#FFFFFF',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: '이런 고민, 하고 계신가요?', left: 60, top: 60, width: 700, fontSize: 13, fontWeight: 600, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 720, fontSize: 34, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.4, name: '문제 제시', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 80, top: 200, width: 720, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, name: '공감 설명' },
      ],
      shapes: [],
    },
    // B: 중앙 카드 + 상단 아이콘
    {
      sectionType: 'problem',
      variantId: 'B',
      canvasHeight: 500,
      solidBackground: '#F8F8F8',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'PROBLEM', left: 0, top: 60, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 120, top: 140, width: 620, fontSize: 34, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.4, name: '문제 제시', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 120, top: 260, width: 620, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, textAlign: 'center', name: '공감 설명' },
      ],
      shapes: [],
    },
    // C: 좌정렬 + 우측 제품
    {
      sectionType: 'problem',
      variantId: 'C',
      canvasHeight: 500,
      solidBackground: '#FFFFFF',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 490, top: 70, maxWidth: 320, maxHeight: 360 },
      textObjects: [
        { binding: 'label', customText: 'PROBLEM', left: 60, top: 60, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 400, fontSize: 32, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.4, name: '문제 제시', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 60, top: 220, width: 420, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, name: '공감 설명' },
      ],
      shapes: [],
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
        { binding: 'label', customText: 'SOLUTION', left: 440, top: 80, width: 380, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 8, name: '섹션 라벨', shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 440, top: 120, width: 380, fontSize: 34, fontWeight: 800, useHeadline: true, lineHeight: 1.35, name: '솔루션 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'bodyPreview', left: 440, top: 270, width: 380, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.8, name: '솔루션 설명', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 440, top: 245, width: 32, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'badge', left: 780, top: 80, radius: 18, fill: '{colors.accent}', badgeIcon: 'circle-check', badgeTextColor: '#FFFFFF', opacity: 0.85, selectable: false, name: '솔루션 뱃지' },
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
        { binding: 'label', customText: 'SOLUTION', left: 0, top: 70, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 8, name: '섹션 라벨', shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 80, top: 110, width: 700, fontSize: 36, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.35, name: '솔루션 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'bodyPreview', left: 100, top: 240, width: 660, fontSize: 15, fontWeight: 400, useHeadline: false, textAlign: 'center', opacity: 0.8, lineHeight: 1.8, name: '솔루션 설명', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 215, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'gradient-rect', left: 0, top: 420, width: 860, height: 60, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 60 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.12)' }] }, selectable: false, name: '하단 그라데이션' },
        { type: 'icon', left: 60, top: 400, iconName: 'circle-check', iconSize: 22, fill: '{colors.accent}', opacity: 0.15, selectable: false, name: '솔루션 아이콘' },
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
        { binding: 'label', customText: 'SOLUTION', left: 60, top: 80, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 8, name: '섹션 라벨', shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 60, top: 120, width: 420, fontSize: 34, fontWeight: 800, useHeadline: true, lineHeight: 1.35, name: '솔루션 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'bodyPreview', left: 60, top: 270, width: 420, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.8, lineHeight: 1.8, name: '솔루션 설명', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 245, width: 32, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'badge', left: 60, top: 380, radius: 18, fill: '{colors.accent}', badgeIcon: 'check', badgeTextColor: '#FFFFFF', opacity: 0.8, selectable: false, name: '체크 뱃지' },
      ],
    },
  ],

  // ========== FEATURES — solid background (핵심 특장점) ==========
  features: [
    // A: 3열 아이콘 카드 그리드 (icon-grid-3col, 35% — 가장 빈도 높음)
    {
      sectionType: 'features',
      variantId: 'A',
      canvasHeight: 600,
      solidBackground: '#FFFFFF',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'KEY FEATURES', left: 0, top: 50, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 90, width: 700, fontSize: 36, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.35, name: '특장점 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 80, top: 180, width: 700, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, textAlign: 'center', name: '특장점 설명' },
      ],
      shapes: [],
    },
    // B: Point 넘버링 패턴 (numbered-points, 15%)
    {
      sectionType: 'features',
      variantId: 'B',
      canvasHeight: 600,
      solidBackground: '#F5F5F5',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'POINT', left: 60, top: 60, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 500, fontSize: 34, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.35, name: '특장점 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 60, top: 200, width: 720, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, name: '특장점 설명' },
      ],
      shapes: [],
    },
    // C: 좌텍스트/우제품 분할 (split-layout)
    {
      sectionType: 'features',
      variantId: 'C',
      canvasHeight: 580,
      solidBackground: '#FFFFFF',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 490, top: 70, maxWidth: 320, maxHeight: 440 },
      textObjects: [
        { binding: 'label', customText: 'KEY FEATURES', left: 60, top: 60, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 400, fontSize: 32, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.35, name: '특장점 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 60, top: 210, width: 420, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, name: '특장점 설명' },
      ],
      shapes: [],
    },
  ],

  // ========== DETAIL — solid background (상세 정보) ==========
  detail: [
    // A: 중앙정렬 + 상단 제품 영역
    {
      sectionType: 'detail',
      variantId: 'A',
      canvasHeight: 580,
      solidBackground: '#FFFFFF',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 280, top: 40, maxWidth: 300, maxHeight: 220 },
      textObjects: [
        { binding: 'label', customText: 'DETAIL', left: 0, top: 290, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 325, width: 700, fontSize: 32, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.35, name: '상세 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 100, top: 400, width: 680, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, textAlign: 'center', name: '상세 설명' },
      ],
      shapes: [],
    },
    // B: 좌정렬 카드
    {
      sectionType: 'detail',
      variantId: 'B',
      canvasHeight: 560,
      solidBackground: '#F5F5F5',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'DETAIL', left: 60, top: 60, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 720, fontSize: 32, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.35, name: '상세 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 60, top: 200, width: 720, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, name: '상세 설명' },
      ],
      shapes: [],
    },
    // C: 좌텍스트/우제품 분할
    {
      sectionType: 'detail',
      variantId: 'C',
      canvasHeight: 560,
      solidBackground: '#FFFFFF',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: true,
      productImagePosition: { left: 480, top: 60, maxWidth: 340, maxHeight: 440 },
      textObjects: [
        { binding: 'label', customText: 'DETAIL', left: 60, top: 60, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 100, width: 400, fontSize: 32, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.35, name: '상세 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 60, top: 210, width: 420, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, name: '상세 설명' },
      ],
      shapes: [],
    },
  ],

  // ========== HOWTO — solid background (사용법) ==========
  howto: [
    // A: Step 1→2→3 연결선 카드 (numbered-steps, 25%)
    {
      sectionType: 'howto',
      variantId: 'A',
      canvasHeight: 540,
      solidBackground: '#FFFFFF',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'HOW TO USE', left: 60, top: 50, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 90, width: 720, fontSize: 34, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.35, name: '사용법 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 60, top: 190, width: 740, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, name: '사용법 설명' },
      ],
      shapes: [],
    },
    // B: 중앙 3스텝 카드 (step-icons, 15%)
    {
      sectionType: 'howto',
      variantId: 'B',
      canvasHeight: 540,
      solidBackground: '#F8F8F8',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'HOW TO USE', left: 0, top: 50, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 90, width: 700, fontSize: 34, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.35, name: '사용법 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 80, top: 190, width: 700, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, textAlign: 'center', name: '사용법 설명' },
      ],
      shapes: [],
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
        { binding: 'label', customText: 'PROVEN RESULTS', left: 0, top: 70, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 8, name: '섹션 라벨', shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 80, top: 110, width: 700, fontSize: 34, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.4, name: '사회적 증거', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'body', left: 80, top: 240, width: 700, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.8, textAlign: 'center', name: '리뷰/증거 내용', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 210, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'icon', left: 340, top: 410, iconName: 'star', iconSize: 18, fill: '{colors.accent}', opacity: 0.9, selectable: false, name: '별 1' },
        { type: 'icon', left: 375, top: 410, iconName: 'star', iconSize: 18, fill: '{colors.accent}', opacity: 0.9, selectable: false, name: '별 2' },
        { type: 'icon', left: 410, top: 410, iconName: 'star', iconSize: 18, fill: '{colors.accent}', opacity: 0.9, selectable: false, name: '별 3' },
        { type: 'icon', left: 445, top: 410, iconName: 'star', iconSize: 18, fill: '{colors.accent}', opacity: 0.9, selectable: false, name: '별 4' },
        { type: 'icon', left: 480, top: 410, iconName: 'star', iconSize: 18, fill: '{colors.accent}', opacity: 0.9, selectable: false, name: '별 5' },
      ],
    },
    // B: 리뷰 카드 (review-cards, 45% — 가장 빈도 높음) — solid background
    {
      sectionType: 'social_proof',
      variantId: 'B',
      canvasHeight: 500,
      solidBackground: '#FFFFFF',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'REVIEW', left: 60, top: 50, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 90, width: 720, fontSize: 32, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.4, name: '사회적 증거', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 60, top: 220, width: 720, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, name: '리뷰/증거 내용' },
      ],
      shapes: [],
    },
    // C: 수치 강조형 — photo background
    {
      sectionType: 'social_proof',
      variantId: 'C',
      canvasHeight: 500,
      overlayColor: 'rgba(0,0,0,0.45)',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'PROVEN RESULTS', left: 0, top: 60, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 8, name: '섹션 라벨', opacity: 0.8, shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 80, top: 100, width: 700, fontSize: 50, fontWeight: 900, useHeadline: true, textAlign: 'center', lineHeight: 1.2, name: '핵심 수치', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'body', left: 80, top: 270, width: 700, fontSize: 15, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.8, textAlign: 'center', name: '수치 설명', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 245, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'gradient-rect', left: 0, top: 440, width: 860, height: 60, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 60 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.12)' }] }, selectable: false, name: '하단 그라데이션' },
        { type: 'icon', left: 380, top: 380, iconName: 'thumbs-up', iconSize: 24, fill: '{colors.accent}', opacity: 0.25, selectable: false, name: '좋아요 아이콘' },
      ],
    },
  ],

  // ========== TRUST — solid background (인증/수상) ==========
  trust: [
    // A: 인증 뱃지 그리드 (certification-grid, 30%)
    {
      sectionType: 'trust',
      variantId: 'A',
      canvasHeight: 480,
      solidBackground: '#F8F8F8',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'WHY TRUST US', left: 0, top: 50, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 80, top: 90, width: 700, fontSize: 32, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.35, name: '신뢰 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 80, top: 180, width: 700, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, textAlign: 'center', name: '신뢰 설명' },
      ],
      shapes: [],
    },
  ],

  // ========== SPECS — solid background (제품 사양) ==========
  specs: [
    // A: 좌정렬 표 (left-aligned-table, 50% — 가장 빈도 높음)
    {
      sectionType: 'specs',
      variantId: 'A',
      canvasHeight: 520,
      solidBackground: '#FFFFFF',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'SPECIFICATIONS', left: 60, top: 50, width: 400, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 60, top: 90, width: 720, fontSize: 32, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', lineHeight: 1.3, name: '스펙 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 60, top: 190, width: 720, fontSize: 14, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, name: '스펙 내용' },
      ],
      shapes: [],
    },
    // B: 중앙 카드 (center-card, 30%)
    {
      sectionType: 'specs',
      variantId: 'B',
      canvasHeight: 540,
      solidBackground: '#F5F5F5',
      useHtmlDesign: true,
      overlayColor: '',
      hasProductImage: false,
      textObjects: [
        { binding: 'label', customText: 'SPECIFICATIONS', left: 0, top: 50, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 6, name: '섹션 라벨' },
        { binding: 'title', left: 100, top: 110, width: 660, fontSize: 30, fontWeight: 800, useHeadline: true, fill: '#1a1a1a', textAlign: 'center', lineHeight: 1.3, name: '스펙 타이틀', shadow: SOLID_TITLE_SHADOW },
        { binding: 'body', left: 100, top: 200, width: 660, fontSize: 13, fontWeight: 400, useHeadline: false, fill: '#555555', lineHeight: 1.8, name: '스펙 내용' },
      ],
      shapes: [],
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
        { binding: 'label', customText: 'GUARANTEE', left: 0, top: 70, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 8, name: '섹션 라벨', shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 80, top: 110, width: 700, fontSize: 34, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.35, name: '보증 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'body', left: 80, top: 230, width: 700, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.8, textAlign: 'center', name: '보증 내용', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 205, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'badge', left: 405, top: 25, radius: 22, fill: '{colors.accent}', badgeIcon: 'shield-check', badgeTextColor: '#FFFFFF', opacity: 0.9, selectable: false, name: '보증 뱃지' },
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
        { binding: 'label', customText: 'GUARANTEE', left: 0, top: 60, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '{colors.accent}', textAlign: 'center', letterSpacing: 8, name: '섹션 라벨', shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 130, top: 125, width: 600, fontSize: 34, fontWeight: 800, useHeadline: true, textAlign: 'center', lineHeight: 1.35, name: '보증 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'body', left: 130, top: 240, width: 600, fontSize: 14, fontWeight: 400, useHeadline: false, opacity: 0.85, lineHeight: 1.8, textAlign: 'center', name: '보증 내용', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 110, top: 95, width: 640, height: 340, fill: 'rgba(255,255,255,0.08)', rx: 16, ry: 16, selectable: false, name: '카드 배경' },
        { type: 'rect', left: 400, top: 215, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '카드 내 구분선' },
        { type: 'badge', left: 405, top: 100, radius: 18, fill: '{colors.accent}', badgeIcon: 'shield-check', badgeTextColor: '#FFFFFF', opacity: 0.85, selectable: false, name: '보증 뱃지' },
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
        { binding: 'label', customText: 'SPECIAL OFFER', left: 0, top: 60, width: 860, fontSize: 13, fontWeight: 700, useHeadline: false, fill: '#ffffff', textAlign: 'center', letterSpacing: 8, name: '오퍼 라벨', opacity: 0.8, shadow: PHOTO_LABEL_SHADOW },
        { binding: 'title', left: 80, top: 100, width: 700, fontSize: 40, fontWeight: 900, useHeadline: true, fill: '#ffffff', textAlign: 'center', lineHeight: 1.25, name: '이벤트 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'bodyPreview', left: 100, top: 200, width: 660, fontSize: 16, fontWeight: 400, useHeadline: false, fill: '#ffffff', textAlign: 'center', opacity: 0.85, name: '가격/할인 정보', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'gradient-rect', left: 0, top: 0, width: 860, height: 300, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 860, y2: 300 }, colorStops: [{ offset: 0, color: '{colors.accent}' }, { offset: 1, color: 'rgba(0,0,0,0)' }] }, opacity: 0.15, selectable: false, name: '악센트 오버레이' },
        { type: 'icon', left: 60, top: 55, iconName: 'zap', iconSize: 28, fill: '{colors.accent}', opacity: 0.6, selectable: false, name: '번개 아이콘' },
      ],
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
        { binding: 'title', left: 80, top: 80, width: 700, fontSize: 40, fontWeight: 900, useHeadline: true, fill: '#ffffff', textAlign: 'center', lineHeight: 1.3, name: '클로징 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'bodyPreview', left: 100, top: 200, width: 660, fontSize: 16, fontWeight: 400, useHeadline: false, fill: '#ffffff', textAlign: 'center', opacity: 0.85, lineHeight: 1.6, name: '클로징 서브', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 400, top: 175, width: 60, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'gradient-rect', left: 0, top: 280, width: 860, height: 60, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 60 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.15)' }] }, selectable: false, name: '하단 그라데이션' },
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
        { binding: 'title', left: 60, top: 70, width: 500, fontSize: 36, fontWeight: 900, useHeadline: true, fill: '#ffffff', lineHeight: 1.3, name: '클로징 타이틀', shadow: PHOTO_TITLE_SHADOW, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 },
        { binding: 'bodyPreview', left: 60, top: 200, width: 500, fontSize: 15, fontWeight: 400, useHeadline: false, fill: '#ffffff', opacity: 0.8, lineHeight: 1.6, name: '클로징 서브', shadow: PHOTO_BODY_SHADOW },
      ],
      shapes: [
        { type: 'rect', left: 60, top: 175, width: 40, height: 3, fill: '{colors.accent}', selectable: false, name: '구분선' },
        { type: 'gradient-rect', left: 0, top: 260, width: 860, height: 60, gradient: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 60 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.15)' }] }, selectable: false, name: '하단 그라데이션' },
        { type: 'icon', left: 740, top: 60, iconName: 'heart', iconSize: 24, fill: '{colors.accent}', opacity: 0.15, selectable: false, name: '장식 아이콘' },
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

  const pickVariant = (): SectionTemplate => {
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
  };

  // Phase 5-1: 모든 템플릿에 데코레이티브 레이어 자동 추가 (10-15 레이어 보장)
  return enrichTemplate(pickVariant());
}

export function getAllTemplates(): Record<ManuscriptSectionType, SectionTemplate[]> {
  return templateVariants;
}
