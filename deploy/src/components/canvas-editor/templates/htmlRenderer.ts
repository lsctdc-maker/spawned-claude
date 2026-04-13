/**
 * Renders HTML design templates to PNG data URLs for use as fabric.js backgrounds.
 * Uses html-to-image for client-side rendering (no server dependency).
 * Includes in-memory cache to avoid re-rendering the same design.
 */

import { getHtmlDesignTemplate, DesignColors } from './htmlDesignTemplates';

/** In-memory cache: key → dataUrl */
const designCache = new Map<string, string>();

/** Render an HTML design template to a PNG data URL */
export async function renderDesignBackground(
  sectionType: string,
  variantId: string,
  colors: DesignColors,
  width: number,
  height: number,
  _category?: string,
): Promise<string | null> {
  // Only runs client-side
  if (typeof window === 'undefined') return null;

  const template = getHtmlDesignTemplate(sectionType, variantId);
  if (!template) return null;

  // Check cache first
  const cacheKey = `${sectionType}-${variantId}-${colors.accent}-${colors.bg}-${width}-${height}`;
  const cached = designCache.get(cacheKey);
  if (cached) return cached;

  // Dynamic import to avoid SSR issues
  const { toPng } = await import('html-to-image');

  // Generate HTML (pass category for category-specific styling)
  const html = template.render(colors, width, height, _category);

  // Create hidden container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.overflow = 'hidden';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    // Render to PNG (cacheBust removed for performance)
    const dataUrl = await toPng(container, {
      width,
      height,
      pixelRatio: 1, // 1x — 860px already sufficient for web
    });
    // Store in cache
    designCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (err) {
    console.error('[htmlRenderer] Failed to render design template:', err);
    return null;
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}
