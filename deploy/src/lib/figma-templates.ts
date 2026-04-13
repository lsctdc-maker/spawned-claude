/**
 * Figma 템플릿 조회 + 캐시 라이브러리
 *
 * Supabase figma_templates 테이블에서 템플릿을 가져오고
 * 인메모리 캐시로 빠르게 제공합니다.
 */

import { createClient } from '@supabase/supabase-js';
import { ManuscriptSectionType } from '@/lib/types';

// ─── 타입 정의 ───

export interface ImageSlotDef {
  binding: 'product' | 'bg-image';
  left: number;
  top: number;
  maxWidth: number;
  maxHeight: number;
  zIndex?: number;
}

export interface TextSlotDef {
  binding: 'title' | 'bodyPreview' | 'body' | 'label' | 'cta' | 'custom';
  customText?: string;
  left: number;
  top: number;
  width: number;
  fontSize: number;
  fontWeight: number | string;
  useHeadline: boolean;
  fill?: string;
  textAlign?: string;
  lineHeight?: number;
  letterSpacing?: number;
  name: string;
  opacity?: number;
  shadow?: { color: string; offsetX: number; offsetY: number; blur: number };
  stroke?: string;
  strokeWidth?: number;
}

export interface FigmaTemplate {
  id: string;
  name: string;
  sectionType: ManuscriptSectionType;
  variantId: string;

  // 배경 이미지 (Figma export → Supabase Storage CDN)
  bgImageUrl: string;
  bgImageWidth: number;
  bgImageHeight: number;

  // 슬롯
  textSlots: TextSlotDef[];
  imageSlots: ImageSlotDef[];

  // 분류
  categoryTags: string[];
  toneTags: string[];
  styleTags: string[];
  colorScheme: 'dark' | 'light' | 'accent';

  // 메타
  qualityScore: number;
  usageCount: number;
}

// ─── 캐시 ───

const cache = new Map<string, { data: FigmaTemplate[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ─── DB → TypeScript 매핑 ───

function mapRow(row: any): FigmaTemplate {
  return {
    id: row.id,
    name: row.name,
    sectionType: row.section_type,
    variantId: row.variant_id,
    bgImageUrl: row.bg_image_url,
    bgImageWidth: row.bg_image_width ?? 860,
    bgImageHeight: row.bg_image_height,
    textSlots: row.text_slots ?? [],
    imageSlots: row.image_slots ?? [],
    categoryTags: row.category_tags ?? [],
    toneTags: row.tone_tags ?? [],
    styleTags: row.style_tags ?? [],
    colorScheme: row.color_scheme ?? 'dark',
    qualityScore: row.quality_score ?? 5,
    usageCount: row.usage_count ?? 0,
  };
}

// ─── 조회 함수 ───

/**
 * 섹션 타입에 맞는 Figma 템플릿 목록 조회 (캐시 포함)
 */
export async function getTemplatesBySection(
  sectionType: ManuscriptSectionType,
): Promise<FigmaTemplate[]> {
  const cached = cache.get(sectionType);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    const { data } = await getSupabase()
      .from('figma_templates')
      .select('*')
      .eq('section_type', sectionType)
      .eq('is_active', true)
      .order('quality_score', { ascending: false });

    const templates = (data ?? []).map(mapRow);
    cache.set(sectionType, { data: templates, ts: Date.now() });
    return templates;
  } catch {
    // DB 연결 실패 → 캐시 반환 or 빈 배열
    return cached?.data ?? [];
  }
}

/**
 * 섹션에 가장 적합한 Figma 템플릿 1개 반환 (없으면 null)
 */
export async function getFigmaTemplate(
  sectionType: ManuscriptSectionType,
  category?: string,
): Promise<FigmaTemplate | null> {
  const templates = await getTemplatesBySection(sectionType);
  if (!templates.length) return null;

  // 카테고리 매칭 우선
  if (category) {
    const matched = templates.find(t => t.categoryTags.includes(category));
    if (matched) return matched;
  }

  // quality_score 최고점 (이미 정렬됨)
  return templates[0];
}

/**
 * ID로 Figma 템플릿 조회
 */
export async function getFigmaTemplateById(
  id: string,
): Promise<FigmaTemplate | null> {
  try {
    const { data } = await getSupabase()
      .from('figma_templates')
      .select('*')
      .eq('id', id)
      .single();
    return data ? mapRow(data) : null;
  } catch {
    return null;
  }
}

/**
 * 템플릿 사용 횟수 증가
 */
export async function trackUsage(templateId: string): Promise<void> {
  try {
    const supabase = getSupabase();
    // RPC가 없으므로 read → increment → update
    const { data } = await supabase
      .from('figma_templates')
      .select('usage_count')
      .eq('id', templateId)
      .single();
    if (data) {
      await supabase
        .from('figma_templates')
        .update({ usage_count: (data.usage_count ?? 0) + 1 })
        .eq('id', templateId);
    }
  } catch {
    // 트래킹 실패는 무시 (non-critical)
  }
}

/**
 * 캐시 무효화 (동기화 후 호출)
 */
export function invalidateCache(): void {
  cache.clear();
}
