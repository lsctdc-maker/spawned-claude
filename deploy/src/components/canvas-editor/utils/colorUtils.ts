// Color utilities — extracted from Step4ImageEditor

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const s = hex.replace(/^#(.{3})$/, (_, h: string) => '#' + h.split('').map((c: string) => c + c).join(''));
  const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(s);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

export function hexToRgba(hex: string, alpha: number): string {
  const c = hexToRgb(hex);
  if (!c) return hex;
  return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}

export function darken(hex: string, pct: number): string {
  const c = hexToRgb(hex);
  if (!c) return hex;
  const f = 1 - pct;
  return '#' + [c.r, c.g, c.b]
    .map(v => Math.round(Math.max(0, v * f)).toString(16).padStart(2, '0'))
    .join('');
}

export function lighten(hex: string, pct: number): string {
  const c = hexToRgb(hex);
  if (!c) return hex;
  return '#' + [c.r, c.g, c.b]
    .map(v => Math.round(Math.min(255, v + (255 - v) * pct)).toString(16).padStart(2, '0'))
    .join('');
}
