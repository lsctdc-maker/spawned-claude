import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth-server';
import {
  DetailPageSection,
  ProductInfo,
  ToneKey,
  HeroContent,
  USPContent,
  DetailContent,
  ComparisonContent,
  HowToContent,
  CertificationContent,
  ReviewContent,
  FAQContent,
  CTAContent,
} from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function e(str: string | undefined | null): string {
  return escapeHtml(str || '');
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { sections, productInfo, tone } = body as {
      sections: DetailPageSection[];
      productInfo: ProductInfo;
      tone: ToneKey;
    };

    const html = buildExportHTML(sections, productInfo);
    return NextResponse.json({ html });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'HTML 내보내기에 실패했습니다.' },
      { status: 500 }
    );
  }
}

function buildExportHTML(
  sections: DetailPageSection[],
  productInfo: ProductInfo
): string {
  const visibleSections = sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const name = escapeHtml(productInfo.name || '상세페이지');
  const category = productInfo.category
    ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES]
    : null;
  const primaryColor = category?.primary || '#4F46E5';

  const sectionsHTML = visibleSections
    .map((section) => renderSection(section, primaryColor, name, category?.icon || '📦'))
    .join('\n<hr style="width:80%;max-width:700px;margin:0 auto;border:none;border-top:1px solid #eee;" />\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=860">
  <title>${name} 상세페이지</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans KR', sans-serif; max-width: 860px; margin: 0 auto; background: #fff; color: #1a1a1a; line-height: 1.6; -webkit-font-smoothing: antialiased; }
    .section { padding: 60px 30px; }
    h1, h2, h3 { line-height: 1.3; }
    .btn { display: inline-block; padding: 16px 40px; border-radius: 16px; font-weight: 700; font-size: 18px; text-decoration: none; cursor: pointer; border: none; }
  </style>
</head>
<body>
${sectionsHTML}
</body>
</html>`;
}

function renderSection(
  section: DetailPageSection,
  primaryColor: string,
  productName: string,
  categoryIcon: string
): string {
  switch (section.type) {
    case 'hero':
      return renderHero(section.content as HeroContent, primaryColor, productName);
    case 'usp':
      return renderUSP(section.content as USPContent, primaryColor);
    case 'detail':
      return renderDetail(section.content as DetailContent, primaryColor, categoryIcon);
    case 'comparison':
      return renderComparison(section.content as ComparisonContent, primaryColor);
    case 'howto':
      return renderHowTo(section.content as HowToContent, primaryColor);
    case 'certification':
      return renderCertification(section.content as CertificationContent);
    case 'reviews':
      return renderReviews(section.content as ReviewContent, primaryColor);
    case 'faq':
      return renderFAQ(section.content as FAQContent, primaryColor);
    case 'cta':
      return renderCTA(section.content as CTAContent, primaryColor);
    default:
      return '';
  }
}

function renderHero(c: HeroContent, color: string, price?: string): string {
  return `<div class="section" style="background:linear-gradient(135deg,${color}15 0%,${color}30 100%);padding:80px 30px;text-align:center;">
  <h1 style="font-size:36px;font-weight:800;color:${color};margin-bottom:16px;">${e(c.headline)}</h1>
  <p style="font-size:18px;color:#555;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto;">${e(c.subheadline)}</p>
  <a class="btn" style="background:${color};color:#fff;">${e(c.ctaText)}</a>
</div>`;
}

function renderUSP(c: USPContent, color: string): string {
  const points = c.points.map((p) => `
    <div style="text-align:center;padding:24px;flex:1;min-width:200px;background:${color}08;border-radius:16px;">
      <div style="font-size:36px;margin-bottom:12px;">${e(p.icon) || '📌'}</div>
      <h3 style="font-weight:700;margin-bottom:8px;">${e(p.title)}</h3>
      <p style="font-size:14px;color:#666;">${e(p.description)}</p>
    </div>`).join('');
  return `<div class="section">
  <h2 style="font-size:24px;font-weight:700;text-align:center;margin-bottom:40px;">왜 선택해야 할까요?</h2>
  <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;">${points}</div>
</div>`;
}

function renderDetail(c: DetailContent, color: string, icon: string): string {
  const paragraphs = c.paragraphs.map((p) => `
    <div style="display:flex;gap:32px;align-items:center;margin-bottom:48px;flex-direction:${p.imagePosition === 'left' ? 'row-reverse' : 'row'};">
      <div style="flex:1;">
        <h3 style="font-size:20px;font-weight:700;margin-bottom:12px;">${e(p.title)}</h3>
        <p style="color:#555;line-height:1.8;">${e(p.text)}</p>
      </div>
      <div style="width:240px;height:180px;background:${color}10;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:48px;flex-shrink:0;">${icon}</div>
    </div>`).join('');
  return `<div class="section">${paragraphs}</div>`;
}

function renderComparison(c: ComparisonContent, color: string): string {
  const headerCells = c.headers.map((h, i) =>
    `<th style="padding:16px 24px;text-align:center;font-weight:700;${i === 1 ? `background:${color};color:#fff;border-radius:${12}px ${12}px 0 0;` : 'background:#f9fafb;color:#374151;'}">${e(h)}</th>`
  ).join('');
  const rows = c.rows.map((r) => {
    const cells = r.values.map((v, i) =>
      `<td style="padding:16px 24px;text-align:center;${i === 0 ? `color:${color};font-weight:700;` : 'color:#6b7280;'}">${e(v)}</td>`
    ).join('');
    return `<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:16px 24px;font-weight:500;color:#374151;">${e(r.label)}</td>${cells}</tr>`;
  }).join('');
  return `<div class="section">
  <h2 style="font-size:24px;font-weight:700;text-align:center;margin-bottom:40px;">비교해보세요</h2>
  <table style="width:100%;border-collapse:collapse;max-width:600px;margin:0 auto;font-size:14px;">
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>`;
}

