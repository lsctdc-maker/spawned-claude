import { ManuscriptSection } from '@/lib/types';
import { SectionTemplate, TextObjectDef, ShapeObjectDef, CanvasColors, CanvasFonts } from './types';
import { getTemplate } from './sections';
import { getBodyPreview } from '../utils/textParsers';

function resolveColor(value: string | undefined, colors: CanvasColors): string {
  if (!value) return colors.text;
  return value
    .replace('{colors.bg}', colors.bg)
    .replace('{colors.bg2}', colors.bg2)
    .replace('{colors.text}', colors.text)
    .replace('{colors.accent}', colors.accent);
}

function resolveText(binding: TextObjectDef['binding'], section: ManuscriptSection, customText?: string): string {
  switch (binding) {
    case 'title': return section.title || '제목을 입력하세요';
    case 'body': return section.body || '내용을 입력하세요';
    case 'bodyPreview': return getBodyPreview(section.body) || '내용 미리보기';
    case 'label': return customText || '';
    case 'cta': return customText || '구매하기';
    case 'custom': return customText || '';
    default: return '';
  }
}

export async function composeSectionCanvas(
  canvas: any,
  fabricModule: any,
  section: ManuscriptSection,
  bgImageUrl: string | null,
  colors: CanvasColors,
  fonts: CanvasFonts,
  productPhotoUrl: string | null,
): Promise<void> {
  const template = getTemplate(section.sectionType);

  // Set canvas height
  canvas.setDimensions({ width: 860, height: template.canvasHeight });

  // Clear canvas
  canvas.clear();

  // 1. Set background image if available
  if (bgImageUrl) {
    try {
      const bgImg = await loadImage(fabricModule, bgImageUrl);
      // Scale to cover 860px width
      const scale = Math.max(860 / bgImg.width!, template.canvasHeight / bgImg.height!);
      bgImg.set({
        scaleX: scale,
        scaleY: scale,
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
        name: '배경 이미지',
      });
      canvas.add(bgImg);
    } catch (e) {
      console.warn('Failed to load background image:', e);
      canvas.backgroundColor = colors.bg;
    }
  } else {
    canvas.backgroundColor = colors.bg;
  }

  // 2. Dark overlay for text readability
  if (bgImageUrl && template.overlayColor) {
    const overlay = new fabricModule.Rect({
      left: 0,
      top: 0,
      width: 860,
      height: template.canvasHeight,
      fill: template.overlayColor,
      selectable: false,
      evented: false,
      name: '오버레이',
    });
    canvas.add(overlay);
  }

  // 3. Shape objects (backgrounds for buttons, dividers, etc.)
  for (const shapeDef of template.shapes) {
    const shapeColor = resolveColor(shapeDef.fill, colors);
    let obj: any;

    if (shapeDef.type === 'rect') {
      obj = new fabricModule.Rect({
        left: shapeDef.left,
        top: shapeDef.top,
        width: shapeDef.width || 100,
        height: shapeDef.height || 3,
        fill: shapeColor,
        rx: shapeDef.rx || 0,
        ry: shapeDef.ry || 0,
        stroke: shapeDef.stroke ? resolveColor(shapeDef.stroke, colors) : undefined,
        strokeWidth: shapeDef.strokeWidth || 0,
        opacity: shapeDef.opacity ?? 1,
        selectable: shapeDef.selectable !== false,
        evented: shapeDef.selectable !== false,
        name: shapeDef.name,
      });
    } else if (shapeDef.type === 'circle') {
      obj = new fabricModule.Circle({
        left: shapeDef.left,
        top: shapeDef.top,
        radius: shapeDef.radius || 50,
        fill: shapeColor,
        opacity: shapeDef.opacity ?? 1,
        selectable: shapeDef.selectable !== false,
        evented: shapeDef.selectable !== false,
        name: shapeDef.name,
      });
    }

    if (obj) canvas.add(obj);
  }

  // 4. Text objects
  for (const textDef of template.textObjects) {
    const text = resolveText(textDef.binding, section, textDef.customText);
    const fillColor = resolveColor(textDef.fill, colors);
    const fontFamily = textDef.useHeadline
      ? `${fonts.headline}, Noto Sans KR, sans-serif`
      : `${fonts.body}, Noto Sans KR, sans-serif`;

    const textObj = new fabricModule.IText(text, {
      left: textDef.left,
      top: textDef.top,
      width: textDef.width,
      fontSize: textDef.fontSize,
      fontWeight: textDef.fontWeight,
      fontFamily,
      fill: fillColor,
      textAlign: textDef.textAlign || 'left',
      lineHeight: textDef.lineHeight || 1.4,
      charSpacing: (textDef.letterSpacing || 0) * 10,
      opacity: textDef.opacity ?? 1,
      name: textDef.name,
      splitByGrapheme: true,
    });

    canvas.add(textObj);
  }

  // 5. Product image (누끼) if template supports it
  if (template.hasProductImage && productPhotoUrl && template.productImagePosition) {
    try {
      const pos = template.productImagePosition;
      const prodImg = await loadImage(fabricModule, productPhotoUrl);
      const scale = Math.min(
        pos.maxWidth / prodImg.width!,
        pos.maxHeight / prodImg.height!
      );
      prodImg.set({
        left: pos.left,
        top: pos.top,
        scaleX: scale,
        scaleY: scale,
        name: '제품 이미지',
      });
      canvas.add(prodImg);
    } catch (e) {
      console.warn('Failed to load product photo:', e);
    }
  }

  canvas.renderAll();
}

async function loadImage(fabricModule: any, url: string): Promise<any> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Image load timed out')), 8000)
  );
  const img = await Promise.race([
    fabricModule.Image.fromURL(url, { crossOrigin: 'anonymous' }),
    timeout,
  ]);
  if (!img) throw new Error('Failed to load image');
  return img;
}

export { getTemplate } from './sections';
