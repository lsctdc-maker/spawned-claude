/**
 * PSD 파일 파싱 — ag-psd 기반
 * NAS 상세페이지 PSD에서 레이어 그룹(=섹션)을 추출하고
 * 각 섹션의 텍스트/이미지/배경 레이어를 분류합니다.
 */
import { readPsd, Layer, Psd } from 'ag-psd';

// ── 타입 정의 ──

export interface PsdTextLayer {
  name: string;
  text: string;
  bounds: { top: number; left: number; bottom: number; right: number };
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  role: 'title' | 'subtitle' | 'body' | 'caption' | 'cta';
}

export interface PsdImageLayer {
  name: string;
  bounds: { top: number; left: number; bottom: number; right: number };
  isSmartObject: boolean;
  role: 'product' | 'lifestyle' | 'icon' | 'background' | 'decoration';
}

export interface PsdSection {
  name: string;
  index: number;
  yStart: number;
  yEnd: number;
  height: number;
  textLayers: PsdTextLayer[];
  imageLayers: PsdImageLayer[];
  /** 섹션의 합성 이미지 (canvas → PNG Buffer) */
  compositeBuffer: Buffer | null;
}

export interface PsdParseResult {
  fileName: string;
  width: number;
  height: number;
  sections: PsdSection[];
  /** 전체 합성 이미지 */
  compositeBuffer: Buffer | null;
}

// ── 유틸 ──

function classifyTextRole(layer: Layer): PsdTextLayer['role'] {
  const fontSize = layer.text?.style?.fontSize ?? 0;
  const text = (layer.text?.text ?? '').trim();

  // CTA 패턴 감지
  if (/구매|주문|자세히|바로가기|클릭|지금/i.test(text) && text.length < 20) {
    return 'cta';
  }
  if (fontSize >= 28) return 'title';
  if (fontSize >= 18) return 'subtitle';
  if (fontSize < 12) return 'caption';
  return 'body';
}

function classifyImageRole(layer: Layer): PsdImageLayer['role'] {
  const name = (layer.name ?? '').toLowerCase();
  if (/product|제품|누끼|상품/.test(name)) return 'product';
  if (/bg|배경|background/.test(name)) return 'background';
  if (/icon|아이콘/.test(name)) return 'icon';
  if (/life|라이프|사용/.test(name)) return 'lifestyle';
  return 'decoration';
}

function rgbaToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
}

// ── 메인 파싱 ──

export function parsePsd(buffer: Buffer, fileName: string): PsdParseResult {
  const psd: Psd = readPsd(buffer);
  const docWidth = psd.width;
  const docHeight = psd.height;

  // 전체 합성 이미지
  let compositeBuffer: Buffer | null = null;
  if (psd.canvas) {
    compositeBuffer = (psd.canvas as any).toBuffer?.('image/png') ?? null;
  }

  const sections: PsdSection[] = [];

  // 최상위 그룹 = 섹션으로 간주 (한국 상세페이지 PSD의 일반적 구조)
  const topLayers = psd.children ?? [];

  topLayers.forEach((group, index) => {
    // 그룹이 아닌 단일 레이어는 스킵 (배경 레이어 등)
    if (!group.children && !group.text) return;

    const section: PsdSection = {
      name: group.name ?? `section-${index}`,
      index,
      yStart: group.top ?? 0,
      yEnd: group.bottom ?? 0,
      height: (group.bottom ?? 0) - (group.top ?? 0),
      textLayers: [],
      imageLayers: [],
      compositeBuffer: null,
    };

    // 그룹의 합성 이미지
    if (group.canvas) {
      section.compositeBuffer = (group.canvas as any).toBuffer?.('image/png') ?? null;
    }

    // 재귀적으로 하위 레이어 수집
    function collectLayers(layers: Layer[]) {
      for (const layer of layers) {
        if (layer.hidden) continue;

        if (layer.text) {
          const style = layer.text.style;
          const colorRaw = style?.fillColor;
          let color: string | undefined;
          if (colorRaw && 'r' in colorRaw) {
            color = rgbaToHex(colorRaw.r, colorRaw.g, colorRaw.b);
          }

          section.textLayers.push({
            name: layer.name ?? '',
            text: layer.text.text ?? '',
            bounds: {
              top: layer.top ?? 0,
              left: layer.left ?? 0,
              bottom: layer.bottom ?? 0,
              right: layer.right ?? 0,
            },
            fontSize: style?.fontSize,
            fontFamily: style?.font?.name,
            fontWeight: style?.fauxBold ? 700 : 400,
            color,
            role: classifyTextRole(layer),
          });
        } else if (layer.canvas || layer.placedLayer) {
          section.imageLayers.push({
            name: layer.name ?? '',
            bounds: {
              top: layer.top ?? 0,
              left: layer.left ?? 0,
              bottom: layer.bottom ?? 0,
              right: layer.right ?? 0,
            },
            isSmartObject: !!layer.placedLayer,
            role: classifyImageRole(layer),
          });
        }

        if (layer.children) {
          collectLayers(layer.children);
        }
      }
    }

    if (group.children) {
      collectLayers(group.children);
    } else if (group.text) {
      // 단일 텍스트 레이어
      section.textLayers.push({
        name: group.name ?? '',
        text: group.text.text ?? '',
        bounds: {
          top: group.top ?? 0,
          left: group.left ?? 0,
          bottom: group.bottom ?? 0,
          right: group.right ?? 0,
        },
        fontSize: group.text.style?.fontSize,
        role: classifyTextRole(group),
      });
    }

    // 높이가 있는 섹션만 추가
    if (section.height > 50) {
      sections.push(section);
    }
  });

  // Y 좌표 기준 정렬
  sections.sort((a, b) => a.yStart - b.yStart);
  sections.forEach((s, i) => { s.index = i; });

  return {
    fileName,
    width: docWidth,
    height: docHeight,
    sections,
    compositeBuffer,
  };
}
