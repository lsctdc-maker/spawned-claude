import { describe, it, expect } from 'vitest';
import { getTemplate } from '@/components/canvas-editor/templates/sections';

describe('getTemplate', () => {
  it('returns a valid template for hero section', () => {
    const t = getTemplate('hero', 0);
    expect(t.sectionType).toBe('hero');
    expect(t.canvasHeight).toBeGreaterThan(0);
    expect(t.textObjects.length).toBeGreaterThan(0);
  });

  it('cycles through variants based on order', () => {
    const a = getTemplate('detail', 0);
    const b = getTemplate('detail', 1);
    // Different variants for different orders
    expect(a.variantId).not.toBe(b.variantId);
  });

  it('returns template for all section types', () => {
    const types = ['hero', 'hooking', 'problem', 'solution', 'features', 'detail', 'howto', 'social_proof', 'trust', 'specs', 'guarantee', 'event_banner', 'cta'] as const;
    for (const type of types) {
      const t = getTemplate(type, 0);
      expect(t.sectionType).toBe(type);
      expect(t.canvasHeight).toBeGreaterThan(0);
    }
  });

  it('falls back to hero for unknown section type', () => {
    const t = getTemplate('nonexistent' as any, 0);
    expect(t).toBeDefined();
    expect(t.canvasHeight).toBeGreaterThan(0);
  });

  it('has required fields on all text objects', () => {
    const t = getTemplate('hero', 0);
    for (const txt of t.textObjects) {
      expect(txt.binding).toBeDefined();
      expect(txt.left).toBeGreaterThanOrEqual(0);
      expect(txt.top).toBeGreaterThanOrEqual(0);
      expect(txt.fontSize).toBeGreaterThan(0);
      expect(txt.name).toBeTruthy();
    }
  });
});
