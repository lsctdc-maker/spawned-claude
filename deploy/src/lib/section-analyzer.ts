/**
 * 섹션 분석기 — Claude Vision API 기반
 * 분리된 섹션 이미지를 분석하여 타입, 레이아웃, 텍스트/이미지 영역을 식별합니다.
 */
import Anthropic from '@anthropic-ai/sdk';

// ── 타입 ──

export interface TextSlotAnalysis {
  role: 'title' | 'subtitle' | 'body' | 'caption' | 'cta' | 'label';
  /** 위치 (섹션 이미지 기준 %, 0-100) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** AI가 읽은 추정 텍스트 */
  estimatedText: string;
  /** 추정 폰트 크기 (px) */
  estimatedFontSize?: number;
}

export interface ImageSlotAnalysis {
  role: 'product' | 'lifestyle' | 'icon' | 'badge' | 'background' | 'diagram';
  x: number;
  y: number;
  w: number;
  h: number;
  description: string;
}

export type SectionType =
  | 'hooking' | 'features' | 'problem' | 'solution'
  | 'social_proof' | 'specs' | 'guarantee' | 'howto'
  | 'cta' | 'event_banner' | 'brand' | 'notice' | 'unknown';

export type LayoutPattern =
  | 'hero-fullwidth' | 'hero-split' | 'text-center'
  | 'text-left-image-right' | 'image-left-text-right'
  | 'icon-grid' | 'card-grid' | 'numbered-list'
  | 'comparison-table' | 'testimonial' | 'diagonal-split'
  | 'fullwidth-image' | 'stacked-vertical' | 'unknown';

export interface SectionAnalysis {
  sectionType: SectionType;
  layoutPattern: LayoutPattern;
  textSlots: TextSlotAnalysis[];
  imageSlots: ImageSlotAnalysis[];
  backgroundColor: string;
  colorScheme: 'dark' | 'light' | 'accent' | 'gradient';
  categoryFit: string[];
  toneFit: string[];
  /** 디자인 특징 태그 */
  styleTags: string[];
  /** AI 신뢰도 (0-1) */
  confidence: number;
}

// ── Claude Vision 분석 ──

const ANALYSIS_PROMPT = `이 이미지는 한국 이커머스 상세페이지의 한 섹션입니다.
다음을 분석하여 JSON으로 반환하세요:

1. sectionType: 다음 중 하나
   "hooking" (히어로/첫인상), "features" (특징/장점), "problem" (문제제기),
   "solution" (해결방안), "social_proof" (후기/인증), "specs" (스펙/성분),
   "guarantee" (보증/인증), "howto" (사용법), "cta" (구매유도),
   "event_banner" (이벤트), "brand" (브랜드), "notice" (안내), "unknown"

2. layoutPattern: 다음 중 하나
   "hero-fullwidth", "hero-split", "text-center",
   "text-left-image-right", "image-left-text-right",
   "icon-grid", "card-grid", "numbered-list",
   "comparison-table", "testimonial", "diagonal-split",
   "fullwidth-image", "stacked-vertical", "unknown"

3. textSlots: 텍스트 영역 배열
   각 항목: { role, x, y, w, h, estimatedText, estimatedFontSize }
   role: "title"|"subtitle"|"body"|"caption"|"cta"|"label"
   좌표는 이미지 기준 % (0-100)

4. imageSlots: 이미지 영역 배열
   각 항목: { role, x, y, w, h, description }
   role: "product"|"lifestyle"|"icon"|"badge"|"background"|"diagram"

5. backgroundColor: 배경 주색상 (hex)

6. colorScheme: "dark"|"light"|"accent"|"gradient"

7. categoryFit: 어울리는 카테고리 배열 (예: ["food","health"])
   가능값: food, health, cosmetics, fashion, electronics, home, pet, baby, sports

8. toneFit: 어울리는 톤 배열
   가능값: premium, trust, friendly, playful, minimal, bold, natural, tech

9. styleTags: 디자인 특징 태그 배열
   예: ["diagonal-bg","product-overlay","icon-grid","gradient","shadow","rounded"]

10. confidence: 분석 신뢰도 (0.0-1.0)

JSON만 반환하세요. 마크다운이나 설명 없이 순수 JSON만.`;

export async function analyzeSection(
  imageBuffer: Buffer,
  options?: { model?: string },
): Promise<SectionAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY 환경변수가 필요합니다');

  const client = new Anthropic({ apiKey });
  const base64 = imageBuffer.toString('base64');

  const response = await client.messages.create({
    model: options?.model ?? 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: base64 },
        },
        { type: 'text', text: ANALYSIS_PROMPT },
      ],
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // JSON 추출 (마크다운 코드블록이 포함될 수 있으므로)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude Vision 응답에서 JSON을 파싱할 수 없습니다: ' + text.slice(0, 200));
  }

  const parsed = JSON.parse(jsonMatch[0]) as SectionAnalysis;

  // 기본값 보정
  if (!parsed.sectionType) parsed.sectionType = 'unknown';
  if (!parsed.layoutPattern) parsed.layoutPattern = 'unknown';
  if (!parsed.textSlots) parsed.textSlots = [];
  if (!parsed.imageSlots) parsed.imageSlots = [];
  if (!parsed.backgroundColor) parsed.backgroundColor = '#ffffff';
  if (!parsed.colorScheme) parsed.colorScheme = 'light';
  if (!parsed.categoryFit) parsed.categoryFit = [];
  if (!parsed.toneFit) parsed.toneFit = [];
  if (!parsed.styleTags) parsed.styleTags = [];
  if (typeof parsed.confidence !== 'number') parsed.confidence = 0.5;

  return parsed;
}

/** 여러 섹션을 배치 분석 (순차, rate limit 방지) */
export async function analyzeSections(
  sectionBuffers: Buffer[],
  options?: { model?: string; delayMs?: number },
): Promise<SectionAnalysis[]> {
  const delay = options?.delayMs ?? 500;
  const results: SectionAnalysis[] = [];

  for (let i = 0; i < sectionBuffers.length; i++) {
    try {
      const analysis = await analyzeSection(sectionBuffers[i], options);
      results.push(analysis);
    } catch (e: any) {
      console.warn(`섹션 ${i} 분석 실패:`, e.message);
      results.push(createFallbackAnalysis());
    }

    // Rate limit 방지
    if (i < sectionBuffers.length - 1 && delay > 0) {
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return results;
}

function createFallbackAnalysis(): SectionAnalysis {
  return {
    sectionType: 'unknown',
    layoutPattern: 'unknown',
    textSlots: [],
    imageSlots: [],
    backgroundColor: '#ffffff',
    colorScheme: 'light',
    categoryFit: [],
    toneFit: [],
    styleTags: [],
    confidence: 0,
  };
}
