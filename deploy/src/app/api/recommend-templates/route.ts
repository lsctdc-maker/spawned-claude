/**
 * 템플릿 추천 API
 *
 * 섹션 타입 + 카테고리 + 톤 기반으로
 * 가장 적합한 Figma 템플릿 2-3개를 추천합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTemplatesBySection, FigmaTemplate } from '@/lib/figma-templates';
import { ManuscriptSectionType, ToneKey, ColorPalette } from '@/lib/types';

interface RecommendRequest {
  sectionType: ManuscriptSectionType;
  category: string;
  tone: ToneKey;
  colorPalette?: ColorPalette;
  limit?: number;
}

// ─── 스코어링 함수 ───

// 유사 카테고리 그룹
const CATEGORY_GROUPS: Record<string, string[]> = {
  wellness: ['health', 'cosmetics', 'sports'],
  home: ['living', 'interior', 'electronics'],
  consumable: ['food', 'beverages'],
  personal: ['fashion', 'kids', 'pets'],
};

function categoryScore(template: FigmaTemplate, category: string): number {
  if (template.categoryTags.includes(category)) return 30;
  for (const group of Object.values(CATEGORY_GROUPS)) {
    if (group.includes(category) && template.categoryTags.some(t => group.includes(t))) {
      return 15;
    }
  }
  // 태그가 비어있으면 범용 템플릿 → 부분 점수
  if (template.categoryTags.length === 0) return 10;
  return 5;
}

// 톤 호환성
const TONE_COMPATIBLE: Record<string, string[]> = {
  trust: ['premium', 'minimal', 'cool', 'trust'],
  emotional: ['warm', 'bold', 'emotional'],
  impact: ['bold', 'premium', 'impact'],
};

function toneScore(template: FigmaTemplate, tone: ToneKey): number {
  if (template.toneTags.includes(tone)) return 20;
  const compatible = TONE_COMPATIBLE[tone] || [];
  if (template.toneTags.some(t => compatible.includes(t))) return 10;
  if (template.toneTags.length === 0) return 8; // 범용
  return 0;
}

function colorScore(template: FigmaTemplate, palette?: ColorPalette): number {
  if (!palette) return 15; // 팔레트 없으면 중간 점수

  // 팔레트 평균 밝기 계산
  const avgBrightness = palette.colors.reduce((sum, c) => {
    const hex = c.hex.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return sum + (r * 299 + g * 587 + b * 114) / 1000;
  }, 0) / Math.max(palette.colors.length, 1);

  const isDarkPalette = avgBrightness < 128;

  if (template.colorScheme === 'dark' && isDarkPalette) return 25;
  if (template.colorScheme === 'light' && !isDarkPalette) return 25;
  if (template.colorScheme === 'accent') return 15;

  return 5; // 불일치지만 사용 가능
}

function qualityScore(template: FigmaTemplate): number {
  return (template.qualityScore / 10) * 15;
}

function usageScore(template: FigmaTemplate): number {
  return Math.min(Math.log10(Math.max(template.usageCount, 1)) * 5, 10);
}

function buildMatchReasons(
  template: FigmaTemplate,
  category: string,
  tone: ToneKey,
): string[] {
  const reasons: string[] = [];
  if (template.categoryTags.includes(category)) {
    reasons.push(`카테고리 일치 (${category})`);
  }
  if (template.toneTags.includes(tone)) {
    reasons.push(`톤 일치 (${tone})`);
  }
  if (template.qualityScore >= 8) {
    reasons.push('높은 퀄리티');
  }
  if (template.usageCount >= 10) {
    reasons.push(`인기 템플릿 (${template.usageCount}회 사용)`);
  }
  if (template.styleTags.length > 0) {
    reasons.push(template.styleTags[0]);
  }
  return reasons.length > 0 ? reasons : ['범용 템플릿'];
}

// 다양성 보장: 같은 스타일 중복 방지
function diverseTopN(
  scored: { template: FigmaTemplate; score: number; reasons: string[] }[],
  limit: number,
) {
  const result: typeof scored = [];
  const usedStyles = new Set<string>();

  scored.sort((a, b) => b.score - a.score);

  for (const item of scored) {
    const mainStyle = item.template.styleTags[0] || item.template.variantId;
    if (usedStyles.has(mainStyle) && result.length > 0) continue;

    result.push(item);
    usedStyles.add(mainStyle);

    if (result.length >= limit) break;
  }

  // 다양성으로 부족하면 스코어 순으로 채움
  if (result.length < limit) {
    for (const item of scored) {
      if (!result.includes(item)) {
        result.push(item);
        if (result.length >= limit) break;
      }
    }
  }

  return result;
}

// ─── 핸들러 ───

export async function POST(request: NextRequest) {
  try {
    const body: RecommendRequest = await request.json();
    const { sectionType, category, tone, colorPalette, limit = 3 } = body;

    if (!sectionType) {
      return NextResponse.json({ error: 'sectionType 필수' }, { status: 400 });
    }

    const templates = await getTemplatesBySection(sectionType);

    if (!templates.length) {
      return NextResponse.json({ templates: [] });
    }

    // 스코어링
    const scored = templates.map(t => ({
      template: t,
      score:
        categoryScore(t, category) +
        toneScore(t, tone) +
        colorScore(t, colorPalette) +
        qualityScore(t) +
        usageScore(t),
      reasons: buildMatchReasons(t, category, tone),
    }));

    // 다양성 + 상위 N개
    const recommended = diverseTopN(scored, limit);

    return NextResponse.json({
      templates: recommended.map(({ template: t, score, reasons }) => ({
        id: t.id,
        name: t.name,
        variantId: t.variantId,
        sectionType: t.sectionType,
        bgImageUrl: t.bgImageUrl,
        bgImageHeight: t.bgImageHeight,
        score: Math.round(score),
        matchReasons: reasons,
        styleTags: t.styleTags,
        colorScheme: t.colorScheme,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: `추천 실패: ${e.message}` },
      { status: 500 },
    );
  }
}