function renderHowTo(c: HowToContent, color: string): string {
  const steps = c.steps.map((s, i) => `
    <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:${i < c.steps.length - 1 ? '32' : '0'}px;position:relative;">
      <div style="width:40px;height:40px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;">${e(String(s.step))}</div>
      <div style="padding-top:4px;">
        <h3 style="font-weight:700;margin-bottom:4px;">${e(s.title)}</h3>
        <p style="font-size:14px;color:#666;">${e(s.description)}</p>
      </div>
    </div>`).join('');
  return `<div class="section" style="background:${color}05;">
  <h2 style="font-size:24px;font-weight:700;text-align:center;margin-bottom:40px;">이렇게 사용하세요</h2>
  <div style="max-width:500px;margin:0 auto;">${steps}</div>
</div>`;
}

function renderCertification(c: CertificationContent): string {
  const items = c.items.map((item) => `
    <div style="text-align:center;width:140px;">
      <div style="width:64px;height:64px;margin:0 auto 12px;border-radius:16px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;font-size:28px;">${e(item.icon)}</div>
      <h3 style="font-size:14px;font-weight:700;margin-bottom:4px;">${e(item.name)}</h3>
      <p style="font-size:12px;color:#888;">${e(item.description)}</p>
    </div>`).join('');
  return `<div class="section" style="background:#f9fafb;">
  <h2 style="font-size:24px;font-weight:700;text-align:center;margin-bottom:40px;">인증 & 신뢰</h2>
  <div style="display:flex;justify-content:center;gap:32px;flex-wrap:wrap;">${items}</div>
</div>`;
}

function renderReviews(c: ReviewContent, color: string): string {
  const reviews = c.reviews.map((r) => {
    const stars = Array.from({ length: 5 }, (_, i) =>
      `<span style="color:${i < r.rating ? '#FBBF24' : '#D1D5DB'};">★</span>`
    ).join('');
    return `<div style="padding:24px;background:#f9fafb;border-radius:16px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">${e(r.author.charAt(0))}</div>
        <div><div style="font-weight:500;font-size:14px;">${e(r.author)}</div><div style="font-size:14px;">${stars}</div></div>
        <span style="margin-left:auto;font-size:12px;color:#aaa;">${e(r.date)}</span>
      </div>
      <p style="font-size:14px;color:#555;">${e(r.text)}</p>
    </div>`;
  }).join('');
  return `<div class="section">
  <h2 style="font-size:24px;font-weight:700;text-align:center;margin-bottom:40px;">고객 후기</h2>
  <div style="max-width:600px;margin:0 auto;">${reviews}</div>
</div>`;
}

function renderFAQ(c: FAQContent, color: string): string {
  const items = c.items.map((item) => `
    <div style="background:#f9fafb;border-radius:16px;padding:20px 24px;margin-bottom:12px;">
      <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:8px;">
        <span style="font-weight:700;color:${color};">Q</span>
        <span style="font-weight:500;">${e(item.question)}</span>
      </div>
      <div style="display:flex;gap:12px;align-items:flex-start;padding-top:8px;border-top:1px solid #e5e7eb;">
        <span style="font-weight:700;color:#aaa;">A</span>
        <span style="font-size:14px;color:#666;">${e(item.answer)}</span>
      </div>
    </div>`).join('');
  return `<div class="section">
  <h2 style="font-size:24px;font-weight:700;text-align:center;margin-bottom:40px;">자주 묻는 질문</h2>
  <div style="max-width:600px;margin:0 auto;">${items}</div>
</div>`;
}

function renderCTA(c: CTAContent, color: string): string {
  return `<div class="section" style="background:linear-gradient(135deg,${color} 0%,${color}CC 100%);text-align:center;padding:80px 30px;">
  <h2 style="font-size:28px;font-weight:800;color:#fff;margin-bottom:12px;">${e(c.headline)}</h2>
  <p style="color:rgba(255,255,255,0.8);font-size:18px;margin-bottom:32px;">${e(c.subtext)}</p>
  <a class="btn" style="background:#fff;color:${color};font-size:18px;">${e(c.buttonText)}</a>
  ${c.urgencyText ? `<p style="color:rgba(255,255,255,0.9);margin-top:16px;font-size:14px;font-weight:500;">${e(c.urgencyText)}</p>` : ''}
</div>`;
}
