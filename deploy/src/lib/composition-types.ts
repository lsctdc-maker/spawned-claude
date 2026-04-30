export interface CompositionElement {
  id: string;
  type: 'rect' | 'circle' | 'text' | 'image' | 'line' | 'badge';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  opacity?: number;
  cornerRadius?: number;
  rotation?: number;
  // text
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  color?: string;
  // image
  src?: string;
  objectFit?: 'cover' | 'contain';
  // shape
  stroke?: string;
  strokeWidth?: number;
  shadow?: boolean;
  gradient?: { from: string; to: string; direction?: string };
  // interaction
  draggable?: boolean;
  editable?: boolean;
  locked?: boolean;
  name?: string;
}

export interface SectionComposition {
  sectionType: string;
  variantId: string;
  width: number;
  height: number;
  background: string;
  elements: CompositionElement[];
}
