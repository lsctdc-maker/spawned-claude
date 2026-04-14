import { describe, it, expect } from 'vitest';
import {
  getCategoryPatterns,
  getRecommendedSectionOrder,
  getRecommendedSectionCount,
  getCategoryColorPalette,
  buildCategoryDesignBrief,
  getCategoryStyleModifiers,
  getCategoryImageContext,
  validateColorPalette,
  colorDistance,
  getGlobalPatterns,
  getSectionTypePattern,
} from '@/lib/design-knowledge';
import type { CategoryKey } from '@/lib/types';

const ALL_CATEGORIES: CategoryKey[] = [
  'food', 'cosmetics', 'health', 'electronics', 'fashion',
  'living', 'pets', 'kids', 'sports', 'interior',
  'automotive', 'stationery', 'beverages', 'digital', 'others',
];

// Categories that map to design-knowledge.json data
const MAPPED_CATEGORIES: CategoryKey[] = [
  'food', 'cosmetics', 'health', 'electronics',
  'living', 'interior', 'automotive', 'stationery', 'beverages',
];

// Categories with no mapping (fallback to global)
const UNMAPPED_CATEGORIES: CategoryKey[] = [
  'fashion', 'pets', 'kids', 'sports', 'digital', 'others',
];

describe('getCategoryPatterns', () => {
  it('returns patterns for mapped categories', () => {
    const patterns = getCategoryPatterns('food');
    expect(patterns).not.toBeNull();
    expect(patterns!.sampleCount).toBeGreaterThan(0);
    expect(patterns!.commonSectionOrder.length).toBeGreaterThan(0);
  });

  it('returns null for unmapped categories', () => {
    expect(getCategoryPatterns('fashion')).toBeNull();
    expect(getCategoryPatterns('pets')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getCategoryPatterns('')).toBeNull();
  });
});

describe('getRecommendedSectionOrder', () => {
  it('returns category-specific order for mapped categories', () => {
    const order = getRecommendedSectionOrder('food');
    expect(order[0]).toBe('hero');
    expect(order.length).toBeGreaterThan(3);
  });

  it('returns global order for unmapped categories', () => {
    const order = getRecommendedSectionOrder('fashion');
    const global = getGlobalPatterns().commonSectionOrder;
    expect(order).toEqual(global);
  });
});

describe('getRecommendedSectionCount', () => {
  it('returns category-specific count for food', () => {
    const count = getRecommendedSectionCount('food');
    expect(count).toBe(10);
  });

  it('returns global average for unmapped categories', () => {
    const count = getRecommendedSectionCount('fashion');
    expect(count).toBe(getGlobalPatterns().avgSectionCount);
  });
});

describe('getCategoryColorPalette', () => {
  it('returns color palette with primary/accent arrays', () => {
    const palette = getCategoryColorPalette('cosmetics');
    expect(palette).not.toBeNull();
    expect(palette!.primary.length).toBeGreaterThan(0);
    expect(palette!.accent.length).toBeGreaterThan(0);
  });

  it('returns null for unmapped categories', () => {
    expect(getCategoryColorPalette('digital')).toBeNull();
  });
});

describe('buildCategoryDesignBrief', () => {
  it('returns formatted brief for mapped categories', () => {
    const brief = buildCategoryDesignBrief('food');
    expect(brief).not.toBeNull();
    expect(brief).toContain('카테고리별 디자인 패턴');
    expect(brief).toContain('권장 섹션 수');
    expect(brief).toContain('색상 경향');
  });

  it('returns null for unmapped categories', () => {
    expect(buildCategoryDesignBrief('pets')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(buildCategoryDesignBrief('')).toBeNull();
  });

  it('includes special elements', () => {
    const brief = buildCategoryDesignBrief('food');
    expect(brief).toContain('필수 특수 요소');
  });
});

describe('getCategoryStyleModifiers', () => {
  it('returns style string for all 15 categories', () => {
    for (const cat of ALL_CATEGORIES) {
      const style = getCategoryStyleModifiers(cat);
      expect(style).toBeTruthy();
      expect(style.length).toBeGreaterThan(10);
    }
  });

  it('returns default for empty string', () => {
    const style = getCategoryStyleModifiers('');
    expect(style).toContain('clean product photography');
  });

  it('food includes food-specific terms', () => {
    const style = getCategoryStyleModifiers('food');
    expect(style).toContain('food photography');
  });
});

describe('colorDistance', () => {
  it('returns 0 for identical colors', () => {
    expect(colorDistance('#FF0000', '#FF0000')).toBe(0);
  });

  it('returns max distance for black vs white', () => {
    const dist = colorDistance('#000000', '#FFFFFF');
    expect(dist).toBeCloseTo(Math.sqrt(255 ** 2 * 3), 0);
  });

  it('returns correct distance for known pair', () => {
    // Red (#FF0000) vs Green (#00FF00): sqrt(255^2 + 255^2) ≈ 360.6
    const dist = colorDistance('#FF0000', '#00FF00');
    expect(dist).toBeCloseTo(360.6, 0);
  });
});

describe('validateColorPalette', () => {
  it('keeps AI color when close to category colors', () => {
    // Food primary includes #3B2F2F — test with a close color
    const result = validateColorPalette('#3B2F2F', 'food');
    expect(result.replaced).toBe(false);
    expect(result.hex).toBe('#3B2F2F');
  });

  it('replaces AI color when far from category colors', () => {
    // Bright cyan is far from any food color
    const result = validateColorPalette('#00FFFF', 'food');
    expect(result.replaced).toBe(true);
    expect(result.reason).toContain('교체');
  });

  it('returns unchanged for unmapped categories', () => {
    const result = validateColorPalette('#FF00FF', 'fashion');
    expect(result.replaced).toBe(false);
    expect(result.hex).toBe('#FF00FF');
  });

  it('returns unchanged for empty category', () => {
    const result = validateColorPalette('#123456', '');
    expect(result.replaced).toBe(false);
  });
});

describe('getSectionTypePattern', () => {
  it('returns pattern for hero', () => {
    const pattern = getSectionTypePattern('hero');
    expect(pattern).not.toBeNull();
    expect(pattern!.frequency).toBe(1.0);
    expect(pattern!.layouts.length).toBeGreaterThan(0);
  });

  it('returns null for unknown section type', () => {
    expect(getSectionTypePattern('nonexistent')).toBeNull();
  });
});

describe('getGlobalPatterns', () => {
  it('returns valid global patterns', () => {
    const gp = getGlobalPatterns();
    expect(gp.avgSectionCount).toBeGreaterThan(0);
    expect(gp.commonSectionOrder.length).toBeGreaterThan(0);
    expect(gp.designRules.length).toBeGreaterThan(0);
  });
});
