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

// ===== 섹션 높이 =====
const SECTION_HEIGHTS: Record<string, number> = {
  hooking: 800, hero: 800,
  problem: 640, solution: 600,
  features: 700, detail: 620,
  howto: 640, social_proof: 720,
  trust: 560, specs: 560,
  guarantee: 540, event_banner: 440,
  cta: 640,
};

// ===== 카테고리별 스타일 앵커 =====
// 실제 deploy/input/의 상세페이지 무드를 반영
const CATEGORY_STYLE: Record<string, { palette: string; mood: string; reference: string; props: string }> = {
  food: {
    palette: 'warm cream, natural earth tones, subtle orange/yellow accents',
    mood: 'appetizing, fresh, artisanal, homemade warmth',
    reference: 'Korean premium food brand packaging like 오뚜기, 샘표, CJ The Kitchen',
    props: 'fresh ingredients, wooden cutting boards, natural textures, steam/vapor, rustic ceramics',
  },
  beverages: {
    palette: 'refreshing gradients matching beverage color (citrus→orange, tea→green)',
    mood: 'refreshing, vibrant, energetic, natural',
    reference: 'Korean beverage ads like 다인음료, 오설록, 광동제약',
    props: 'condensation droplets, ice cubes, fresh fruit, natural leaves',
  },
  cosmetics: {
    palette: 'soft pastels, cream, sage green, powder pink, gold accents',
    mood: 'premium, clean, scientific yet sensorial',
    reference: 'Amorepacific / Sulwhasoo / Innisfree / Laneige flagship product pages',
    props: 'glass ampoules, dropper pipettes, texture swatches, botanical ingredients, water droplets on skin',
  },
  beauty: {
    palette: 'soft pastels, cream, sage green, powder pink, gold accents',
    mood: 'premium, clean, scientific yet sensorial',
    reference: 'Amorepacific / Sulwhasoo / Innisfree / Laneige flagship product pages',
    props: 'glass ampoules, dropper pipettes, texture swatches, botanical ingredients, water droplets on skin',
  },
  health: {
    palette: 'clean whites, medical blue, soft green, scientific feel',
    mood: 'trustworthy, scientific, clinical yet approachable',
    reference: 'Korean supplement brands like 종근당, 유한양행, 한미약품 premium lines',
    props: 'capsules, lab equipment subtle, clean surfaces, natural ingredient sources',
  },
  electronics: {
    palette: 'deep navy, charcoal, silver, accent tech-blue',
    mood: 'sleek, precise, modern, premium tech',
    reference: 'Samsung / LG flagship product detail pages',
    props: 'soft studio lighting, geometric shadows, gradient backgrounds, product-first composition',
  },
  interior: {
    palette: 'wood tones, warm neutrals, matte black, terracotta',
    mood: 'sophisticated, lived-in, warm luxury',
    reference: 'Korean interior brands like 한샘, 리바트, 일룸, 까사미아',
    props: 'natural wood grain, soft fabric textures, ambient evening light, domestic scenes',
  },
  living: {
    palette: 'clean neutrals, soft warm tones',
    mood: 'practical, clean, everyday elegance',
    reference: 'Korean living brands like 한샘, 오늘의집 featured products',
    props: 'organized home scenes, natural light, clean lines',
  },
  pets: {
    palette: 'soft cream, warm pastels, natural wood',
    mood: 'gentle, loving, playful yet premium',
    reference: 'Korean pet brands like 하림펫푸드, 포켄스',
    props: 'soft textures, cute pet props, natural materials',
  },
  kids: {
    palette: 'soft primary colors, pastel pink/blue, cream',
    mood: 'playful, safe, wholesome',
    reference: 'Korean kids brands like 브랜드가 아가방, 퍼스트비',
    props: 'soft toys, wooden blocks, natural fabrics',
  },
  sports: {
    palette: 'energetic colors, deep black with neon accents',
    mood: 'dynamic, powerful, performance-driven',
    reference: 'Korean sports brands like Kolon Sport, 블랙야크',
    props: 'dynamic composition, texture contrast, performance imagery',
  },
  fashion: {
    palette: 'depends on brand - editorial neutral or statement',
    mood: 'editorial, stylized, aspirational',
    reference: 'Korean fashion brands like 젠틀몬스터, 안다르',
    props: 'fabric drape, studio lighting, minimal styling',
  },
  automotive: {
    palette: 'dark dramatic or clean tech',
    mood: 'powerful, engineered, precise',
    reference: 'Korean auto parts / accessories premium',
    props: 'metallic surfaces, gradient lighting, mechanical precision',
  },
  stationery: {
    palette: 'soft pastels, off-white, muted earth tones',
    mood: 'thoughtful, artisanal, everyday premium',
    reference: 'Korean stationery brands like 모나미, 점보스토어',
    props: 'paper textures, desk arrangements, soft daylight',
  },
  digital: {
    palette: 'gradient tech colors, soft glow',
    mood: 'modern, seamless, intuitive',
    reference: 'Korean SaaS / app product pages',
    props: 'UI mockups abstracted, gradient glow, clean geometry',
  },
  others: {
    palette: 'neutral editorial, product color-driven',
    mood: 'premium Korean e-commerce',
    reference: '네이버 스마트스토어 premium 상세페이지',
    props: 'clean studio lighting, natural props, product-centric',
  },
};

