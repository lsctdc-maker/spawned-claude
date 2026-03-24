// ===== 카테고리 =====
export type CategoryKey = 'food' | 'cosmetics' | 'health' | 'electronics' | 'fashion' | 'living' | 'pets' | 'kids' | 'sports' | 'interior' | 'automotive' | 'stationery' | 'beverages' | 'digital' | 'others';

export interface CategoryInfo {
  label: string;
  primary: string;
  secondary: string;
  icon: string;
}

// ===== 톤앤매너 =====
export type ToneKey = 'trust' | 'emotional' | 'impact';

export interface ToneInfo {
  label: string;
  icon: string;
  desc: string;
}

// ===== 상품 정보 =====
export interface ProductInfo {
  name: string;
  category: CategoryKey | '';
  price: string;
  targetAudience: string;
  shortDescription: string;
  keywords: string[];
  imageUrl?: string;
}

// ===== USP (Unique Selling Point) =====
export interface USP {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

// ===== AI 인터뷰 =====
export interface InterviewQuestion {
  id: string;
  question: string;
  placeholder: string;
  category?: CategoryKey;
}

export interface InterviewMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
}

// ===== 텍스트 스타일 =====
export interface TextStyle {
  fontSize: number;
  color: string;
}

// ===== 상세페이지 섹션 =====
export type SectionType =
  | 'hero'
  | 'usp'
  | 'detail'
  | 'comparison'
  | 'howto'
  | 'certification'
  | 'reviews'
  | 'faq'
  | 'cta';

export interface DetailPageSection {
  id: string;
  type: SectionType;
  title: string;
  content: SectionContent;
  visible: boolean;
  order: number;
  styles?: TextStyle;
}

// ===== 각 섹션별 컨텐츠 =====
export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundStyle: 'gradient' | 'solid' | 'image';
  imageUrl?: string;
}

export interface USPContent {
  points: USP[];
}

export interface DetailContent {
  paragraphs: { title: string; text: string; imagePosition: 'left' | 'right'; imageUrl?: string }[];
}

export interface ComparisonContent {
  headers: string[];
  rows: { label: string; values: string[] }[];
}

export interface HowToContent {
  steps: { step: number; title: string; description: string }[];
}

export interface CertificationContent {
  items: { name: string; description: string; icon: string }[];
}

export interface ReviewContent {
  reviews: { author: string; rating: number; text: string; date: string }[];
}

export interface FAQContent {
  items: { question: string; answer: string }[];
}

export interface CTAContent {
  headline: string;
  subtext: string;
  buttonText: string;
  urgencyText?: string;
}

export type SectionContent =
  | HeroContent
  | USPContent
  | DetailContent
  | ComparisonContent
  | HowToContent
  | CertificationContent
  | ReviewContent
  | FAQContent
  | CTAContent;

// ===== 전체 상태 =====
export interface DetailPageState {
  currentStep: number;
  productInfo: ProductInfo;
  interviewMessages: InterviewMessage[];
  interviewCompleted: boolean;
  extractedUSPs: USP[];
  selectedTone: ToneKey | '';
  generatedSections: DetailPageSection[];
  isGenerating: boolean;
  error: string | null;
}

// ===== 액션 =====
export type DetailPageAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_PRODUCT'; payload: Partial<ProductInfo> }
  | { type: 'ADD_INTERVIEW_MESSAGE'; payload: InterviewMessage }
  | { type: 'SET_INTERVIEW_COMPLETED'; payload: boolean }
  | { type: 'SET_USPS'; payload: USP[] }
  | { type: 'ADD_USP'; payload: USP }
  | { type: 'UPDATE_USP'; payload: { id: string; data: Partial<USP> } }
  | { type: 'REMOVE_USP'; payload: string }
  | { type: 'SET_TONE'; payload: ToneKey }
  | { type: 'SET_SECTIONS'; payload: DetailPageSection[] }
  | { type: 'UPDATE_SECTION'; payload: { id: string; data: Partial<DetailPageSection> } }
  | { type: 'REORDER_SECTIONS'; payload: DetailPageSection[] }
  | { type: 'TOGGLE_SECTION_VISIBILITY'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// ===== API 응답 =====
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GenerateUSPResponse {
  usps: USP[];
}

export interface GenerateSectionsResponse {
  sections: DetailPageSection[];
}

export interface ExportResponse {
  html: string;
  imageUrl?: string;
}
