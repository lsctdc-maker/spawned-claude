/**
 * HTML/CSS design templates for solid-background sections.
 * These templates render the visual DESIGN layer (cards, gradients, patterns, icons).
 * Text and product images are handled separately by fabric.js as editable objects.
 */

export type DesignColors = {
  accent: string;
  bg: string;
  bg2: string;
  text: string;
};

// Hex to rgba helper for template use
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Inline SVG icon fragments (from lucide)
const svg = {
  shieldCheck: (color: string, size = 24) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  award: (color: string, size = 24) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>`,
  check: (color: string, size = 24) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  circleCheck: (color: string, size = 24) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  circleHelp: (color: string, size = 24) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
  clipboard: (color: string, size = 24) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>`,
  star: (color: string, size = 24) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  quote: (color: string, size = 48) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" opacity="0.15"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`,
  listChecks: (color: string, size = 24) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>`,
};

// Base container wrapper
function wrap(w: number, h: number, bg: string, inner: string): string {
  return `<div style="width:${w}px;height:${h}px;background:${bg};position:relative;overflow:hidden;font-family:'Noto Sans KR',sans-serif;">${inner}</div>`;
}

// Reusable design elements
function decorCircle(x: number, y: number, size: number, color: string, opacity: number): string {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle,${hexToRgba(color, opacity)} 0%,transparent 70%);"></div>`;
}

function accentLine(pos: 'top' | 'bottom', color: string): string {
  return `<div style="position:absolute;${pos}:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent 5%,${hexToRgba(color, 0.6)} 50%,transparent 95%);"></div>`;
}

function dotPattern(color: string, opacity: number): string {
  return `<div style="position:absolute;inset:0;background:radial-gradient(circle,${hexToRgba(color, opacity)} 1px,transparent 1px);background-size:24px 24px;"></div>`;
}

function card(left: number, top: number, w: number, h: number, opts?: {
  borderTop?: string; borderLeft?: string; radius?: number; bg?: string; shadow?: string;
}): string {
  const r = opts?.radius ?? 16;
  const bg = opts?.bg ?? '#FFFFFF';
  const shadow = opts?.shadow ?? '0 2px 20px rgba(0,0,0,0.06)';
  const bt = opts?.borderTop ? `border-top:3px solid ${opts.borderTop};` : '';
  const bl = opts?.borderLeft ? `border-left:4px solid ${opts.borderLeft};` : '';
  return `<div style="position:absolute;left:${left}px;top:${top}px;width:${w}px;height:${h}px;background:${bg};border-radius:${r}px;box-shadow:${shadow};${bt}${bl}"></div>`;
}

function badge(x: number, y: number, size: number, color: string, content: string): string {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:${Math.round(size * 0.4)}px;font-weight:700;box-shadow:0 2px 8px ${hexToRgba(color, 0.3)};">${content}</div>`;
}

function iconCircle(x: number, y: number, size: number, bgColor: string, bgOpacity: number, iconSvg: string): string {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${hexToRgba(bgColor, bgOpacity)};border-radius:50%;display:flex;align-items:center;justify-content:center;">${iconSvg}</div>`;
}

function gradientBar(left: number, top: number, w: number, h: number, color: string, direction = '90deg'): string {
  return `<div style="position:absolute;left:${left}px;top:${top}px;width:${w}px;height:${h}px;background:linear-gradient(${direction},${hexToRgba(color, 0.5)},transparent);border-radius:${h / 2}px;"></div>`;
}

// ===== TEMPLATES =====

export type HtmlDesignTemplate = {
  sectionType: string;
  variantId: string;
  render: (c: DesignColors, w: number, h: number) => string;
};