function getCategoryStyle(category?: string) {
  return CATEGORY_STYLE[category || 'others'] || CATEGORY_STYLE.others;
}

// ===== 공통 스타일 앵커 =====
const STYLE_ANCHOR = (cat: ReturnType<typeof getCategoryStyle>) => `
=== STYLE REQUIREMENTS ===
- Photorealistic, shot on Canon 5D Mark IV / Sony A7R IV
- Color palette: ${cat.palette}
- Mood: ${cat.mood}
- Style reference: ${cat.reference}
- Props/setting: ${cat.props}
- Natural lighting, real textures (NOT airbrushed or AI-smoothed)
- Human models (if shown) have NATURAL skin texture with visible pores
- NEVER: cartoon, illustration, vector art, clip-art, 3D render, AI-slop aesthetic, generic stock photo
- NEVER: plain white empty background (must have context/props/gradient/scene)
`.trim();

// ===== NO TEXT 규칙 (한국어 편집 가능성 유지) =====
const NO_TEXT_RULE = `
=== NO TEXT RULE ===
- NO readable Korean characters (한글 금지)
- NO readable English words or sentences
- NO numbers that form prices/percentages
- Subtle product labels on bottles are OK if blurred/out-of-focus
- Leave designated text areas visually clean (per composition below) so Korean text can be overlaid later
`.trim();

// ===== 섹션별 구체적 프롬프트 =====
type PromptGenerator = (section: ManuscriptSection, ctx: DesignContext) => string;

