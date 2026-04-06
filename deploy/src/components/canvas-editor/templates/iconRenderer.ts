import { ICON_PATHS, IconElement } from './iconPaths';
import { CanvasColors } from './types';

/**
 * Convert a lucide icon's SVG element to a fabric.js Path or Circle object.
 * Lucide icons are stroke-based (viewBox 0 0 24 24).
 */
function elementToFabricObject(
  fabricModule: any,
  el: IconElement,
  color: string,
  strokeWidth: number,
): any {
  if (el.tag === 'path') {
    return new fabricModule.Path(el.attrs.d, {
      fill: 'transparent',
      stroke: color,
      strokeWidth,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    });
  }
  if (el.tag === 'circle') {
    return new fabricModule.Circle({
      left: parseFloat(el.attrs.cx) - parseFloat(el.attrs.r),
      top: parseFloat(el.attrs.cy) - parseFloat(el.attrs.r),
      radius: parseFloat(el.attrs.r),
      fill: 'transparent',
      stroke: color,
      strokeWidth,
    });
  }
  if (el.tag === 'rect') {
    return new fabricModule.Rect({
      left: parseFloat(el.attrs.x || '0'),
      top: parseFloat(el.attrs.y || '0'),
      width: parseFloat(el.attrs.width || '0'),
      height: parseFloat(el.attrs.height || '0'),
      rx: parseFloat(el.attrs.rx || '0'),
      ry: parseFloat(el.attrs.ry || '0'),
      fill: 'transparent',
      stroke: color,
      strokeWidth,
    });
  }
  if (el.tag === 'polyline') {
    const points = el.attrs.points;
    // Convert "x1 y1 x2 y2 ..." to fabric.Polyline format
    const pairs = points.trim().split(/\s+/);
    const fabricPoints: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < pairs.length; i += 2) {
      fabricPoints.push({ x: parseFloat(pairs[i]), y: parseFloat(pairs[i + 1]) });
    }
    return new fabricModule.Polyline(fabricPoints, {
      fill: 'transparent',
      stroke: color,
      strokeWidth,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    });
  }
  return null;
}

/**
 * Create a fabric.js icon object from a lucide icon name.
 * Returns a Path (single element) or Group (multi-element).
 */
export function createIconObject(
  fabricModule: any,
  iconName: string,
  options: {
    left: number;
    top: number;
    size: number;
    color: string;
    strokeWidth?: number;
    opacity?: number;
  },
): any {
  const elements = ICON_PATHS[iconName];
  if (!elements) return null;

  const scale = options.size / 24;
  const sw = (options.strokeWidth ?? 2);

  const objects = elements
    .map(el => elementToFabricObject(fabricModule, el, options.color, sw))
    .filter(Boolean);

  if (objects.length === 0) return null;

  if (objects.length === 1) {
    const obj = objects[0];
    obj.set({
      left: options.left,
      top: options.top,
      scaleX: scale,
      scaleY: scale,
      opacity: options.opacity ?? 1,
      selectable: false,
      evented: false,
    });
    return obj;
  }

  // Multi-element icon → Group
  const group = new fabricModule.Group(objects, {
    left: options.left,
    top: options.top,
    scaleX: scale,
    scaleY: scale,
    opacity: options.opacity ?? 1,
    selectable: false,
    evented: false,
  });
  return group;
}

/**
 * Create a badge: circle background + text or icon inside.
 * Used for numbered badges ("01"), icon badges (shield+check), etc.
 */
export function createBadge(
  fabricModule: any,
  options: {
    left: number;
    top: number;
    radius: number;
    bgColor: string;
    text?: string;
    iconName?: string;
    textColor: string;
    fontSize?: number;
    opacity?: number;
  },
): any {
  const bg = new fabricModule.Circle({
    radius: options.radius,
    fill: options.bgColor,
    originX: 'center',
    originY: 'center',
    left: 0,
    top: 0,
  });

  let content: any = null;

  if (options.text) {
    content = new fabricModule.FabricText(options.text, {
      fontSize: options.fontSize || Math.round(options.radius * 0.9),
      fill: options.textColor,
      fontWeight: 700,
      fontFamily: 'Noto Sans KR, sans-serif',
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0,
    });
  } else if (options.iconName) {
    const iconSize = options.radius * 1.1;
    const iconElements = ICON_PATHS[options.iconName];
    if (iconElements) {
      const iconObjects = iconElements
        .map(el => elementToFabricObject(fabricModule, el, options.textColor, 2))
        .filter(Boolean);
      if (iconObjects.length > 0) {
        const iconScale = iconSize / 24;
        content = iconObjects.length === 1
          ? iconObjects[0]
          : new fabricModule.Group(iconObjects);
        content.set({
          scaleX: iconScale,
          scaleY: iconScale,
          originX: 'center',
          originY: 'center',
          left: 0,
          top: 0,
        });
      }
    }
  }

  const items = content ? [bg, content] : [bg];
  return new fabricModule.Group(items, {
    left: options.left,
    top: options.top,
    opacity: options.opacity ?? 1,
    selectable: false,
    evented: false,
  });
}

/**
 * Create a rectangle with gradient fill.
 * Used for bottom fades, depth strips, accent gradients.
 */
export function createGradientRect(
  fabricModule: any,
  options: {
    left: number;
    top: number;
    width: number;
    height: number;
    gradient: {
      type: 'linear' | 'radial';
      coords?: { x1: number; y1: number; x2: number; y2: number };
      colorStops: Array<{ offset: number; color: string }>;
    };
    rx?: number;
    ry?: number;
    opacity?: number;
  },
): any {
  const rect = new fabricModule.Rect({
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
    rx: options.rx || 0,
    ry: options.ry || 0,
    opacity: options.opacity ?? 1,
    selectable: false,
    evented: false,
  });

  const coords = options.gradient.coords || {
    x1: 0, y1: 0, x2: options.width, y2: 0,
  };

  const gradient = new fabricModule.Gradient({
    type: options.gradient.type,
    coords,
    colorStops: options.gradient.colorStops,
  });

  rect.set('fill', gradient);
  return rect;
}

/**
 * Resolve {colors.*} placeholders in gradient color stops.
 */
export function resolveGradientColors(
  gradient: { type: 'linear' | 'radial'; coords?: any; colorStops: Array<{ offset: number; color: string }> },
  colors: CanvasColors,
): typeof gradient {
  return {
    ...gradient,
    colorStops: gradient.colorStops.map(cs => ({
      ...cs,
      color: cs.color
        .replace('{colors.accent}', colors.accent)
        .replace('{colors.bg}', colors.bg)
        .replace('{colors.bg2}', colors.bg2)
        .replace('{colors.text}', colors.text),
    })),
  };
}
