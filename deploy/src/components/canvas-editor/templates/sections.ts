import { SectionTemplate } from './types';
import { ManuscriptSectionType } from '@/lib/types';

// ===== Section templates: define text layout over AI-generated background images =====

const templates: Record<ManuscriptSectionType, SectionTemplate> = {
  hooking: {
    sectionType: 'hooking',
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

  hero: {
    sectionType: 'hero',
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

  problem: {
    sectionType: 'problem',
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

  solution: {
    sectionType: 'solution',
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

  features: {
    sectionType: 'features',
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

  detail: {
    sectionType: 'detail',
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

  howto: {
    sectionType: 'howto',
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

  social_proof: {
    sectionType: 'social_proof',
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

  trust: {
    sectionType: 'trust',
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

  specs: {
    sectionType: 'specs',
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

  guarantee: {
    sectionType: 'guarantee',
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

  event_banner: {
    sectionType: 'event_banner',
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

  cta: {
    sectionType: 'cta',
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
};

export function getTemplate(sectionType: ManuscriptSectionType): SectionTemplate {
  return templates[sectionType] || templates.features;
}

export function getAllTemplates(): Record<ManuscriptSectionType, SectionTemplate> {
  return templates;
}