const SECTION_PROMPTS: Record<string, PromptGenerator> = {
  hooking: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    return `Create a HERO scene for a Korean product detail page.
Product: ${ctx.productInfo.name || 'premium product'}

SCENE:
A stunning editorial product photograph. The product is the visual hero — center-stage, beautifully lit.
Environment supports but does not distract (soft-focus background with brand-relevant props).
Atmosphere: ${cat.mood}.

COMPOSITION:
- Upper 25%: clean darker/softer area for headline overlay later
- Center 60%: product as focal point, beautifully composed
- Lower 15%: softer area for CTA overlay later
- Use ${ctx.colors.primary} as dominant color accent in the scene (lighting, props, or background)

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  hero: (s, ctx) => SECTION_PROMPTS.hooking(s, ctx),

  problem: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    const isCosmetic = ['cosmetics', 'beauty', 'health'].includes(ctx.productInfo.category || '');
    return `Create a LIFESTYLE PAIN-POINT scene for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
${isCosmetic
  ? `A Korean woman (25-40) in a quiet moment, slightly troubled, examining herself in soft natural light. She's looking at a mirror or her hands or hair — whatever relates to the product problem. Her expression is thoughtful, relatable, not dramatic.`
  : `A relatable everyday Korean household/office scene showing a subtle frustration or inconvenience that this product solves. Natural daylight, no models posing — just authentic lived-in moment.`}

COMPOSITION:
- Muted desaturated tones (#E8E4DE, #D4CFC6 range)
- Upper 20%: clean area for section title overlay
- Lower 25%: softly lit area for 3-4 point text overlays
- Shallow depth of field, slight blur on surroundings

MOOD: Empathetic, "this is me" relatable, slightly melancholic but hopeful.

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  solution: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    return `Create a SOLUTION REVEAL scene for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
The product presented as the answer. Clean, confident, bright. Product photographed gorgeously with supporting ingredient/feature visualization (ingredient closeup, texture swatch, or abstract representation of the benefit).

COMPOSITION:
- Two-zone layout: product image left/center (60%), clean lighter gradient on right (40%) for text overlay
- OR: product centered with soft radial gradient glow (product as hero)
- Brighter, more saturated than the problem scene
- Primary accent: ${ctx.colors.accent}

MOOD: Relief, clarity, confidence. "Here is your answer."

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  features: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    const dark = s.order % 2 === 1;
    return `Create a KEY FEATURES visual backdrop for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
Ingredient/feature showcase. 3 distinct visual zones across the image, each showing a different aspect of the product (e.g., ingredient closeup, texture shot, functional benefit visualization). Real photography, not icons.

COMPOSITION:
- ${dark ? `Darker atmospheric background (${ctx.colors.primary} deep tones)` : 'Bright clean background (cream/off-white)'}
- Upper 15%: clean area for section title overlay
- Middle 70%: three visual zones arranged horizontally (3-column grid feel) — each zone is a real photo/closeup
- Lower 15%: clean area below each zone for feature text overlay
- Soft shadows, depth, premium feel

MOOD: Discovery, quality emphasis, credibility through imagery.

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  detail: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    return `Create a PRODUCT DETAIL closeup scene for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
Macro/closeup product photography. Emphasize texture, craftsmanship, fine details. Think "zoom in on what makes this special" — could be product surface, ingredient texture, material weave, or functional detail.

COMPOSITION:
- Full-bleed macro shot
- One side (left or right) softer/darker for description text overlay
- Dramatic shallow depth of field
- Studio lighting with subtle directional accent

MOOD: Meticulous, premium, expert-made.

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  howto: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    return `Create a HOW-TO-USE visual scene for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
Real Korean hands (or user POV) using the product in 3-4 steps. Clean, bright, instructional.
Could be: applying product to skin, pouring/mixing, assembling, wearing. Steps flow left-to-right or top-to-bottom.

COMPOSITION:
- Clean bright background, light neutral
- 4 visual zones showing sequential usage moments
- Gaps between zones for step number overlays later
- Natural hand/body composition — not stiff or posed

MOOD: Easy, approachable, confident "you can do this."

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  social_proof: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    return `Create a SOCIAL PROOF (reviews) visual scene for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
Warm, trust-building atmosphere. Could show: multiple real people's hands holding the product (diverse Korean people), happy Korean customers in candid moments, or a warm lifestyle scene implying community.
DO NOT: include any text bubbles or speech graphics (text will be overlaid).

COMPOSITION:
- Group/community feel — multiple people or product-in-use moments
- Warm lighting, inviting tones
- Middle 60%: spacious area for review card overlays (3-4 card zones)
- Soft blurred community background

MOOD: Trust, warmth, "many people love this."

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  trust: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    return `Create a TRUST/AUTHORITY visual scene for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
Clean institutional/laboratory/certification atmosphere. Could show: clean modern lab setting with subtle scientific equipment, test-tube close-ups, certified quality imagery, or premium branding studio.

COMPOSITION:
- Bright, clinical, clean aesthetic
- Middle area: 5-6 circular/shield-shaped ZONES (empty — certification logos will be overlaid)
- Lower third: softer area for explanation text
- Gold/silver accents for premium feel

MOOD: Credible, scientifically validated, institutionally approved.

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  specs: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    return `Create a SPECIFICATIONS visual scene for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
Flat-lay or isometric product photography. Product shown from multiple angles or with its packaging/components arranged meticulously on a neutral surface. Think "knolling" photography.

COMPOSITION:
- Clean light gray/cream flat-lay background (#F5F5F5 range)
- Product elements arranged in grid: main product, package, components/accessories
- Right 40%: clean area for specs table overlay
- Soft even lighting, minimal shadows

MOOD: Organized, technical, thorough.

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  guarantee: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    return `Create a GUARANTEE/ASSURANCE visual scene for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
Warm, secure, hand-crafted feeling. Could show: hands carefully handling the product, a gift box beautifully packaged, or warm ambient environment that suggests "we stand behind this."

COMPOSITION:
- Warm cream/gold tones
- Center: strong visual hero (product or packaging closeup)
- Radial vignette softening edges
- Lower center: clean area for guarantee text overlay
- Optional: subtle ribbon/seal aesthetic (NO text on them)

MOOD: Peace of mind, commitment, care.

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  event_banner: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    return `Create a PROMOTIONAL BANNER visual for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
High-energy banner with product front-and-center. Think limited-edition campaign shoot.

COMPOSITION:
- Full-width dynamic composition
- Product or brand moment occupies center, with strong accent color (${ctx.colors.accent}) radiating
- Clean clear area center for promotional text overlay
- Gradient or radial energy
- NO discount numbers, NO percentage signs rendered in image

MOOD: Urgency, excitement, don't-miss-this energy.

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },

  cta: (s, ctx) => {
    const cat = getCategoryStyle(ctx.productInfo.category);
    return `Create a FINAL CTA (buy-now) visual scene for a Korean product detail page.
Product: ${ctx.productInfo.name || 'product'}

SCENE:
Aspirational closing image. Product looking its absolute best, in a setting that suggests "this could be yours." Could be a lifestyle aspirational moment with the product prominent.

COMPOSITION:
- Hero product shot, beautiful lighting
- Upper half: brand/product atmosphere
- Lower center: clean area for final headline + CTA button overlays
- Rich primary color ${ctx.colors.primary} as dominant accent
- Premium final-impression feel

MOOD: Aspirational closure, conviction, "yes, I want this."

${STYLE_ANCHOR(cat)}

${NO_TEXT_RULE}`;
  },
};

export function generateGeminiPrompt(
  section: ManuscriptSection,
  ctx: DesignContext,
): GeminiPromptResult {
  const generator = SECTION_PROMPTS[section.sectionType] || SECTION_PROMPTS.hooking;
  const height = SECTION_HEIGHTS[section.sectionType] || 600;
  const body = generator(section, ctx);

  return {
    prompt: `${body}

=== OUTPUT ===
Dimensions: EXACTLY 860x${height} pixels, full bleed, no margins.
This is a BACKGROUND image — Korean text will be overlaid by the application afterward.
Output must look like a professional Korean e-commerce detail page section (네이버 스마트스토어 premium 수준).`,
    width: 860,
    height,
  };
}
