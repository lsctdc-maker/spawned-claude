import { ManuscriptSection, ProductInfo, USP } from '@/lib/types';

export interface DesignContext {
  productInfo: ProductInfo;
  usps: USP[];
  tone: string;
  colors: { primary: string; accent: string; bg: string; text: string };
}

export interface GeminiPromptResult {
  prompt: string;
  width: number;
  height: number;
}

const SECTION_HEIGHTS: Record<string, number> = {
  hooking: 800, hero: 800,
  problem: 600, solution: 520,
  features: 700, detail: 600,
  howto: 600, social_proof: 800,
  trust: 500, specs: 500,
  guarantee: 500, event_banner: 400,
  cta: 600,
};

// Universal anchor prepended to ALL prompts — enforces NO TEXT rule strictly
const NO_TEXT_ANCHOR = `=== ABSOLUTE CRITICAL RULE: NO TEXT OF ANY KIND ===
- ZERO text, words, letters, characters, numbers of ANY language
- NO Korean (한글), NO English, NO Japanese, NO Chinese, NO symbols
- NO logos, NO brand names, NO product labels, NO watermarks
- NO CTA buttons with text (empty buttons/shapes are OK)
- NO signs, menus, banners, captions, or UI elements with writing
- NO typography in the image whatsoever
- If product has visible text/label, blur it or turn product to hide text
- Leave clean empty areas where text will be overlaid by the app later
- This is a BACKGROUND-ONLY image — text is rendered separately
VIOLATION OF THIS RULE = UNUSABLE OUTPUT.

=== STYLE ===
- Photorealistic, Canon 5D Mark IV quality
- Korean models with natural skin texture (if people shown)
- Professional studio lighting
- Amorepacific / Sulwhasoo advertising quality
- NO illustration, cartoon, or vector art
`;

type PromptGenerator = (section: ManuscriptSection, ctx: DesignContext) => string;

