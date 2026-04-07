/**
 * Data-driven HTML/CSS layout frames for Korean e-commerce detail pages.
 * Based on analysis of 26 real Korean detail pages (design-knowledge.json).
 *
 * Each frame renders STRUCTURAL layout elements (card grids, number badges,
 * step indicators, review cards, certification rows, data cards, tables).
 * Text content and product images are overlaid by fabric.js as editable objects.
 *
 * Frame selection is driven by sectionTypePatterns frequency data:
 *   features → icon-grid-3col (35%), numbered-points (15%), icon-grid-4col (15%)
 *   social_proof → review-cards (45%), certification-grid (30%), data-proof (10%)
 *   howto → numbered-steps (25%), step-icons (15%)
 *   specs → left-aligned-table (50%), center-card (30%)
 *   problem → problem-empathy
 *   detail → split-layout, center-card
 */

export type DesignColors = {
  accent: string;
  bg: string;
  bg2: string;
  text: string;
};

// ===== Utilities =====

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function wrap(w: number, h: number, bg: string, inner: string): string {
  return `<div style="width:${w}px;height:${h}px;background:${bg};position:relative;overflow:hidden;font-family:'Noto Sans KR',sans-serif;">${inner}</div>`;
}

// Inline SVG icons (lucide-style)
const svg = {
  star: (color: string, size = 16) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  check: (color: string, size = 18) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  shield: (color: string, size = 20) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  award: (color: string, size = 20) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>`,
  quote: (color: string, size = 32) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" opacity="0.2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`,
  questionCircle: (color: string, size = 24) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
};

// Number badge with circle background
function numBadge(x: number, y: number, size: number, color: string, num: string, opacity = 1): string {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:${Math.round(size * 0.42)}px;font-weight:800;opacity:${opacity};box-shadow:0 2px 8px ${hexToRgba(color, 0.25)};">${num}</div>`;
}

// Card element
function cardEl(left: number, top: number, w: number, h: number, opts: {
  bg?: string; radius?: number; shadow?: string; borderTop?: string; borderLeft?: string;
} = {}): string {
  const bg = opts.bg ?? '#FFFFFF';
  const r = opts.radius ?? 16;
  const sh = opts.shadow ?? '0 2px 20px rgba(0,0,0,0.06)';
  const bt = opts.borderTop ? `border-top:3px solid ${opts.borderTop};` : '';
  const bl = opts.borderLeft ? `border-left:4px solid ${opts.borderLeft};` : '';
  return `<div style="position:absolute;left:${left}px;top:${top}px;width:${w}px;height:${h}px;background:${bg};border-radius:${r}px;box-shadow:${sh};${bt}${bl}"></div>`;
}

// Horizontal accent line
function hLine(left: number, top: number, w: number, color: string, opacity = 1): string {
  return `<div style="position:absolute;left:${left}px;top:${top}px;width:${w}px;height:3px;background:${color};border-radius:2px;opacity:${opacity};"></div>`;
}

// Vertical accent bar
function vBar(left: number, top: number, h: number, color: string, opacity = 0.4): string {
  return `<div style="position:absolute;left:${left}px;top:${top}px;width:4px;height:${h}px;background:${color};border-radius:2px;opacity:${opacity};"></div>`;
}

// Icon in circle background
function iconBubble(x: number, y: number, size: number, bgColor: string, bgAlpha: number, iconHtml: string): string {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${hexToRgba(bgColor, bgAlpha)};border-radius:50%;display:flex;align-items:center;justify-content:center;">${iconHtml}</div>`;
}

// Stars row
function starsRow(color: string, count = 5): string {
  return new Array(count).fill(0).map(() => svg.star(color, 14)).join('');
}

// ===== TEMPLATE TYPE =====

export type HtmlDesignTemplate = {
  sectionType: string;
  variantId: string;
  render: (c: DesignColors, w: number, h: number, category?: string) => string;
};

// ===== LAYOUT FRAMES =====

