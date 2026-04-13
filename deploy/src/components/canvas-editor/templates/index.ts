import { ManuscriptSection } from '@/lib/types';
import { SectionTemplate, TextObjectDef, ShapeObjectDef, CanvasColors, CanvasFonts } from './types';
import { getTemplate } from './sections';
import { getBodyPreview } from '../utils/textParsers';
import { createIconObject, createBadge, createGradientRect, resolveGradientColors } from './iconRenderer';
import { renderDesignBackground } from './htmlRenderer';
import { getFigmaTemplate, getFigmaTemplateById, FigmaTemplate, TextSlotDef } from '@/lib/figma-templates';

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
  category?: string,
  figmaTemplateId?: string,
): Promise<void> {
  // Figma 템플릿 우선 시도 (환경변수로 비활성화 가능)
  if (process.env.NEXT_PUBLIC_DISABLE_FIGMA_TEMPLATES !== 'true') {
    try {
      const figmaTemplate = figmaTemplateId
        ? await getFigmaTemplateById(figmaTemplateId)
        : await getFigmaTemplate(section.sectionType, category);

      if (figmaTemplate) {
        await applyFigmaTemplate(canvas, fabricModule, figmaTemplate, section, colors, fonts, productPhotoUrl);
        return;
      }
    } catch (e) {
      console.warn('Figma 템플릿 로드 실패, 기존 템플릿 사용:', e);
    }
  }

  // 폴백: 기존 하드코딩 템플릿
  // Use section.order for variant selection to ensure visual diversity
  const template = getTemplate(section.sectionType, section.order, category);

  // Set canvas height
  canvas.setDimensions({ width: 860, height: template.canvasHeight });

  // Clear canvas
  canvas.clear();

  // Learned pattern: real detail pages alternate light/dark backgrounds per section
  // Even-order sections: lighter overlay, Odd-order sections: darker overlay
  const sectionOrder = section.order ?? 0;
  const isEvenSection = sectionOrder % 2 === 0;

  // 1. Background: HTML design template OR solid color OR photo image
  if (template.useHtmlDesign && template.solidBackground) {
    // HTML/CSS design background — rich visual design layer
    canvas.backgroundColor = template.solidBackground;
    try {
      const designUrl = await renderDesignBackground(
        section.sectionType,
        template.variantId,
        { accent: colors.accent, bg: colors.bg, bg2: colors.bg2, text: colors.text },
        860,
        template.canvasHeight,
        category,
      );
      if (designUrl) {
        const designImg = await loadImage(fabricModule, designUrl);
        // Scale to exact canvas size (html-to-image renders at 2x pixelRatio)
        const scale = Math.min(860 / designImg.width!, template.canvasHeight / designImg.height!);
        designImg.set({
          left: 0,
          top: 0,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
          name: '디자인 배경',
        });
        canvas.add(designImg);
      }
    } catch (e) {
      console.warn('Failed to render HTML design, falling back to solid bg:', e);
    }
  } else if (template.solidBackground) {
    // Solid background — clean fill, no photo needed
    canvas.backgroundColor = template.solidBackground;
  } else if (bgImageUrl) {
    try {
      const bgImg = await loadImage(fabricModule, bgImageUrl);
      // Scale to cover canvas (no gaps), then center
      const scale = Math.max(860 / bgImg.width!, template.canvasHeight / bgImg.height!);
      const scaledWidth = bgImg.width! * scale;
      const scaledHeight = bgImg.height! * scale;
      const offsetX = (860 - scaledWidth) / 2;
      const offsetY = (template.canvasHeight - scaledHeight) / 2;
      // Apply subtle blur for professional depth-of-field effect
      if (bgImg.filters) {
        bgImg.filters.push(new fabricModule.filters.Blur({ blur: 0.08 }));
        bgImg.applyFilters();
      }
      bgImg.set({
        scaleX: scale,
        scaleY: scale,
        left: offsetX,
        top: offsetY,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
        name: '배경 이미지',
      });
      canvas.add(bgImg);
    } catch (e) {
      console.warn('Failed to load background image:', e);
      canvas.backgroundColor = isEvenSection ? colors.bg : colors.bg2;
    }
  } else {
    canvas.backgroundColor = isEvenSection ? colors.bg : colors.bg2;
  }

  // 2. Overlay for text readability — only for photo backgrounds
  if (!template.solidBackground && bgImageUrl && template.overlayColor) {
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

  // 3. Shape objects — skip for HTML design sections (design is in the background)
  if (template.useHtmlDesign) {
    // Shapes are handled by the HTML design template — skip
  }
  for (const shapeDef of (template.useHtmlDesign ? [] : template.shapes)) {
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
    } else if (shapeDef.type === 'icon' && shapeDef.iconName) {
      obj = createIconObject(fabricModule, shapeDef.iconName, {
        left: shapeDef.left,
        top: shapeDef.top,
        size: shapeDef.iconSize || 24,
        color: shapeColor,
        strokeWidth: shapeDef.iconStrokeWidth,
        opacity: shapeDef.opacity,
      });
    } else if (shapeDef.type === 'badge') {
      obj = createBadge(fabricModule, {
        left: shapeDef.left,
        top: shapeDef.top,
        radius: shapeDef.radius || 20,
        bgColor: shapeColor,
        text: shapeDef.badgeText,
        iconName: shapeDef.badgeIcon,
        textColor: resolveColor(shapeDef.badgeTextColor, colors),
        fontSize: shapeDef.badgeFontSize,
        opacity: shapeDef.opacity,
      });
    } else if (shapeDef.type === 'gradient-rect' && shapeDef.gradient) {
      obj = createGradientRect(fabricModule, {
        left: shapeDef.left,
        top: shapeDef.top,
        width: shapeDef.width || 860,
        height: shapeDef.height || 60,
        gradient: resolveGradientColors(shapeDef.gradient, colors),
        rx: shapeDef.rx,
        ry: shapeDef.ry,
        opacity: shapeDef.opacity,
      });
    }

    if (obj) canvas.add(obj);
  }

  // 4. Product image (누끼) — rendered BEFORE text so text is always readable
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
        shadow: new fabricModule.Shadow({
          color: 'rgba(0,0,0,0.18)',
          offsetX: 0,
          offsetY: 8,
          blur: 24,
        }),
      });
      canvas.add(prodImg);
    } catch (e) {
      console.warn('Failed to load product photo:', e);
    }
  }

  // 5. Text objects — always on top for readability
  for (const textDef of template.textObjects) {
    const text = resolveText(textDef.binding, section, textDef.customText);
    const fillColor = resolveColor(textDef.fill, colors);
    const fontFamily = textDef.useHeadline
      ? `${fonts.headline}, Noto Sans KR, sans-serif`
      : `${fonts.body}, Noto Sans KR, sans-serif`;

    const textObj = new fabricModule.Textbox(text, {
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
      // Text shadow for depth
      ...(textDef.shadow ? {
        shadow: new fabricModule.Shadow(textDef.shadow),
      } : {}),
      // Text stroke/outline for readability
      ...(textDef.stroke ? {
        stroke: textDef.stroke,
        strokeWidth: textDef.strokeWidth || 0,
        paintFirst: 'stroke',
      } : {}),
    });

    canvas.add(textObj);
  }

  canvas.renderAll();
}

