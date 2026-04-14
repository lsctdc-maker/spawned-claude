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

type PromptGenerator = (section: ManuscriptSection, ctx: DesignContext) => string;

const SECTION_PROMPTS: Record<string, PromptGenerator> = {
  hooking: (s, ctx) =>
    `Create a hero section for a Korean product landing page.
Product: ${ctx.productInfo.name} (${ctx.productInfo.category})
Layout: Large bold headline centered, urgency badge top-right corner, CTA button bottom-center.
Background: Gradient from ${ctx.colors.primary} to a darker shade, with subtle product imagery.
Headline text: "${s.title}"
${s.body ? `Subheadline: "${s.body.slice(0, 80)}"` : ''}
${ctx.usps.length > 0 ? `Key selling point: ${ctx.usps[0].title}` : ''}
Mood: Premium, trustworthy, action-oriented. Professional Korean marketing style.`,

  hero: (s, ctx) =>
    SECTION_PROMPTS.hooking(s, ctx),

  problem: (s, ctx) =>
    `Create a pain points section for a Korean product landing page.
Product: ${ctx.productInfo.name}
Background: Light gray (#F3F4F6) or soft cream
Layout: Section title at top center, 3-4 pain point cards arranged horizontally below, emotional hook text at bottom.
Title: "${s.title}"
${s.body ? `Pain points from: "${s.body.slice(0, 200)}"` : ''}
Each card: rounded corners, subtle shadow, line-style icon + short Korean text.
Mood: Empathetic, relatable. The viewer should think "that's exactly my problem."`,

  solution: (s, ctx) =>
    `Create a solution section for a Korean product landing page.
Product: ${ctx.productInfo.name}
Layout: Product photo on one side (60%) + text on other side (40%), split layout.
Background: Clean white or soft gradient.
Title: "${s.title}"
${s.body ? `Key message: "${s.body.slice(0, 150)}"` : ''}
${ctx.usps.length > 0 ? `USPs: ${ctx.usps.map(u => u.title).join(', ')}` : ''}
Mood: Relief, confidence, anticipation. Show the product as the answer.`,

  features: (s, ctx) =>
    `Create a features section for a Korean product landing page.
Product: ${ctx.productInfo.name}
Layout: 3-column icon + text grid (most common Korean layout, 17% of all sections).
Background: ${s.order % 2 === 0 ? 'Light (white or #F5F5F5)' : 'Dark (' + ctx.colors.primary + ')'}.
Title: "${s.title}"
${s.body ? `Features to highlight: "${s.body.slice(0, 250)}"` : ''}
Each feature: uniform icon (48-64px), bold title, 1-2 line description.
${ctx.usps.length > 0 ? `Feature highlights: ${ctx.usps.slice(0, 3).map(u => u.title).join(', ')}` : ''}
Mood: Organized, informative, systematic.`,

  detail: (s, ctx) =>
    `Create a product detail section for a Korean landing page.
Product: ${ctx.productInfo.name}
Layout: Product close-up photo + detailed description text.
Background: White or cream.
Title: "${s.title}"
${s.body ? `Details: "${s.body.slice(0, 200)}"` : ''}
Mood: Thorough, professional, meticulous attention to detail.`,

  howto: (s, ctx) =>
    `Create a how-to/usage section for a Korean product landing page.
Product: ${ctx.productInfo.name}
Layout: Step 1/2/3/4 numbered steps with photos for each step.
Background: Light background.
Title: "${s.title}"
${s.body ? `Steps: "${s.body.slice(0, 200)}"` : ''}
Each step: large number + photo + short Korean description.
Mood: Easy, approachable, anyone-can-do-it feeling.`,

  social_proof: (s, ctx) =>
    `Create a social proof/reviews section for a Korean product landing page.
Product: ${ctx.productInfo.name}
Layout: Review cards with quotes, or chat-bubble style reviews (KakaoTalk style, current trend).
Background: Light tone.
Title: "${s.title}"
${s.body ? `Review content: "${s.body.slice(0, 250)}"` : ''}
Include: Star ratings, reviewer names, satisfaction percentages if available.
Mood: Trust, validation, "others love this too."`,

  trust: (s, ctx) =>
    `Create a trust/certification section for a Korean product landing page.
Product: ${ctx.productInfo.name}
Layout: Certification badges and award icons arranged horizontally.
Background: White or light gray.
Title: "${s.title}"
${s.body ? `Certifications: "${s.body.slice(0, 150)}"` : ''}
Include: KC, ISO, or relevant certification marks. Gold accent styling.
Mood: Authority, verified quality.`,

  specs: (s, ctx) =>
    `Create a specifications section for a Korean product landing page.
Product: ${ctx.productInfo.name}
Layout: Left-aligned table format with clean rows.
Background: Light gray (#F5F5F5).
Title: "${s.title}"
${s.body ? `Specs: "${s.body.slice(0, 300)}"` : ''}
Clean table with thin dividers, item name on left, value on right.
Mood: Factual, practical, informative.`,

  guarantee: (s, ctx) =>
    `Create a guarantee section for a Korean product landing page.
Product: ${ctx.productInfo.name}
Layout: Central icon + guarantee text.
Background: Cream or light background.
Title: "${s.title}"
${s.body ? `Guarantee details: "${s.body.slice(0, 150)}"` : ''}
Include: Warranty period, exchange/return policy.
Mood: Reassurance, peace of mind.`,

  event_banner: (s, ctx) =>
    `Create a promotional event banner for a Korean product landing page.
Product: ${ctx.productInfo.name}
Layout: Full-width banner, large bold text centered.
Background: Vibrant color (red/yellow) or gradient.
Title: "${s.title}"
${s.body ? `Offer: "${s.body.slice(0, 100)}"` : ''}
Include: Discount percentage, limited time urgency text.
Mood: Urgency, excitement, "don't miss this."`,

  cta: (s, ctx) =>
    `Create a final CTA (call-to-action) section for a Korean product landing page.
Product: ${ctx.productInfo.name}
Layout: Centered CTA text + large prominent button.
Background: ${ctx.colors.primary} solid or lifestyle photo.
Title: "${s.title}"
${s.body ? `CTA message: "${s.body.slice(0, 100)}"` : ''}
Button text: "지금 구매하기" or similar action text.
Large rounded button with high contrast color.
Mood: Closure, final push, "buy now."`,
};

export function generateGeminiPrompt(
  section: ManuscriptSection,
  ctx: DesignContext,
): GeminiPromptResult {
  const generator = SECTION_PROMPTS[section.sectionType];
  const height = SECTION_HEIGHTS[section.sectionType] || 520;

  if (!generator) {
    return {
      prompt: `Create a professional section image for a Korean product landing page.
Product: ${ctx.productInfo.name}
Title: "${section.title}"
${section.body ? `Content: "${section.body.slice(0, 200)}"` : ''}
Background: Clean, professional. Colors: ${ctx.colors.primary} accent.
Mood: Professional Korean e-commerce style.`,
      width: 860,
      height,
    };
  }

  return {
    prompt: generator(section, ctx),
    width: 860,
    height,
  };
}
