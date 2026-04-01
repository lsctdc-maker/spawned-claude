import { describe, it, expect } from 'vitest';
import { parseFeatures, parseSteps, parseTrustItems, getBodyPreview } from '@/components/canvas-editor/utils/textParsers';

describe('parseFeatures', () => {
  it('parses bold markdown features', () => {
    const body = '**빠른 건조**: 30초만에 건조\n**자연 성분**: 100% 식물 유래\n**저자극**: 민감한 피부에도 안전';
    const result = parseFeatures(body);
    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('빠른 건조');
    expect(result[0].desc).toBe('30초만에 건조');
  });

  it('parses numbered features', () => {
    const body = '1. 효능: 피부 보습\n2. 성분: 히알루론산\n3. 용량: 50ml';
    const result = parseFeatures(body);
    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('효능');
    expect(result[0].desc).toBe('피부 보습');
  });

  it('falls back to paragraph splitting', () => {
    const body = '첫 번째 특징\n상세 설명\n\n두 번째 특징\n상세 설명';
    const result = parseFeatures(body);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].title).toBe('첫 번째 특징');
  });
});

describe('parseSteps', () => {
  it('parses numbered steps with dot notation', () => {
    const body = '1. 세안을 합니다\n2. 토너를 바릅니다\n3. 에센스를 바릅니다';
    const result = parseSteps(body);
    expect(result).toHaveLength(3);
    expect(result[0].num).toBe(1);
    expect(result[0].title).toBe('세안을 합니다');
  });

  it('falls back to paragraph-based steps', () => {
    const body = '먼저 세안을 합니다\n\n토너를 바릅니다\n\n에센스를 바릅니다';
    const result = parseSteps(body);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].num).toBe(1);
  });
});

describe('parseTrustItems', () => {
  it('parses bullet list items', () => {
    const body = '- ISO 9001 인증\n- HACCP 인증\n- FDA 승인\n- GMP 인증';
    const result = parseTrustItems(body);
    expect(result).toHaveLength(4);
    expect(result[0]).toBe('ISO 9001 인증');
  });

  it('falls back to paragraphs when no bullets', () => {
    const body = '첫 번째 신뢰 요소\n\n두 번째 신뢰 요소';
    const result = parseTrustItems(body);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

describe('getBodyPreview', () => {
  it('returns first 3 non-empty lines joined', () => {
    const body = '첫 줄\n\n둘째 줄\n\n셋째 줄\n\n넷째 줄';
    const result = getBodyPreview(body);
    expect(result).toBe('첫 줄 둘째 줄 셋째 줄');
  });

  it('truncates to maxLen', () => {
    const body = '아주 긴 텍스트를 여러 줄에 걸쳐 작성합니다';
    const result = getBodyPreview(body, 10);
    expect(result.length).toBeLessThanOrEqual(10);
  });
});
