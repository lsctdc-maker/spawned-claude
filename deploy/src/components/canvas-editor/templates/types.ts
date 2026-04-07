import { ManuscriptSectionType } from '@/lib/types';

export interface CanvasColors {
  bg: string;
  bg2: string;
  text: string;
  accent: string;
}

export interface CanvasFonts {
  headline: string;
  body: string;
}

export interface TextObjectDef {
  binding: 'title' | 'bodyPreview' | 'body' | 'label' | 'cta' | 'custom';
  customText?: string;
  left: number;
  top: number;
  width: number;
  fontSize: number;
  fontWeight: number | string;
  useHeadline: boolean;
  fill?: string;       // defaults to '{colors.text}'
  textAlign?: string;  // defaults to 'left'
  lineHeight?: number;
  letterSpacing?: number;
  name: string;        // display name in layer panel
  opacity?: number;
  // Text shadow (fabric.js Shadow)
  shadow?: { color: string; offsetX: number; offsetY: number; blur: number };
  // Text stroke/outline
  stroke?: string;
  strokeWidth?: number;
}

export interface ShapeObjectDef {
  type: 'rect' | 'circle' | 'line' | 'icon' | 'badge' | 'gradient-rect';
  left: number;
  top: number;
  width?: number;
  height?: number;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
  ry?: number;
  opacity?: number;
  selectable?: boolean;
  name: string;
  // icon-specific
  iconName?: string;
  iconSize?: number;
  iconStrokeWidth?: number;
  // badge-specific (circle + text/icon composite)
  badgeText?: string;
  badgeIcon?: string;
  badgeTextColor?: string;
  badgeFontSize?: number;
  // gradient-rect-specific
  gradient?: {
    type: 'linear' | 'radial';
    coords?: { x1: number; y1: number; x2: number; y2: number };
    colorStops: Array<{ offset: number; color: string }>;
  };
}

export interface SectionTemplate {
  sectionType: ManuscriptSectionType;
  variantId: string;            // 'A' | 'B' | 'C' — layout variant identifier
  canvasHeight: number;
  solidBackground?: string;     // e.g. '#FFFFFF' — when set, use solid fill instead of photo bg
  useHtmlDesign?: boolean;      // when true, render HTML/CSS design template as background instead of shapes
  overlayColor: string;         // e.g. 'rgba(0,0,0,0.45)' — only used with photo backgrounds
  hasProductImage: boolean;
  productImagePosition?: { left: number; top: number; maxWidth: number; maxHeight: number };
  textObjects: TextObjectDef[];
  shapes: ShapeObjectDef[];
}
