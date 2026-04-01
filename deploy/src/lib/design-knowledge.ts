/**
 * design-knowledge.ts
 * 26개 실제 한국 상세페이지 분석 데이터 → 앱 파이프라인 연결 모듈
 *
 * 서버 사이드에서만 사용 (API routes: manuscript, image)
 * 클라이언트 사이드에서는 정적 매핑 테이블 사용 (Phase 3)
 */

import type { CategoryKey } from './types';
import designKnowledgeJson from '../data/design-knowledge.json';

// ===== TypeScript 인터페이스 =====

export interface LayoutInfo {
  name: string;
  frequency: number;
  description: string;
}

export interface SectionTypePattern {
  frequency: number;
  avgHeight: number;
  layouts: LayoutInfo[];
  overlayOpacity: [number, number];
  textAlignment: string;
  hasProductImage: boolean;
}

export interface CategoryColorPalettes {
  primary: string[];
  secondary: string[];
  accent: string[];
  backgrounds?: string[][];
}

export interface CategoryPattern {
  sampleCount: number;
  samples: string[];
  avgSectionCount: number;
  commonSectionOrder: string[];
  colorPalettes: CategoryColorPalettes;
  backgroundAlternation: string;
  dominantLayouts: string[];
  specialElements: string[];
}

export interface GlobalPatterns {
  avgSectionCount: number;
  sectionCountRange: [number, number];
  avgPageHeight: number;
  commonWidth: number;
  backgroundAlternation: string;
  commonSectionOrder: string[];
  layoutDistribution: Record<string, number>;
  designRules: string[];
}

export interface AnalysisSection {
  order: number;
  type: string;
  layout: string;
  bgColor: string;
  hasProductImage: boolean;
  textAlign: string;
}

export interface AnalysisEntry {
  fileName: string;
  clientName: string;
  category: string;
  dimensions: { width: number; height: number };
  sectionCount: number;
  sections: AnalysisSection[];
  colorPalette: { primary: string; secondary: string; accent: string };
  overallStyle: string;
}

export interface DesignKnowledge {
  analyzedCount: number;
  analyzedAt: string;
  source: string;
  globalPatterns: GlobalPatterns;
  categoryPatterns: Record<string, CategoryPattern>;
  sectionTypePatterns: Record<string, SectionTypePattern>;
  analyses: AnalysisEntry[];
}

// ===== 데이터 로드 =====

const data = designKnowledgeJson as unknown as DesignKnowledge;

// ===== 카테고리 매핑 (앱 15개 → JSON 11개) =====

type DesignKnowledgeCategory = keyof typeof data.categoryPatterns;

const CATEGORY_MAP: Record<CategoryKey, DesignKnowledgeCategory | null> = {
  food: 'food',
  cosmetics: 'cosmetics',
  health: 'cosmetics',          // 건강식품 → 화장품과 유사 (성분 강조, 인증)
  electronics: 'home_appliance', // 전자제품 → 가전
  fashion: null,                 // 매핑 없음 → globalPatterns
  living: 'household',           // 생활용품
  pets: null,
  kids: null,
  sports: null,
  interior: 'interior',
  automotive: 'industrial',      // 자동차용품 → 산업재와 유사
  stationery: 'crafts_accessories',
  beverages: 'traditional_alcohol',
  digital: null,
  others: null,
};

// ===== 헬퍼 함수 =====

/**
 * 카테고리별 패턴 반환 (없으면 null)
 */
export function getCategoryPatterns(category: CategoryKey | ''): CategoryPattern | null {
  if (!category) return null;
  const mapped = CATEGORY_MAP[category];
  if (!mapped) return null;
  return data.categoryPatterns[mapped] ?? null;
}

/**
 * 권장 섹션 순서
 */
export function getRecommendedSectionOrder(category: CategoryKey | ''): string[] {
  const patterns = getCategoryPatterns(category);
  return patterns?.commonSectionOrder ?? data.globalPatterns.commonSectionOrder;
}

/**
 * 권장 섹션 수
 */
export function getRecommendedSectionCount(category: CategoryKey | ''): number {
  const patterns = getCategoryPatterns(category);
  return patterns?.avgSectionCount ?? data.globalPatterns.avgSectionCount;
}

/**
 * 카테고리 검증 색상 팔레트
 */
export function getCategoryColorPalette(category: CategoryKey | ''): CategoryColorPalettes | null {
  const patterns = getCategoryPatterns(category);
  return patterns?.colorPalettes ?? null;
}

/**
 * RGB 유클리드 거리 계산
 */
export function colorDistance(hex1: string, hex2: string): number {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
    };
  };
  const c1 = parse(hex1);
  const c2 = parse(hex2);
  return Math.sqrt(
    (c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2
  );
}

/**
 * AI 생성 색상 팔레트를 카테고리 기준으로 검증/교체
 * 거리 > 임계값이면 카테고리 검증 색상으로 교체
 */
