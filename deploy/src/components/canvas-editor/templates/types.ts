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
}

export interface ShapeObjectDef {
  type: 'rect' | 'circle' | 'line';
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
}

export interface SectionTemplate {
  sectionType: ManuscriptSectionType;
  canvasHeight: number;
  overlayColor: string;       // e.g. 'rgba(0,0,0,0.45)'
  hasProductImage: boolean;
  productImagePosition?: { left: number; top: number; maxWidth: number; maxHeight: number };
  textObjects: TextObjectDef[];
  shapes: ShapeObjectDef[];
}