const SECTION_PROMPTS: Record<string, PromptGenerator> = {
  hooking: (s, ctx) => `Create a HERO BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'premium product'} (${ctx.productInfo.category || 'lifestyle'})
Scene: Premium product photography with optional Korean model showcasing the product
Background: Gradient from ${ctx.colors.primary} to darker shade, or relevant environmental scene
Composition:
- Upper 30% of image: CLEAN EMPTY AREA (headline will be overlaid here — do not put objects/text here)
- Center 50%: Product and/or model as focal point
- Lower 20%: CLEAN EMPTY AREA (CTA button will be overlaid)
Mood: Premium, aspirational, trust-building
Color palette: Dominant ${ctx.colors.primary}, accent ${ctx.colors.accent}`,

  hero: (s, ctx) => SECTION_PROMPTS.hooking(s, ctx),

  problem: (s, ctx) => `Create a PAIN-POINT BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Background: Light gray/cream tone, subtle and moody
Composition:
- Upper 20%: CLEAN AREA (section title will be overlaid)
- Center: Visual representation of the problem (abstract/environmental, NO text)
  Example: messy bathroom counter, tired-looking person from behind, dull surface, etc.
- 3-4 empty card-shaped areas arranged horizontally (cards will have text overlaid)
Mood: Empathetic, relatable, slightly melancholic
Color: Muted, desaturated tones`,

  solution: (s, ctx) => `Create a SOLUTION BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Scene: The product as the hero, beautifully lit, clean presentation
Composition:
- Left 60%: Product photography, centered, premium staging
- Right 40%: CLEAN EMPTY AREA (description text will be overlaid)
  OR: Soft lifestyle context that does not contain any text
Background: Clean white or soft gradient, product-focused
Mood: Clarity, relief, confidence
Color palette: Mostly white/neutral with ${ctx.colors.accent} accents`,

  features: (s, ctx) => `Create a FEATURES BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Background: ${s.order % 2 === 0 ? 'Light neutral (white, #F5F5F5, or cream)' : `Dark/deep ${ctx.colors.primary}`}
Composition:
- Upper 15%: CLEAN AREA (section title overlay)
- Grid of 3 EMPTY icon placeholder areas arranged horizontally (32%/32%/32% width)
  Each placeholder: circular or rounded-square shape, no text inside
  Below each placeholder: empty space for feature text overlay
Mood: Organized, systematic, trustworthy
Style: Abstract, minimalist background. Icons should be simple geometric shapes WITHOUT text`,

  detail: (s, ctx) => `Create a PRODUCT DETAIL BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Scene: Extreme close-up of product details, texture, craftsmanship
Composition:
- Full-bleed detail photography
- One side has CLEAN EMPTY AREA for description text overlay
Mood: Meticulous, premium, artisanal
Style: Macro photography, soft directional lighting`,

  howto: (s, ctx) => `Create a HOW-TO USAGE BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Composition:
- 4 empty panel areas arranged in 2x2 or 1x4 grid
- Each panel: photograph of a usage step (hands, product action, environment) WITHOUT any step number text
- Step numbers will be overlaid by the app later
Background: Light, clean, bright
Mood: Easy, approachable, clear`,

  social_proof: (s, ctx) => `Create a SOCIAL PROOF BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Composition:
- Upper 15%: CLEAN AREA for section title
- Grid of 3-4 EMPTY speech bubble / card placeholder shapes (rounded rectangles)
  NO text inside the bubbles — they will be filled with review text overlay
- Soft background with subtle lifestyle imagery
Mood: Trust, community, warmth
Color: Light tone, ${ctx.colors.accent} accents`,

  trust: (s, ctx) => `Create a TRUST/CERTIFICATION BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Composition:
- Empty circular/shield-shaped placeholder badges arranged horizontally (5-6 placeholders)
  Placeholders: solid circles or shields WITHOUT any text/logos inside
- Clean white or light gray background
Mood: Authority, credibility
Style: Minimal, official-looking. Gold accents. NO actual certification names visible`,

  specs: (s, ctx) => `Create a SPECIFICATIONS BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Composition:
- Product photograph on one side
- Opposite side: CLEAN EMPTY AREA with faint horizontal divider lines (specs table will be overlaid)
  Divider lines OK, but NO text values in the lines
Background: Light gray (#F5F5F5) or clean white
Mood: Factual, precise, informative`,

  guarantee: (s, ctx) => `Create a GUARANTEE BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Composition:
- Center: Large circular or shield EMPTY shape (icon placeholder — NO text/number inside)
- Surrounding: clean empty space for guarantee description overlay
Background: Cream or warm light tone
Mood: Reassurance, safety, peace of mind
Color: Warm, trustworthy palette`,

  event_banner: (s, ctx) => `Create a PROMOTIONAL BANNER BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Composition:
- Full-width dramatic background
- Clean center area for promotional text overlay
- Optional: subtle product imagery on sides
Background: Vibrant color (red, yellow, or gradient) or energetic scene
Mood: Urgency, excitement, energy
NO discount numbers, NO percentage signs, NO sale text visible`,

  cta: (s, ctx) => `Create a FINAL CTA BACKGROUND scene for a Korean product detail page.
Product context: ${ctx.productInfo.name || 'product'}
Composition:
- Upper 40%: Lifestyle scene or product beauty shot
- Center: CLEAN EMPTY AREA for CTA headline overlay
- Lower center: EMPTY rounded rectangle shape (button placeholder — NO text inside the button)
Background: ${ctx.colors.primary} solid or lifestyle setting
Mood: Aspirational closure, "this could be yours"`,
};

export function generateGeminiPrompt(
  section: ManuscriptSection,
  ctx: DesignContext,
): GeminiPromptResult {
  const generator = SECTION_PROMPTS[section.sectionType];
  const height = SECTION_HEIGHTS[section.sectionType] || 520;

  const body = generator
    ? generator(section, ctx)
    : `Create a generic BACKGROUND scene for a Korean product detail page section.
Product: ${ctx.productInfo.name || 'product'}
Clean, professional background with empty areas for text overlay.
Color: ${ctx.colors.primary} dominant.
Mood: Professional Korean e-commerce aesthetic.`;

  return {
    prompt: `${NO_TEXT_ANCHOR}\n=== SCENE BRIEF ===\n${body}\n\n=== FINAL CHECK ===\nOutput must be a CLEAN BACKGROUND image with ZERO visible text/letters/numbers.
Dimensions: 860x${height}px, full bleed.`,
    width: 860,
    height,
  };
}
