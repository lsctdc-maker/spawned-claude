/**
 * figma-template-generator.ts
 *
 * 분석 데이터 → Figma 템플릿 스펙 변환
 *
 * design-knowledge.json 또는 Supabase template_analysis 데이터를
 * Figma MCP가 이해할 수 있는 프레임 스펙으로 변환합니다.
 *
 * Figma MCP 도구:
 *   - create_frame: 프레임 생성
 *   - create_text: 텍스트 노드 생성
 *   - create_rectangle: 사각형 (배경/이미지 플레이스홀더) 생성
 *   - set_fill_color: 배경색 설정
 */

// ── 타입 정의 ──

export interface SectionAnalysisInput {
  sectionType: string;
  layoutPattern: string;
  bgColor: string;
  hasProductImage: boolean;
  textAlign: 'left' | 'center' | 'right';
  textSlots?: Array<{
    role: string;
    x: number;
    y: number;
    w: number;
    h: number;
    estimatedText?: string;
    estimatedFontSize?: number;
  }>;
  imageSlots?: Array<{
    role: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
}

export interface FigmaFrameSpec {
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  children: FigmaNodeSpec[];
  description: string; // JSON metadata
}

export interface FigmaNodeSpec {
  type: 'TEXT' | 'RECTANGLE' | 'FRAME';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // TEXT properties
  characters?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT';
  fillColor?: string;
  // RECTANGLE properties (image placeholder)
  cornerRadius?: number;
  opacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface TemplateGenerationResult {
  fileName: string;
  clientName: string;
  category: string;
  frames: FigmaFrameSpec[];
}

// ── 상수 ──

const FRAME_WIDTH = 860;
const DEFAULT_SECTION_HEIGHT = 600;

const SECTION_HEIGHTS: Record<string, number> = {
  hero: 520,
  features: 480,
  detail: 500,
  social_proof: 440,
  process: 520,
  specs: 400,
  cta: 300,
  product_lineup: 500,
  comparison: 400,
  brand_story: 450,
  howto: 400,
  guarantee: 350,
  problem: 400,
  solution: 450,
  product_intro: 450,
};

// 레이아웃별 기본 슬롯 위치 (% 기준)
const LAYOUT_SLOT_DEFAULTS: Record<string, { textSlots: any[]; imageSlots: any[] }> = {
  'center-brand-product': {
    textSlots: [
      { role: 'title', x: 10, y: 10, w: 80, h: 15, fontSize: 36, align: 'CENTER' },
      { role: 'subtitle', x: 15, y: 28, w: 70, h: 10, fontSize: 18, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'product', x: 25, y: 40, w: 50, h: 55 },
    ],
  },
  'left-text-right-image': {
    textSlots: [
      { role: 'title', x: 5, y: 15, w: 45, h: 15, fontSize: 28, align: 'LEFT' },
      { role: 'body', x: 5, y: 35, w: 45, h: 40, fontSize: 16, align: 'LEFT' },
    ],
    imageSlots: [
      { role: 'product', x: 55, y: 10, w: 40, h: 80 },
    ],
  },
  'icon-grid-3col': {
    textSlots: [
      { role: 'title', x: 10, y: 5, w: 80, h: 15, fontSize: 28, align: 'CENTER' },
      { role: 'label', x: 5, y: 55, w: 28, h: 10, fontSize: 14, align: 'CENTER' },
      { role: 'label', x: 36, y: 55, w: 28, h: 10, fontSize: 14, align: 'CENTER' },
      { role: 'label', x: 67, y: 55, w: 28, h: 10, fontSize: 14, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'icon', x: 10, y: 25, w: 18, h: 25 },
      { role: 'icon', x: 41, y: 25, w: 18, h: 25 },
      { role: 'icon', x: 72, y: 25, w: 18, h: 25 },
    ],
  },
  'icon-grid-4col': {
    textSlots: [
      { role: 'title', x: 10, y: 5, w: 80, h: 15, fontSize: 28, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'icon', x: 5, y: 30, w: 18, h: 25 },
      { role: 'icon', x: 28, y: 30, w: 18, h: 25 },
      { role: 'icon', x: 51, y: 30, w: 18, h: 25 },
      { role: 'icon', x: 74, y: 30, w: 18, h: 25 },
    ],
  },
  'center-text-list': {
    textSlots: [
      { role: 'title', x: 10, y: 10, w: 80, h: 15, fontSize: 28, align: 'CENTER' },
      { role: 'body', x: 10, y: 30, w: 80, h: 50, fontSize: 16, align: 'CENTER' },
    ],
    imageSlots: [],
  },
  'numbered-points': {
    textSlots: [
      { role: 'title', x: 15, y: 5, w: 70, h: 15, fontSize: 28, align: 'CENTER' },
      { role: 'body', x: 15, y: 30, w: 70, h: 55, fontSize: 16, align: 'LEFT' },
    ],
    imageSlots: [
      { role: 'product', x: 20, y: 40, w: 60, h: 50 },
    ],
  },
  'full-width-image': {
    textSlots: [
      { role: 'title', x: 10, y: 10, w: 80, h: 15, fontSize: 32, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'bg-image', x: 0, y: 0, w: 100, h: 100 },
    ],
  },
  'review-cards': {
    textSlots: [
      { role: 'title', x: 10, y: 5, w: 80, h: 12, fontSize: 24, align: 'CENTER' },
      { role: 'body', x: 10, y: 25, w: 80, h: 65, fontSize: 14, align: 'CENTER' },
    ],
    imageSlots: [],
  },
  'certification-grid': {
    textSlots: [
      { role: 'title', x: 10, y: 5, w: 80, h: 12, fontSize: 24, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'icon', x: 10, y: 30, w: 20, h: 30 },
      { role: 'icon', x: 35, y: 30, w: 20, h: 30 },
      { role: 'icon', x: 60, y: 30, w: 20, h: 30 },
    ],
  },
  'data-proof': {
    textSlots: [
      { role: 'title', x: 10, y: 10, w: 80, h: 20, fontSize: 48, align: 'CENTER' },
      { role: 'body', x: 15, y: 40, w: 70, h: 40, fontSize: 16, align: 'CENTER' },
    ],
    imageSlots: [],
  },
  'dramatic-gradient': {
    textSlots: [
      { role: 'title', x: 10, y: 15, w: 80, h: 20, fontSize: 36, align: 'CENTER' },
      { role: 'subtitle', x: 15, y: 40, w: 70, h: 10, fontSize: 18, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'product', x: 20, y: 50, w: 60, h: 45 },
    ],
  },
  'model-with-product': {
    textSlots: [
      { role: 'title', x: 5, y: 10, w: 50, h: 20, fontSize: 32, align: 'LEFT' },
      { role: 'body', x: 5, y: 35, w: 50, h: 20, fontSize: 16, align: 'LEFT' },
    ],
    imageSlots: [
      { role: 'product', x: 55, y: 5, w: 40, h: 90 },
    ],
  },
  'side-by-side': {
    textSlots: [
      { role: 'title', x: 10, y: 5, w: 80, h: 12, fontSize: 24, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'product', x: 5, y: 25, w: 42, h: 65 },
      { role: 'product', x: 53, y: 25, w: 42, h: 65 },
    ],
  },
  'before-after': {
    textSlots: [
      { role: 'title', x: 10, y: 5, w: 80, h: 12, fontSize: 24, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'product', x: 5, y: 25, w: 42, h: 65 },
      { role: 'product', x: 53, y: 25, w: 42, h: 65 },
    ],
  },
  'grid-lineup': {
    textSlots: [
      { role: 'title', x: 10, y: 5, w: 80, h: 12, fontSize: 24, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'product', x: 5, y: 25, w: 28, h: 35 },
      { role: 'product', x: 36, y: 25, w: 28, h: 35 },
      { role: 'product', x: 67, y: 25, w: 28, h: 35 },
    ],
  },
  'left-aligned-table': {
    textSlots: [
      { role: 'title', x: 5, y: 5, w: 90, h: 10, fontSize: 20, align: 'LEFT' },
      { role: 'body', x: 5, y: 20, w: 90, h: 70, fontSize: 14, align: 'LEFT' },
    ],
    imageSlots: [],
  },
  'step-icons': {
    textSlots: [
      { role: 'title', x: 10, y: 5, w: 80, h: 12, fontSize: 24, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'icon', x: 5, y: 30, w: 28, h: 30 },
      { role: 'icon', x: 36, y: 30, w: 28, h: 30 },
      { role: 'icon', x: 67, y: 30, w: 28, h: 30 },
    ],
  },
  'center-button': {
    textSlots: [
      { role: 'title', x: 15, y: 15, w: 70, h: 25, fontSize: 28, align: 'CENTER' },
      { role: 'cta', x: 25, y: 55, w: 50, h: 15, fontSize: 18, align: 'CENTER' },
    ],
    imageSlots: [],
  },
  'brand-footer': {
    textSlots: [
      { role: 'title', x: 20, y: 20, w: 60, h: 20, fontSize: 20, align: 'CENTER' },
    ],
    imageSlots: [
      { role: 'icon', x: 35, y: 50, w: 30, h: 30 },
    ],
  },
};

// ── 색상 유틸리티 ──

function parseColor(bgColor: string): string {
  // "gradient", "kraft", "marble" 등 특수 접미사 제거
  const cleaned = bgColor.replace(/-gradient|-wood|-kraft|-marble|-lifestyle/g, '');
  // "/" 로 구분된 경우 첫번째 색상 사용
  const first = cleaned.split('/')[0].trim();
  // 유효한 hex인지 확인
  if (/^#[0-9A-Fa-f]{6}$/.test(first)) return first;
  return '#FFFFFF';
}

function isDarkBackground(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
}

function getTextColor(bgColor: string): string {
  return isDarkBackground(parseColor(bgColor)) ? '#FFFFFF' : '#212121';
}

// ── 메인 변환 함수 ──

export function analysisToFigmaSpecs(
  analysis: {
    fileName: string;
    clientName: string;
    category: string;
    sections: SectionAnalysisInput[];
    colorPalette?: { primary: string; secondary: string; accent: string };
  }
): TemplateGenerationResult {
  const frames: FigmaFrameSpec[] = [];

  for (const section of analysis.sections) {
    const height = SECTION_HEIGHTS[section.sectionType] || DEFAULT_SECTION_HEIGHT;
    const layoutDefaults = LAYOUT_SLOT_DEFAULTS[section.layoutPattern] || LAYOUT_SLOT_DEFAULTS['center-text-list'];
    const bgHex = parseColor(section.bgColor);
    const textColor = getTextColor(section.bgColor);

    // 슬롯 데이터: 분석 데이터가 있으면 사용, 없으면 레이아웃 기본값
    const textSlots = section.textSlots || layoutDefaults.textSlots;
    const imageSlots = section.imageSlots || layoutDefaults.imageSlots;

    const children: FigmaNodeSpec[] = [];

    // 텍스트 슬롯 → Figma TEXT 노드
    for (const slot of textSlots) {
      children.push({
        type: 'TEXT',
        name: `[slot:${slot.role}]`,
        x: Math.round((slot.x / 100) * FRAME_WIDTH),
        y: Math.round((slot.y / 100) * height),
        width: Math.round((slot.w / 100) * FRAME_WIDTH),
        height: Math.round((slot.h / 100) * height),
        characters: slot.estimatedText || `[${slot.role}]`,
        fontSize: slot.estimatedFontSize || slot.fontSize || 16,
        fontWeight: slot.role === 'title' ? 700 : 400,
        textAlignHorizontal: (slot.align || section.textAlign?.toUpperCase() || 'CENTER') as 'LEFT' | 'CENTER' | 'RIGHT',
        fillColor: textColor,
      });
    }

    // 이미지 슬롯 → Figma RECTANGLE 플레이스홀더
    for (const slot of imageSlots) {
      children.push({
        type: 'RECTANGLE',
        name: `[slot:${slot.role}]`,
        x: Math.round((slot.x / 100) * FRAME_WIDTH),
        y: Math.round((slot.y / 100) * height),
        width: Math.round((slot.w / 100) * FRAME_WIDTH),
        height: Math.round((slot.h / 100) * height),
        cornerRadius: 8,
        opacity: 0.15,
        fillColor: isDarkBackground(bgHex) ? '#FFFFFF' : '#000000',
        strokeColor: isDarkBackground(bgHex) ? '#FFFFFF' : '#CCCCCC',
        strokeWidth: 1,
      });
    }

    // 메타데이터 JSON (프레임 description에 저장)
    const metadata = {
      sectionType: section.sectionType,
      layoutPattern: section.layoutPattern,
      category: analysis.category,
      colorScheme: isDarkBackground(bgHex) ? 'dark' : 'light',
      source: analysis.fileName,
    };

    frames.push({
      name: `[${section.sectionType}-${section.layoutPattern}]`,
      width: FRAME_WIDTH,
      height,
      backgroundColor: bgHex,
      children,
      description: JSON.stringify(metadata),
    });
  }

  return {
    fileName: analysis.fileName,
    clientName: analysis.clientName,
    category: analysis.category,
    frames,
  };
}

/**
 * design-knowledge.json의 전체 분석 데이터를 Figma 스펙으로 일괄 변환
 */
export function batchGenerateFigmaSpecs(
  analyses: Array<{
    fileName: string;
    clientName: string;
    category: string;
    sections: any[];
    colorPalette?: { primary: string; secondary: string; accent: string };
  }>
): TemplateGenerationResult[] {
  return analyses.map(a => {
    const sections: SectionAnalysisInput[] = a.sections.map(s => ({
      sectionType: s.type,
      layoutPattern: s.layout,
      bgColor: s.bgColor,
      hasProductImage: s.hasProductImage,
      textAlign: s.textAlign || 'center',
      textSlots: s.textSlots,
      imageSlots: s.imageSlots,
    }));

    return analysisToFigmaSpecs({
      fileName: a.fileName,
      clientName: a.clientName,
      category: a.category,
      sections,
      colorPalette: a.colorPalette,
    });
  });
}
