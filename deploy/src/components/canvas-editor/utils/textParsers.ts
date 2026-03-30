// Text parsers — extracted from Step4ImageEditor

export function parseFeatures(body: string): Array<{ title: string; desc: string }> {
  const bold = Array.from(body.matchAll(/\*\*([^*\n]+)\*\*[:\s]+([^\n]+)/g));
  if (bold.length >= 2) return bold.slice(0, 3).map(m => ({ title: m[1].trim(), desc: m[2].trim() }));
  const num = Array.from(body.matchAll(/^\d+[\.\)]\s+([^:\n]+)(?::\s*([^\n]+))?/gm));
  if (num.length >= 2) return num.slice(0, 3).map(m => ({ title: m[1].trim(), desc: (m[2] || '').trim() }));
  const paras = body.split(/\n\n+/).filter(p => p.trim()).slice(0, 3);
  return paras.map(p => {
    const lines = p.trim().split('\n');
    return { title: lines[0].replace(/^[-*•\d.\)]\s*/, '').trim(), desc: lines.slice(1).join(' ').trim() };
  });
}

export function parseSteps(body: string): Array<{ num: number; title: string; desc: string }> {
  const stepLine = Array.from(body.matchAll(/^\s*(\d+)[단계\.\)]\s*[:\s]?([^\n]+)/gm));
  if (stepLine.length >= 2) return stepLine.slice(0, 6).map((m, i) => ({ num: i + 1, title: m[2].trim(), desc: '' }));
  const paras = body.split(/\n\n+/).filter(p => p.trim()).slice(0, 5);
  return paras.map((p, i) => {
    const lines = p.trim().split('\n');
    return { num: i + 1, title: lines[0].replace(/^[-*•]\s*/, '').trim(), desc: lines.slice(1).join(' ').trim() };
  });
}

export function parseTrustItems(body: string): string[] {
  const bullets = body
    .split('\n')
    .filter(l => l.trim().match(/^[-•*✓]|^\d+[\.\)]/))
    .map(l => l.replace(/^[-•*✓\d\.\)]\s*/, '').split(':')[0].trim())
    .filter(l => l.length > 2)
    .slice(0, 6);
  if (bullets.length >= 2) return bullets;
  return body
    .split(/\n\n+/)
    .filter(p => p.trim())
    .slice(0, 4)
    .map(p => p.trim().split('\n')[0].replace(/^[-*•]\s*/, '').trim());
}

export function getBodyPreview(body: string, maxLen = 160): string {
  return body.split('\n').filter(l => l.trim()).slice(0, 3).join(' ').slice(0, maxLen);
}
