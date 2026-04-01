import { describe, it, expect } from 'vitest';
import { hexToRgb, hexToRgba, darken, lighten } from '@/components/canvas-editor/utils/colorUtils';

describe('hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#1a2b3c')).toEqual({ r: 26, g: 43, b: 60 });
  });

  it('parses 3-digit hex shorthand', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
  });

  it('returns null for invalid input', () => {
    expect(hexToRgb('not-a-color')).toBeNull();
    expect(hexToRgb('')).toBeNull();
  });
});

describe('hexToRgba', () => {
  it('converts hex to rgba string', () => {
    expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
  });

  it('returns original value for invalid hex', () => {
    expect(hexToRgba('invalid', 0.5)).toBe('invalid');
  });
});

describe('darken', () => {
  it('darkens white by 50%', () => {
    expect(darken('#ffffff', 0.5)).toBe('#808080');
  });

  it('darkens to black at 100%', () => {
    expect(darken('#ff8800', 1)).toBe('#000000');
  });

  it('returns original hex for invalid input', () => {
    expect(darken('bad', 0.5)).toBe('bad');
  });
});

describe('lighten', () => {
  it('lightens black by 50%', () => {
    expect(lighten('#000000', 0.5)).toBe('#808080');
  });

  it('lightens to white at 100%', () => {
    expect(lighten('#000000', 1)).toBe('#ffffff');
  });

  it('returns original hex for invalid input', () => {
    expect(lighten('bad', 0.5)).toBe('bad');
  });
});
