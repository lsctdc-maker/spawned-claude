// ===== 제품 사진 =====
export interface ProductPhoto {
  id: string;
  dataUrl: string;
  name: string;
}

// ===== 원고 섹션 =====
export type ManuscriptSectionType =
  | 'hooking'
  | 'problem'
  | 'solution'
  | 'features'
  | 'howto'
  | 'social_proof'
  | 'specs'
  | 'guarantee'
  | 'event_banner'
  | 'cta'
  | 'hero'    // legacy alias for hooking
  | 'detail'  // legacy alias for features/solution
  | 'trust';  // legacy alias for social_proof/guarantee

export interface ManuscriptSection {
  id: string;
  sectionType: ManuscriptSectionType;
  title: string;
  body: string;
  imageGuide: string;
  visible: boolean;
  order: number;
}

// ===== 카테고리 =====
export type CategoryKey = 'food' | 'cosmetics' | 'health' | 'electronics' | 'fashion' | 'living' | 'pets' | 'kids' | 'sports' | 'interior' | 'automotive' | 'stationery' | 'beverages' | 'digital' | 'others';

export interface CategoryInfo {
  label: string;
  primary: string;
  secondary: string;
  icon?: string;
}

// ===== 톤앤매너 =====
export type ToneKey = 'trust' | 'emotional' | 'impact';

export interface ToneInfo {
  label: string;
  icon?: string;
  desc: string;
}

// ===== 상품 정보 =====
export interface ProductInfo {
  name: string;
  category: CategoryKey | '';
  price?: string;
  targetAudience: string;
  shortDescription: string;
  keywords?: string[];
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

// ===== 상세페이지 섹션 =====
export type SectionType =
  | 'hero'
  | 'priceBanner'
  | 'usp'
  | 'detail'
  | 'comparison'
  | 'howto'
  | 'certification'
  | 'reviews'
  | 'faq'
  | 'package'
  | 'cta';

export interface DetailPageSection {
  id: string;
  type: SectionType;
  title: string;
  content: SectionContent;
  visible: boolean;
  order: number;
}

// ===== 각 섹션별 컨텐츠 =====
export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundStyle: 'gradient' | 'solid' | 'image';
}

export interface USPContent {
  points: USP[];
}

export interface DetailContent {
  paragraphs: { title: string; text: string; imagePosition: 'left' | 'right' }[];
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

// ===== 가격 정보 =====
export interface PriceInfo {
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  eventText?: string;
}

// ===== 구성품 =====
export interface PackageItem {
  name: string;
  description: string;
  price?: number;
  icon?: string;
}

// ===== 가격 배너 섹션 =====
export interface PriceBannerContent {
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  eventText: string;
  freeShipping: boolean;
}

// ===== 구성품/패키지 섹션 =====
export interface PackageContent {
  items: PackageItem[];
  totalOriginalPrice: number;
  totalSalePrice: number;
  freeShipping: boolean;
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
  | PriceBannerContent
  | PackageContent
  | CTAContent;

// ===== 레이아웃 레퍼런스 =====
export interface ReferenceSection {
  label: string;
  percentage: number;
  tip: string;
}

export interface ReferenceGuide {
  summary: string;
  sections: ReferenceSection[];
}

// ===== 색상/폰트 추천 =====
export interface ColorInfo {
  hex: string;
  label: string;
}

export interface ColorPalette {
  colors: ColorInfo[];  // main 3 colors
  accent: ColorInfo;
  rationale: string;
}

export interface FontRecommendation {
  headline: string;
  body: string;
  mood: string;
}

// ===== 이미지 =====
export type ImageType = 'hero' | 'background' | 'lifestyle' | 'feature';

export interface PageImages {
  hero?: string;
  product?: string;
  lifestyle?: string;
  features?: string;  // JSON string of string[] - feature images per paragraph
  [key: string]: string | undefined;
}

export interface ImageGeneratingState {
  [key: string]: boolean;
}

// ===== 전체 상태 =====
export interface DetailPageState {
  currentStep: number;
  productInfo: ProductInfo;
  productPhotos: ProductPhoto[];
  interviewMessages: InterviewMessage[];
  interviewCompleted: boolean;
  extractedUSPs: USP[];
  selectedTone: ToneKey | '';
  generatedSections: DetailPageSection[];
  manuscriptSections: ManuscriptSection[];
  colorPalette: ColorPalette | null;
  fontRecommendation: FontRecommendation | null;
  layoutRationale: string | null;
  referenceGuide: ReferenceGuide | null;
  isGenerating: boolean;
  error: string | null;
  images: PageImages;
  imageGenerating: ImageGeneratingState;
  priceInfo: PriceInfo | null;
  packageItems: PackageItem[];
}

// ===== 액션 =====
export type DetailPageAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_PRODUCT'; payload: Partial<ProductInfo> }
  | { type: 'SET_PRODUCT_PHOTOS'; payload: ProductPhoto[] }
  | { type: 'ADD_PRODUCT_PHOTO'; payload: ProductPhoto }
  | { type: 'REMOVE_PRODUCT_PHOTO'; payload: string }
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
  | { type: 'SET_MANUSCRIPT'; payload: ManuscriptSection[] }
  | { type: 'UPDATE_MANUSCRIPT_SECTION'; payload: { id: string; data: Partial<ManuscriptSection> } }
  | { type: 'REORDER_MANUSCRIPT'; payload: ManuscriptSection[] }
  | { type: 'TOGGLE_MANUSCRIPT_VISIBILITY'; payload: string }
  | { type: 'ADD_MANUSCRIPT_SECTION'; payload: ManuscriptSection }
  | { type: 'REMOVE_MANUSCRIPT_SECTION'; payload: string }
  | { type: 'SET_COLOR_PALETTE'; payload: ColorPalette | null }
  | { type: 'SET_FONT_RECOMMENDATION'; payload: FontRecommendation | null }
  | { type: 'SET_LAYOUT_RATIONALE'; payload: string | null }
  | { type: 'SET_REFERENCE_GUIDE'; payload: ReferenceGuide | null }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_IMAGE'; payload: { key: string; url: string } }
  | { type: 'SET_IMAGE_GENERATING'; payload: { key: string; generating: boolean } }
  | { type: 'SET_PRICE_INFO'; payload: PriceInfo | null }
  | { type: 'SET_PACKAGE_ITEMS'; payload: PackageItem[] }
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

export interface GenerateManuscriptResponse {
  sections: ManuscriptSection[];
  colorPalette?: ColorPalette | null;
  fontRecommendation?: FontRecommendation | null;
  layoutRationale?: string | null;
  referenceGuide?: ReferenceGuide | null;
  keywords?: string[] | null;
}