// ─── Figma 템플릿 적용 ───

async function applyFigmaTemplate(
  canvas: any,
  fabricModule: any,
  template: FigmaTemplate,
  section: ManuscriptSection,
  colors: CanvasColors,
  fonts: CanvasFonts,
  productPhotoUrl: string | null,
): Promise<void> {
  canvas.clear();
  canvas.setDimensions({ width: 860, height: template.bgImageHeight });

  // Layer 0: 솔리드 배경 (Figma PNG는 텍스트 포함이므로 미리보기용으로만 사용)
  canvas.backgroundColor = template.colorScheme === 'dark' ? '#181818'
    : template.colorScheme === 'accent' ? colors.accent
    : '#F5F5F5';

  // Layer 1: 이미지 슬롯
  for (const slot of template.imageSlots) {
    if (slot.binding === 'product' && productPhotoUrl) {
      try {
        const prodImg = await loadImage(fabricModule, productPhotoUrl);
        const scale = Math.min(
          slot.maxWidth / prodImg.width!,
          slot.maxHeight / prodImg.height!,
        );
        prodImg.set({
          left: slot.left,
          top: slot.top,
          scaleX: scale,
          scaleY: scale,
          name: '제품 이미지',
          shadow: new fabricModule.Shadow({
            color: 'rgba(0,0,0,0.18)',
            offsetX: 0,
            offsetY: 8,
            blur: 24,
          }),
        });
        canvas.add(prodImg);
      } catch (e) {
        console.warn('제품 이미지 로드 실패:', e);
      }
    }
  }

  // Layer 2: 텍스트 슬롯
  for (const slot of template.textSlots) {
    const text = resolveText(slot.binding as TextObjectDef['binding'], section, slot.customText);
    const fontFamily = slot.useHeadline
      ? `${fonts.headline}, Noto Sans KR, sans-serif`
      : `${fonts.body}, Noto Sans KR, sans-serif`;

    const textObj = new fabricModule.Textbox(text, {
      left: slot.left,
      top: slot.top,
      width: slot.width,
      fontSize: slot.fontSize,
      fontWeight: slot.fontWeight,
      fontFamily,
      fill: slot.fill || colors.text,
      textAlign: slot.textAlign || 'left',
      lineHeight: slot.lineHeight || 1.4,
      charSpacing: (slot.letterSpacing || 0) * 10,
      opacity: slot.opacity ?? 1,
      name: slot.name,
      splitByGrapheme: true,
      ...(slot.shadow ? {
        shadow: new fabricModule.Shadow(slot.shadow),
      } : {}),
      ...(slot.stroke ? {
        stroke: slot.stroke,
        strokeWidth: slot.strokeWidth || 0,
        paintFirst: 'stroke',
      } : {}),
    });

    canvas.add(textObj);
  }

  canvas.renderAll();
}

async function loadImage(fabricModule: any, url: string): Promise<any> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Image load timed out')), 4000)
  );
  const img = await Promise.race([
    fabricModule.Image.fromURL(url, { crossOrigin: 'anonymous' }),
    timeout,
  ]);
  if (!img) throw new Error('Failed to load image');
  return img;
}

export { getTemplate } from './sections';