export const htmlDesignTemplates: HtmlDesignTemplate[] = [

  // ========== PROBLEM A: 중앙정렬 클린 화이트 ==========
  {
    sectionType: 'problem',
    variantId: 'A',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      ${accentLine('top', c.accent)}
      ${decorCircle(650, -30, 200, c.accent, 0.07)}
      ${decorCircle(-40, 350, 160, c.accent, 0.05)}
      ${card(80, 170, 700, 280, { borderLeft: c.accent, radius: 20, bg: '#FAFAFA', shadow: '0 4px 24px rgba(0,0,0,0.05)' })}
      ${iconCircle(390, 20, 56, c.accent, 0.12, svg.circleHelp(c.accent, 28))}
      <div style="position:absolute;left:400;top:155;width:60px;height:3px;background:${c.accent};border-radius:2px;"></div>
      ${accentLine('bottom', c.accent)}
    `),
  },

  // ========== PROBLEM B: 좌정렬 + 우측 제품 ==========
  {
    sectionType: 'problem',
    variantId: 'B',
    render: (c, w, h) => wrap(w, h, '#F8F8F8', `
      ${dotPattern(c.accent, 0.03)}
      <div style="position:absolute;left:0;top:0;width:6px;height:100%;background:linear-gradient(180deg,transparent,${c.accent},transparent);"></div>
      ${card(40, 60, 440, 380, { borderLeft: c.accent, radius: 20, shadow: '0 4px 24px rgba(0,0,0,0.05)' })}
      ${decorCircle(600, 300, 180, c.accent, 0.06)}
      ${iconCircle(60, 380, 40, c.accent, 0.1, svg.circleHelp(c.accent, 20))}
      ${gradientBar(40, 470, 440, 3, c.accent)}
    `),
  },

  // ========== PROBLEM C: 카드형 중앙정렬 ==========
  {
    sectionType: 'problem',
    variantId: 'C',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      ${decorCircle(680, -20, 140, c.accent, 0.06)}
      ${card(90, 80, 680, 400, { borderTop: c.accent, radius: 24, bg: '#FAFAFA', shadow: '0 6px 32px rgba(0,0,0,0.06)' })}
      ${badge(400, 55, 50, c.accent, svg.circleHelp('#fff', 24))}
      <div style="position:absolute;left:90;top:80;width:680px;height:400px;border-radius:24px;background:linear-gradient(180deg,${hexToRgba(c.accent, 0.03)} 0%,transparent 40%);pointer-events:none;"></div>
      ${accentLine('bottom', c.accent)}
    `),
  },

  // ========== FEATURES A: 중앙정렬 + 3카드 그리드 ==========
  {
    sectionType: 'features',
    variantId: 'A',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      ${accentLine('top', c.accent)}
      ${decorCircle(680, -40, 200, c.accent, 0.06)}
      ${decorCircle(-50, 400, 180, c.accent, 0.04)}
      <div style="position:absolute;top:310;left:60;right:60;display:flex;gap:20px;">
        <div style="flex:1;background:#FAFAFA;border-radius:16px;padding:24px;box-shadow:0 2px 16px rgba(0,0,0,0.05);border-top:3px solid ${c.accent};text-align:center;">
          ${badge(0, 0, 0, c.accent, '').replace(/<div.*<\/div>/, '')}
          <div style="width:44px;height:44px;background:${c.accent};border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:800;box-shadow:0 2px 8px ${hexToRgba(c.accent, 0.3)};">01</div>
          <div style="height:60px;"></div>
        </div>
        <div style="flex:1;background:#FAFAFA;border-radius:16px;padding:24px;box-shadow:0 2px 16px rgba(0,0,0,0.05);border-top:3px solid ${hexToRgba(c.accent, 0.6)};text-align:center;">
          <div style="width:44px;height:44px;background:${hexToRgba(c.accent, 0.8)};border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:800;">02</div>
          <div style="height:60px;"></div>
        </div>
        <div style="flex:1;background:#FAFAFA;border-radius:16px;padding:24px;box-shadow:0 2px 16px rgba(0,0,0,0.05);border-top:3px solid ${hexToRgba(c.accent, 0.4)};text-align:center;">
          <div style="width:44px;height:44px;background:${hexToRgba(c.accent, 0.6)};border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:800;">03</div>
          <div style="height:60px;"></div>
        </div>
      </div>
      ${accentLine('bottom', c.accent)}
    `),
  },

  // ========== FEATURES B: 좌정렬 + 체크 뱃지 ==========
  {
    sectionType: 'features',
    variantId: 'B',
    render: (c, w, h) => wrap(w, h, '#F5F5F5', `
      ${dotPattern(c.accent, 0.025)}
      <div style="position:absolute;left:0;top:0;width:5px;height:100%;background:linear-gradient(180deg,transparent 10%,${c.accent} 50%,transparent 90%);"></div>
      ${card(40, 50, 780, 500, { borderLeft: c.accent, radius: 20, shadow: '0 4px 24px rgba(0,0,0,0.05)' })}
      ${iconCircle(700, 60, 52, c.accent, 0.12, svg.circleCheck(c.accent, 26))}
      ${gradientBar(60, 540, 720, 4, c.accent)}
      ${decorCircle(700, 400, 120, c.accent, 0.05)}
    `),
  },

  // ========== FEATURES C: 좌텍스트 + 우측 제품 영역 ==========
  {
    sectionType: 'features',
    variantId: 'C',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      <div style="position:absolute;right:0;top:0;width:380px;height:100%;background:linear-gradient(135deg,#F5F5F5 0%,#EFEFEF 100%);"></div>
      <div style="position:absolute;left:460;top:0;width:1px;height:100%;background:linear-gradient(180deg,transparent,${hexToRgba(c.accent, 0.2)},transparent);"></div>
      ${decorCircle(-30, 420, 140, c.accent, 0.06)}
      ${accentLine('top', c.accent)}
      <div style="position:absolute;left:48;top:58;width:4px;height:80px;background:${hexToRgba(c.accent, 0.4)};border-radius:2px;"></div>
      ${iconCircle(60, 480, 40, c.accent, 0.1, svg.check(c.accent, 20))}
    `),
  },

  // ========== DETAIL A: 중앙정렬 + 상단 제품 ==========
  {
    sectionType: 'detail',
    variantId: 'A',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      <div style="position:absolute;top:0;left:0;right:0;height:280px;background:linear-gradient(180deg,#F8F8F8 0%,#FFFFFF 100%);"></div>
      ${accentLine('top', c.accent)}
      ${decorCircle(680, 20, 120, c.accent, 0.06)}
      <div style="position:absolute;left:100;top:290;right:100;height:1px;background:linear-gradient(90deg,transparent,${hexToRgba(c.accent, 0.15)},transparent);"></div>
      ${iconCircle(60, 300, 40, c.accent, 0.1, svg.circleCheck(c.accent, 20))}
      ${card(100, 380, 660, 160, { radius: 16, bg: '#FAFAFA', shadow: '0 2px 16px rgba(0,0,0,0.04)' })}
    `),
  },

  // ========== DETAIL B: 좌정렬 라이트그레이 ==========
  {
    sectionType: 'detail',
    variantId: 'B',
    render: (c, w, h) => wrap(w, h, '#F5F5F5', `
      ${dotPattern(c.accent, 0.02)}
      <div style="position:absolute;left:0;top:0;width:5px;height:100%;background:linear-gradient(180deg,transparent 10%,${c.accent} 50%,transparent 90%);"></div>
      ${card(40, 50, 780, 460, { borderLeft: c.accent, radius: 20, shadow: '0 4px 24px rgba(0,0,0,0.05)' })}
      ${iconCircle(720, 70, 44, c.accent, 0.1, svg.listChecks(c.accent, 22))}
      ${gradientBar(60, 500, 740, 3, c.accent)}
    `),
  },

  // ========== DETAIL C: 좌텍스트 + 우제품 ==========
  {
    sectionType: 'detail',
    variantId: 'C',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      <div style="position:absolute;right:0;top:0;width:380px;height:100%;background:linear-gradient(135deg,#F8F8F8 0%,#F2F2F2 100%);"></div>
      <div style="position:absolute;left:455;top:40;width:1px;height:${h - 80}px;background:linear-gradient(180deg,transparent,${hexToRgba(c.accent, 0.15)},transparent);"></div>
      ${decorCircle(-20, 380, 120, c.accent, 0.05)}
      <div style="position:absolute;left:48;top:58;width:4px;height:80px;background:${hexToRgba(c.accent, 0.35)};border-radius:2px;"></div>
      ${iconCircle(60, 440, 36, c.accent, 0.1, svg.circleCheck(c.accent, 18))}
      ${accentLine('bottom', c.accent)}
    `),
  },

  // ========== HOWTO A: 좌텍스트 + 스텝 넘버 ==========
  {
    sectionType: 'howto',
    variantId: 'A',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      ${accentLine('top', c.accent)}
      ${decorCircle(680, -20, 160, c.accent, 0.05)}
      <div style="position:absolute;left:48;top:58;width:4px;height:80px;background:${hexToRgba(c.accent, 0.35)};border-radius:2px;"></div>
      <div style="position:absolute;left:60;top:360;display:flex;gap:12px;align-items:center;">
        <div style="width:36px;height:36px;background:${c.accent};border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800;box-shadow:0 2px 8px ${hexToRgba(c.accent, 0.3)};">1</div>
        <div style="width:24px;height:2px;background:${hexToRgba(c.accent, 0.3)};"></div>
        <div style="width:36px;height:36px;background:${hexToRgba(c.accent, 0.7)};border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800;">2</div>
        <div style="width:24px;height:2px;background:${hexToRgba(c.accent, 0.2)};"></div>
        <div style="width:36px;height:36px;background:${hexToRgba(c.accent, 0.5)};border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800;">3</div>
      </div>
      ${gradientBar(60, 500, 380, 3, c.accent)}
    `),
  },

  // ========== HOWTO B: 중앙정렬 + 3스텝 카드 ==========
  {
    sectionType: 'howto',
    variantId: 'B',
    render: (c, w, h) => wrap(w, h, '#F8F8F8', `
      ${accentLine('top', c.accent)}
      ${decorCircle(700, -30, 160, c.accent, 0.05)}
      ${iconCircle(60, 50, 44, c.accent, 0.1, svg.clipboard(c.accent, 22))}
      <div style="position:absolute;top:380;left:80;right:80;display:flex;gap:16px;align-items:center;">
        <div style="flex:1;background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 16px rgba(0,0,0,0.05);text-align:center;border-top:3px solid ${c.accent};">
          <div style="width:36px;height:36px;background:${c.accent};border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800;box-shadow:0 2px 8px ${hexToRgba(c.accent, 0.3)};">1</div>
          <div style="height:40px;"></div>
        </div>
        <div style="color:${hexToRgba(c.accent, 0.4)};font-size:20px;">→</div>
        <div style="flex:1;background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 16px rgba(0,0,0,0.05);text-align:center;border-top:3px solid ${hexToRgba(c.accent, 0.6)};">
          <div style="width:36px;height:36px;background:${hexToRgba(c.accent, 0.7)};border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800;">2</div>
          <div style="height:40px;"></div>
        </div>
        <div style="color:${hexToRgba(c.accent, 0.3)};font-size:20px;">→</div>
        <div style="flex:1;background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 16px rgba(0,0,0,0.05);text-align:center;border-top:3px solid ${hexToRgba(c.accent, 0.4)};">
          <div style="width:36px;height:36px;background:${hexToRgba(c.accent, 0.5)};border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800;">3</div>
          <div style="height:40px;"></div>
        </div>
      </div>
    `),
  },

  // ========== SOCIAL PROOF B: 좌정렬 리뷰 스타일 ==========
  {
    sectionType: 'social_proof',
    variantId: 'B',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      <div style="position:absolute;left:0;top:0;width:5px;height:100%;background:linear-gradient(180deg,transparent 10%,${c.accent} 50%,transparent 90%);"></div>
      <div style="position:absolute;right:60;top:50;">${svg.quote(c.accent, 64)}</div>
      ${card(60, 60, 740, 380, { borderLeft: c.accent, radius: 20, bg: '#FAFAFA', shadow: '0 4px 24px rgba(0,0,0,0.05)' })}
      <div style="position:absolute;left:80;top:400;display:flex;gap:4px;">
        ${svg.star(c.accent, 18)}${svg.star(c.accent, 18)}${svg.star(c.accent, 18)}${svg.star(c.accent, 18)}${svg.star(c.accent, 18)}
      </div>
      ${decorCircle(680, 350, 120, c.accent, 0.05)}
      ${accentLine('bottom', c.accent)}
    `),
  },

  // ========== TRUST A: 인증 카드 2개 ==========
  {
    sectionType: 'trust',
    variantId: 'A',
    render: (c, w, h) => wrap(w, h, '#F8F8F8', `
      ${accentLine('top', c.accent)}
      ${dotPattern(c.accent, 0.02)}
      ${decorCircle(680, -30, 160, c.accent, 0.05)}
      <div style="position:absolute;top:300;left:80;right:80;display:flex;gap:28px;">
        <div style="flex:1;background:#fff;border-radius:20px;padding:28px 20px;box-shadow:0 4px 24px rgba(0,0,0,0.06);text-align:center;border-top:3px solid ${c.accent};">
          ${iconCircle(0, 0, 0, c.accent, 0, '').replace(/<div.*<\/div>/, '')}
          <div style="width:56px;height:56px;background:${hexToRgba(c.accent, 0.1)};border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
            ${svg.shieldCheck(c.accent, 28)}
          </div>
          <div style="height:40px;"></div>
        </div>
        <div style="flex:1;background:#fff;border-radius:20px;padding:28px 20px;box-shadow:0 4px 24px rgba(0,0,0,0.06);text-align:center;border-top:3px solid ${hexToRgba(c.accent, 0.6)};">
          <div style="width:56px;height:56px;background:${hexToRgba(c.accent, 0.1)};border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
            ${svg.award(c.accent, 28)}
          </div>
          <div style="height:40px;"></div>
        </div>
      </div>
      ${accentLine('bottom', c.accent)}
    `),
  },

  // ========== SPECS A: 좌정렬 + 우제품 ==========
  {
    sectionType: 'specs',
    variantId: 'A',
    render: (c, w, h) => wrap(w, h, '#FFFFFF', `
      ${accentLine('top', c.accent)}
      <div style="position:absolute;left:48;top:58;width:4px;height:80px;background:${hexToRgba(c.accent, 0.35)};border-radius:2px;"></div>
      ${card(40, 150, 440, 320, { borderLeft: c.accent, radius: 16, bg: '#FAFAFA', shadow: '0 2px 16px rgba(0,0,0,0.04)' })}
      ${iconCircle(60, 420, 36, c.accent, 0.1, svg.clipboard(c.accent, 18))}
      <div style="position:absolute;right:0;top:0;width:320px;height:100%;background:linear-gradient(135deg,#F8F8F8 0%,#F2F2F2 100%);"></div>
      <div style="position:absolute;left:500;top:40;width:1px;height:${h - 80}px;background:linear-gradient(180deg,transparent,${hexToRgba(c.accent, 0.15)},transparent);"></div>
      ${decorCircle(640, 340, 120, c.accent, 0.05)}
    `),
  },

  // ========== SPECS B: 카드 내부 중앙정렬 ==========
  {
    sectionType: 'specs',
    variantId: 'B',
    render: (c, w, h) => wrap(w, h, '#F5F5F5', `
      ${dotPattern(c.accent, 0.02)}
      ${card(90, 70, 680, 420, { borderTop: c.accent, radius: 24, shadow: '0 6px 32px rgba(0,0,0,0.06)' })}
      <div style="position:absolute;left:90;top:70;width:680px;height:420px;border-radius:24px;background:linear-gradient(180deg,${hexToRgba(c.accent, 0.03)} 0%,transparent 30%);pointer-events:none;"></div>
      ${iconCircle(110, 80, 40, c.accent, 0.1, svg.listChecks(c.accent, 20))}
      ${decorCircle(640, 380, 100, c.accent, 0.05)}
    `),
  },
];

/** Look up a design template by section type + variant */
export function getHtmlDesignTemplate(sectionType: string, variantId: string): HtmlDesignTemplate | null {
  return htmlDesignTemplates.find(t => t.sectionType === sectionType && t.variantId === variantId) ?? null;
}