export const htmlDesignTemplates: HtmlDesignTemplate[] = [

  // ================================================================
  // PROBLEM A: 공감 카드 (큰 ? 장식 + accent bar 카드)
  // Real pattern: 문제→해결 구조 시작점
  // ================================================================
  {
    sectionType: 'problem',
    variantId: 'A',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      ${vBar(0, 0, h, c.accent, 0.6)}
      <div style="position:absolute;right:60px;top:30px;font-size:120px;font-weight:900;color:${hexToRgba(c.accent, 0.06)};line-height:1;">?</div>
      ${cardEl(60, 160, w - 120, h - 240, { bg: '#FAFAFA', borderLeft: c.accent, shadow: '0 4px 24px rgba(0,0,0,0.05)' })}
      ${hLine(80, h - 60, 120, c.accent, 0.3)}
    `),
  },

  // PROBLEM B: 중앙 카드 + 상단 아이콘
  {
    sectionType: 'problem',
    variantId: 'B',
    render: (c, w, h) => wrap(w, h, '#F8F8F8', `
      ${iconBubble(w / 2 - 28, 25, 56, c.accent, 0.12, svg.questionCircle(c.accent, 28))}
      ${cardEl(80, 100, w - 160, h - 160, { bg: '#FFFFFF', borderTop: c.accent, shadow: '0 6px 32px rgba(0,0,0,0.06)' })}
      <div style="position:absolute;left:80px;top:100px;width:${w - 160}px;height:${h - 160}px;border-radius:16px;background:linear-gradient(180deg,${hexToRgba(c.accent, 0.03)} 0%,transparent 40%);pointer-events:none;"></div>
    `),
  },

  // PROBLEM C: 좌정렬 + 우제품 분할
  {
    sectionType: 'problem',
    variantId: 'C',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      <div style="position:absolute;right:0;top:0;width:380px;height:100%;background:#F8F8F8;"></div>
      <div style="position:absolute;left:460px;top:40px;width:1px;height:${h - 80}px;background:linear-gradient(180deg,transparent,${hexToRgba(c.accent, 0.15)},transparent);"></div>
      ${vBar(48, 55, 80, c.accent, 0.4)}
      ${hLine(60, h - 50, 100, c.accent, 0.25)}
    `),
  },

  // ================================================================
  // FEATURES A: 3열 아이콘+라벨 카드 그리드 (icon-grid-3col, 35%)
  // 가장 빈도 높은 한국 상세페이지 특장점 레이아웃
  // ================================================================
  {
    sectionType: 'features',
    variantId: 'A',
    render: (c, w, h) => {
      const cardW = 220;
      const cardH = 180;
      const gap = 27;
      const startX = (w - (cardW * 3 + gap * 2)) / 2;
      const cardY = h - cardH - 50;
      const cards = [0, 1, 2].map(i => {
        const x = startX + i * (cardW + gap);
        return `
          <div style="position:absolute;left:${x}px;top:${cardY}px;width:${cardW}px;height:${cardH}px;background:#FAFAFA;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,0.05);border-top:3px solid ${hexToRgba(c.accent, 1 - i * 0.2)};text-align:center;">
            ${numBadge(cardW / 2 - 20, 20, 40, hexToRgba(c.accent, 1 - i * 0.15), `0${i + 1}`)}
          </div>`;
      }).join('');
      return wrap(w, h, '#FFFFFF', `
        ${vBar(0, 0, h, c.accent, 0.5)}
        ${cards}
        ${hLine(w / 2 - 30, cardY - 20, 60, c.accent, 0.3)}
      `);
    },
  },

  // FEATURES B: Point 넘버링 패턴 (numbered-points, 15%)
  // "Point 01/02/03" 대형 넘버 + 바디 텍스트
  {
    sectionType: 'features',
    variantId: 'B',
    render: (c, w, h) => wrap(w, h, '#F5F5F5', `
      ${vBar(0, 0, h, c.accent, 0.5)}
      ${cardEl(40, 40, w - 80, h - 80, { bg: '#FFFFFF', borderLeft: c.accent, shadow: '0 4px 24px rgba(0,0,0,0.05)' })}
      <div style="position:absolute;right:80px;top:50px;font-size:72px;font-weight:900;color:${hexToRgba(c.accent, 0.07)};line-height:1;letter-spacing:-3px;">POINT</div>
      ${hLine(60, h - 50, w - 120, c.accent, 0.15)}
    `),
  },

  // FEATURES C: 좌텍스트/우제품 분할 (split-layout)
  {
    sectionType: 'features',
    variantId: 'C',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      <div style="position:absolute;right:0;top:0;width:380px;height:100%;background:linear-gradient(135deg,#F5F5F5 0%,#EFEFEF 100%);"></div>
      <div style="position:absolute;left:460px;top:0;width:1px;height:100%;background:linear-gradient(180deg,transparent,${hexToRgba(c.accent, 0.2)},transparent);"></div>
      ${vBar(48, 55, 80, c.accent, 0.4)}
      ${iconBubble(60, h - 70, 36, c.accent, 0.1, svg.check(c.accent, 18))}
    `),
  },

  // ================================================================
  // DETAIL A: 중앙정렬 + 상단 제품 영역
  // ================================================================
  {
    sectionType: 'detail',
    variantId: 'A',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      <div style="position:absolute;top:0;left:0;right:0;height:260px;background:linear-gradient(180deg,#F8F8F8 0%,#FFFFFF 100%);"></div>
      ${hLine(w / 2 - 30, 275, 60, c.accent, 0.3)}
      ${cardEl(100, 340, w - 200, h - 400, { bg: '#FAFAFA', shadow: '0 2px 16px rgba(0,0,0,0.04)' })}
    `),
  },

  // DETAIL B: 좌정렬 카드 (left-aligned with accent bar)
  {
    sectionType: 'detail',
    variantId: 'B',
    render: (c, w, h) => wrap(w, h, '#F5F5F5', `
      ${vBar(0, 0, h, c.accent, 0.5)}
      ${cardEl(40, 40, w - 80, h - 80, { bg: '#FFFFFF', borderLeft: c.accent, shadow: '0 4px 24px rgba(0,0,0,0.05)' })}
      ${hLine(60, h - 30, w - 120, c.accent, 0.12)}
    `),
  },

  // DETAIL C: 좌텍스트/우제품 분할
  {
    sectionType: 'detail',
    variantId: 'C',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      <div style="position:absolute;right:0;top:0;width:380px;height:100%;background:linear-gradient(135deg,#F8F8F8 0%,#F2F2F2 100%);"></div>
      <div style="position:absolute;left:455px;top:40px;width:1px;height:${h - 80}px;background:linear-gradient(180deg,transparent,${hexToRgba(c.accent, 0.15)},transparent);"></div>
      ${vBar(48, 55, 80, c.accent, 0.35)}
    `),
  },

  // ================================================================
  // HOWTO A: Step 1→2→3 연결선 카드 (numbered-steps, 25%)
  // ================================================================
  {
    sectionType: 'howto',
    variantId: 'A',
    render: (c, w, h) => {
      const stepY = h - 120;
      const stepCards = [0, 1, 2].map(i => {
        const x = 80 + i * 250;
        return `
          <div style="position:absolute;left:${x}px;top:${stepY}px;width:200px;height:80px;background:#FAFAFA;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.05);border-top:3px solid ${hexToRgba(c.accent, 1 - i * 0.2)};text-align:center;">
            ${numBadge(80, -16, 32, hexToRgba(c.accent, 1 - i * 0.15), `${i + 1}`)}
          </div>
          ${i < 2 ? `<div style="position:absolute;left:${x + 205}px;top:${stepY + 35}px;width:40px;height:2px;background:${hexToRgba(c.accent, 0.25)};"></div>` : ''}`;
      }).join('');
      return wrap(w, h, '#FFFFFF', `
        ${vBar(0, 0, h, c.accent, 0.5)}
        ${stepCards}
      `);
    },
  },

  // HOWTO B: 중앙 3스텝 카드 (step-icons, 15%)
  {
    sectionType: 'howto',
    variantId: 'B',
    render: (c, w, h) => {
      const cardY = h - 140;
      const cards = [0, 1, 2].map(i => {
        const x = 70 + i * 250;
        return `
          <div style="position:absolute;left:${x}px;top:${cardY}px;width:210px;height:100px;background:#fff;border-radius:14px;box-shadow:0 2px 16px rgba(0,0,0,0.05);border-top:3px solid ${hexToRgba(c.accent, 1 - i * 0.2)};text-align:center;">
            ${numBadge(85, -16, 32, hexToRgba(c.accent, 1 - i * 0.15), `${i + 1}`)}
          </div>
          ${i < 2 ? `<div style="position:absolute;left:${x + 216}px;top:${cardY + 45}px;color:${hexToRgba(c.accent, 0.3)};font-size:18px;">→</div>` : ''}`;
      }).join('');
      return wrap(w, h, '#F8F8F8', `
        ${cards}
        ${hLine(w / 2 - 30, cardY - 20, 60, c.accent, 0.25)}
      `);
    },
  },

  // ================================================================
  // SOCIAL PROOF A: (photo bg — no HTML design needed, handled by fabric.js)
  // ================================================================

  // SOCIAL PROOF B: 리뷰 카드 (review-cards, 45%)
  // 인용구 카드 + 별점
  {
    sectionType: 'social_proof',
    variantId: 'B',
    render: (c, w, h) => {
      const cardY = 180;
      const cardH = h - cardY - 60;
      return wrap(w, h, '#FFFFFF', `
        ${vBar(0, 0, h, c.accent, 0.5)}
        <div style="position:absolute;right:60px;top:40px;">${svg.quote(c.accent, 48)}</div>
        ${cardEl(60, cardY, w - 120, cardH, { bg: '#FAFAFA', borderLeft: c.accent, shadow: '0 4px 24px rgba(0,0,0,0.05)' })}
        <div style="position:absolute;left:80px;top:${cardY + cardH - 36}px;display:flex;gap:3px;">${starsRow(c.accent)}</div>
        ${hLine(60, h - 40, 120, c.accent, 0.2)}
      `);
    },
  },

  // ================================================================
  // TRUST A: 인증 뱃지 그리드 (certification-grid, 30%)
  // 인증마크/수상 뱃지 가로 나열
  // ================================================================
  {
    sectionType: 'trust',
    variantId: 'A',
    render: (c, w, h) => {
      const badgeY = h - 170;
      const badges = [0, 1, 2, 3].map(i => {
        const x = 90 + i * 180;
        return `
          <div style="position:absolute;left:${x}px;top:${badgeY}px;width:140px;height:120px;background:#fff;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,0.05);border-top:3px solid ${hexToRgba(c.accent, 1 - i * 0.15)};text-align:center;">
            ${iconBubble(48, 16, 44, c.accent, 0.1, i % 2 === 0 ? svg.shield(c.accent, 22) : svg.award(c.accent, 22))}
          </div>`;
      }).join('');
      return wrap(w, h, '#F8F8F8', `
        ${badges}
        ${hLine(w / 2 - 30, badgeY - 20, 60, c.accent, 0.25)}
      `);
    },
  },

  // ================================================================
  // SPECS A: 좌정렬 표 (left-aligned-table, 50%)
  // 키:값 행 + 교차 배경
  // ================================================================
  {
    sectionType: 'specs',
    variantId: 'A',
    render: (c, w, h) => {
      const rowH = 40;
      const startY = 170;
      const numRows = Math.min(6, Math.floor((h - startY - 40) / rowH));
      const rows = new Array(numRows).fill(0).map((_, i) => {
        const y = startY + i * rowH;
        const bg = i % 2 === 0 ? '#FAFAFA' : '#FFFFFF';
        return `<div style="position:absolute;left:60px;top:${y}px;width:${w - 120}px;height:${rowH}px;background:${bg};${i === 0 ? `border-top:2px solid ${c.accent};` : ''}"></div>`;
      }).join('');
      return wrap(w, h, '#FFFFFF', `
        ${vBar(0, 0, h, c.accent, 0.5)}
        ${rows}
        <div style="position:absolute;left:60px;top:${startY + numRows * rowH}px;width:${w - 120}px;height:2px;background:${hexToRgba(c.accent, 0.15)};"></div>
      `);
    },
  },

  // SPECS B: 중앙 카드 (center-card, 30%)
  {
    sectionType: 'specs',
    variantId: 'B',
    render: (c, w, h) => wrap(w, h, '#F5F5F5', `
      ${cardEl(90, 70, w - 180, h - 140, { bg: '#FFFFFF', borderTop: c.accent, radius: 20, shadow: '0 6px 32px rgba(0,0,0,0.06)' })}
      <div style="position:absolute;left:90px;top:70px;width:${w - 180}px;height:${h - 140}px;border-radius:20px;background:linear-gradient(180deg,${hexToRgba(c.accent, 0.03)} 0%,transparent 30%);pointer-events:none;"></div>
    `),
  },
];

/** Look up a design template by section type + variant */
export function getHtmlDesignTemplate(sectionType: string, variantId: string): HtmlDesignTemplate | null {
  return htmlDesignTemplates.find(t => t.sectionType === sectionType && t.variantId === variantId) ?? null;
}