export function validateColorPalette(
  aiPrimaryHex: string,
  category: CategoryKey | '',
  threshold: number = 120
): { hex: string; replaced: boolean; reason?: string } {
  const palette = getCategoryColorPalette(category);
  if (!palette || palette.primary.length === 0) {
    return { hex: aiPrimaryHex, replaced: false };
  }

  // 가장 가까운 카테고리 검증 색상 찾기
  let closestHex = palette.primary[0];
  let closestDist = colorDistance(aiPrimaryHex, palette.primary[0]);

  for (let i = 1; i < palette.primary.length; i++) {
    const dist = colorDistance(aiPrimaryHex, palette.primary[i]);
    if (dist < closestDist) {
      closestDist = dist;
      closestHex = palette.primary[i];
    }
  }

  if (closestDist > threshold) {
    return {
      hex: closestHex,
      replaced: true,
      reason: `AI 색상 ${aiPrimaryHex}이(가) 카테고리 검증 색상과 거리 ${Math.round(closestDist)} > ${threshold}. ${closestHex}로 교체.`,
    };
  }

  return { hex: aiPrimaryHex, replaced: false };
}

/**
 * Claude 프롬프트에 주입할 카테고리별 디자인 브리프 텍스트
 */
export function buildCategoryDesignBrief(category: CategoryKey | ''): string | null {
  const patterns = getCategoryPatterns(category);
  if (!patterns) return null;

  const mapped = category ? CATEGORY_MAP[category] : null;
  const categoryLabel = mapped ?? category;

  const lines: string[] = [
    `[카테고리별 디자인 패턴 — 실제 한국 상세페이지 ${data.analyzedCount}개 분석 기반]`,
    `카테고리: ${categoryLabel} (${patterns.sampleCount}개 실제 페이지 분석)`,
    `권장 섹션 수: ${patterns.avgSectionCount}개`,
    `권장 섹션 순서: ${patterns.commonSectionOrder.join(' → ')}`,
    `주요 레이아웃: ${patterns.dominantLayouts.join(', ')}`,
    `배경색 패턴: ${patterns.backgroundAlternation}`,
  ];

  if (patterns.specialElements.length > 0) {
    lines.push(`필수 특수 요소:`);
    for (const el of patterns.specialElements.slice(0, 5)) {
      lines.push(`  - ${el}`);
    }
  }

  if (patterns.colorPalettes) {
    const cp = patterns.colorPalettes;
    lines.push(`색상 경향: primary(${cp.primary.slice(0, 2).join(', ')}), accent(${cp.accent.slice(0, 2).join(', ')})`);
  }

  return lines.join('\n');
}

/**
 * DALL-E 이미지 생성용 카테고리별 스타일 키워드
 */
export function getCategoryStyleModifiers(category: CategoryKey | ''): string {
  const STYLE_MAP: Record<string, string> = {
    food: 'natural lighting, artisanal food photography, warm tones, appetite appeal, close-up texture',
    cosmetics: 'clean beauty aesthetic, botanical elements, soft diffused light, minimal composition, dewy texture',
    health: 'clean clinical aesthetic, natural ingredients, soft light, trustworthy medical feel',
    electronics: 'sleek product shot, clean studio lighting, modern minimalist, tech aesthetic',
    interior: 'dramatic ambient lighting, craftsmanship details, wood and natural textures, architectural photography',
    living: 'lifestyle photography, warm home setting, soft natural light, everyday comfort',
    automotive: 'industrial strength, dramatic lighting, precision engineering, bold contrast',
    stationery: 'handcraft aesthetic, natural materials, traditional Korean beauty, artisan close-up',
    beverages: 'craft beverage photography, traditional Korean aesthetic, warm ambient light, premium packaging',
    pets: 'warm lifestyle photography, pet-friendly setting, soft natural tones',
    kids: 'playful colorful setting, safe and warm atmosphere, bright photography',
    sports: 'dynamic action shot, energetic lighting, bold contrast, athletic aesthetic',
    digital: 'modern tech aesthetic, clean UI mockup, gradient backgrounds',
    fashion: 'editorial fashion photography, clean composition, trend-aware styling',
    others: 'clean product photography, neutral background, professional studio lighting',
  };

  if (!category) return STYLE_MAP.others;
  return STYLE_MAP[category] ?? STYLE_MAP.others;
}

/**
 * GPT-4o-mini 스마트 쿼리용 카테고리 컨텍스트
 */
export function getCategoryImageContext(category: CategoryKey | ''): string {
  const patterns = getCategoryPatterns(category);
  if (!patterns) return '';

  return `이 제품은 ${category} 카테고리입니다. 실제 한국 상세페이지 분석 결과, 이 카테고리에서는 ${patterns.dominantLayouts.join(', ')} 레이아웃이 주로 사용됩니다.`;
}

/**
 * 전체 글로벌 패턴 반환
 */
export function getGlobalPatterns(): GlobalPatterns {
  return data.globalPatterns;
}

/**
 * 섹션 타입별 패턴 반환
 */
export function getSectionTypePattern(sectionType: string): SectionTypePattern | null {
  return data.sectionTypePatterns[sectionType] ?? null;
}
