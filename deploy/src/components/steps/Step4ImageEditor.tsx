'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import Button from '@/components/ui/Button';
import {
  Download, Upload, Layers, Palette, Type, RefreshCw, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { ManuscriptSectionType } from '@/lib/types';

// ===== Color utilities =====

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const s = hex.replace(/^#(.{3})$/, (_, h: string) => '#' + h.split('').map((c: string) => c + c).join(''));
  const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(s);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hexToRgb(hex);
  if (!c) return hex;
  return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}

function darken(hex: string, pct: number): string {
  const c = hexToRgb(hex);
  if (!c) return hex;
  const f = 1 - pct;
  return (
    '#' +
    [c.r, c.g, c.b]
      .map(v => Math.round(Math.max(0, v * f)).toString(16).padStart(2, '0'))
      .join('')
  );
}

function lighten(hex: string, pct: number): string {
  const c = hexToRgb(hex);
  if (!c) return hex;
  return (
    '#' +
    [c.r, c.g, c.b]
      .map(v =>
        Math.round(Math.min(255, v + (255 - v) * pct))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

// ===== Font utilities =====

function extractFontName(rec: string): string {
  // e.g. "세리프 계열 / Noto Serif KR — 이유"  →  "Noto Serif KR"
  const slash = rec.match(/\/\s*([^—\-\n(]+)/);
  if (slash) return slash[1].trim();
  const eng = rec.match(/([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*(?:\s+KR)?)/);
  if (eng) return eng[1].trim();
  return 'Noto Sans KR';
}

function loadGoogleFont(name: string) {
  if (typeof document === 'undefined') return;
  const id = `gf-${name.replace(/\s/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/\s/g, '+')}:wght@400;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

// ===== Text parsers =====

function parseFeatures(body: string): Array<{ title: string; desc: string }> {
  // Bold: **Title**: desc
  const bold = Array.from(body.matchAll(/\*\*([^*\n]+)\*\*[:\s]+([^\n]+)/g));
  if (bold.length >= 2) return bold.slice(0, 3).map(m => ({ title: m[1].trim(), desc: m[2].trim() }));
  // Numbered: 1. Title: desc
  const num = Array.from(body.matchAll(/^\d+[\.\)]\s+([^:\n]+)(?::\s*([^\n]+))?/gm));
  if (num.length >= 2) return num.slice(0, 3).map(m => ({ title: m[1].trim(), desc: (m[2] || '').trim() }));
  // Paragraphs fallback
  const paras = body.split(/\n\n+/).filter(p => p.trim()).slice(0, 3);
  return paras.map(p => {
    const lines = p.trim().split('\n');
    return { title: lines[0].replace(/^[-*•\d.\)]\s*/, '').trim(), desc: lines.slice(1).join(' ').trim() };
  });
}

function parseSteps(body: string): Array<{ num: number; title: string; desc: string }> {
  const stepLine = Array.from(body.matchAll(/^\s*(\d+)[단계\.\)]\s*[:\s]?([^\n]+)/gm));
  if (stepLine.length >= 2) return stepLine.slice(0, 6).map((m, i) => ({ num: i + 1, title: m[2].trim(), desc: '' }));
  const paras = body.split(/\n\n+/).filter(p => p.trim()).slice(0, 5);
  return paras.map((p, i) => {
    const lines = p.trim().split('\n');
    return { num: i + 1, title: lines[0].replace(/^[-*•]\s*/, '').trim(), desc: lines.slice(1).join(' ').trim() };
  });
}

function parseTrustItems(body: string): string[] {
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

// ===== Types =====

interface CanvasColors {
  bg: string;
  bg2: string;
  text: string;
  accent: string;
}

// ===== Section canvas component =====

const CANVAS_W = 860;

const SECTION_LABEL_MAP: Record<ManuscriptSectionType, string> = {
  hero: '히어로',
  features: '특장점',
  detail: '상세 설명',
  howto: '사용 방법',
  trust: '신뢰 요소',
  cta: '구매 유도',
};

interface SectionCanvasProps {
  sectionType: ManuscriptSectionType;
  title: string;
  body: string;
  photoUrl: string | null;
  colors: CanvasColors;
  headlineFont: string;
  bodyFont: string;
  canvasRef: (el: HTMLDivElement | null) => void;
}

function SectionCanvas({ sectionType, title, body, photoUrl, colors, headlineFont, bodyFont, canvasRef }: SectionCanvasProps) {
  const hf = `'${headlineFont}', 'Noto Sans KR', sans-serif`;
  const bf = `'${bodyFont}', 'Noto Sans KR', sans-serif`;
  const base: React.CSSProperties = { width: CANVAS_W, fontFamily: bf, color: colors.text, boxSizing: 'border-box', overflow: 'hidden' };

  switch (sectionType) {
    case 'hero': {
      const lines = body.split('\n').filter(l => l.trim());
      const headline = title || lines[0] || '메인 타이틀';
      const sub = lines.slice(0, 3).join(' ').slice(0, 140);
      return (
        <div
          ref={canvasRef}
          style={{
            ...base,
            minHeight: 480,
            background: `linear-gradient(140deg, ${colors.bg} 0%, ${darken(colors.bg, 0.18)} 100%)`,
            display: 'flex',
          }}
        >
          {/* Left text */}
          <div style={{ flex: '0 0 54%', padding: '60px 36px 60px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
            <div style={{ fontSize: 10, letterSpacing: 6, textTransform: 'uppercase', color: colors.accent, fontWeight: 700, fontFamily: bf }}>
              HERO SECTION
            </div>
            <div style={{ fontFamily: hf, fontSize: 38, fontWeight: 900, color: colors.text, lineHeight: 1.22, wordBreak: 'keep-all' }}>
              {headline}
            </div>
            <div style={{ fontSize: 15, color: hexToRgba(colors.text, 0.65), lineHeight: 1.7, wordBreak: 'keep-all', maxWidth: 370 }}>
              {sub}
            </div>
            <div style={{
              display: 'inline-flex',
              background: colors.accent,
              color: '#fff',
              padding: '13px 28px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              width: 'fit-content',
              marginTop: 8,
              letterSpacing: 0.4,
              fontFamily: bf,
            }}>
              지금 구매하기
            </div>
          </div>
          {/* Right image */}
          <div style={{ flex: '0 0 46%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px 40px 16px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: hexToRgba(colors.accent, 0.07),
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }} />
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="product"
                crossOrigin="anonymous"
                style={{ maxWidth: 280, maxHeight: 360, objectFit: 'contain', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 20px 36px rgba(0,0,0,0.45))' }}
              />
            ) : (
              <div style={{ width: 200, height: 260, border: `2px dashed ${hexToRgba(colors.accent, 0.25)}`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: hexToRgba(colors.accent, 0.4), fontSize: 12, gap: 8 }}>
                <span style={{ fontSize: 32, opacity: 0.5 }}>[ ]</span>
                <span>제품 이미지</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'features': {
      const items = parseFeatures(body);
      const summaryItems = items.slice(0, 3);
      const detailItems = items.slice(0, 3);
      const bgDark = darken(colors.bg, 0.12);
      const bgAlt = darken(colors.bg, 0.22);
      return (
        <div ref={canvasRef} style={{ ...base, background: bgDark, minHeight: 'auto' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', padding: '56px 56px 44px', background: bgDark }}>
            <div style={{ fontSize: 10, letterSpacing: 6, textTransform: 'uppercase', color: colors.accent, fontWeight: 700, marginBottom: 14, fontFamily: bf }}>
              FEATURES
            </div>
            <div style={{ fontFamily: hf, fontSize: 30, fontWeight: 800, color: colors.text, wordBreak: 'keep-all', lineHeight: 1.3 }}>
              {title}
            </div>
          </div>
          {/* 3-card summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: `1px solid ${hexToRgba(colors.accent, 0.1)}`, borderBottom: `1px solid ${hexToRgba(colors.accent, 0.1)}` }}>
            {summaryItems.map((item, i) => (
              <div key={i} style={{
                padding: '28px 30px',
                borderRight: i < 2 ? `1px solid ${hexToRgba(colors.accent, 0.1)}` : undefined,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                background: i % 2 === 1 ? hexToRgba(colors.accent, 0.04) : 'transparent',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: colors.accent, fontFamily: bf }}>
                  0{i + 1}
                </div>
                <div style={{ fontFamily: hf, fontSize: 15, fontWeight: 700, color: colors.text, wordBreak: 'keep-all', lineHeight: 1.4 }}>
                  {item.title || `특장점 ${i + 1}`}
                </div>
                {item.desc && (
                  <div style={{ fontSize: 12, color: hexToRgba(colors.text, 0.55), lineHeight: 1.65, wordBreak: 'keep-all' }}>
                    {item.desc.split(' ').slice(0, 18).join(' ')}{item.desc.split(' ').length > 18 ? '…' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Large alternating detail blocks */}
          {detailItems.map((item, i) => {
            const isEven = i % 2 === 0;
            const blockBg = isEven ? bgDark : bgAlt;
            return (
              <div key={i} style={{
                display: 'flex',
                flexDirection: isEven ? 'row' : 'row-reverse',
                background: blockBg,
                borderBottom: `1px solid ${hexToRgba(colors.accent, 0.07)}`,
                minHeight: 320,
              }}>
                {/* Number + text side */}
                <div style={{ flex: '0 0 50%', padding: '52px 52px 52px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
                  <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, color: hexToRgba(colors.accent, 0.18), fontFamily: hf, letterSpacing: -4 }}>
                    0{i + 1}
                  </div>
                  <div style={{ width: 32, height: 3, background: colors.accent, borderRadius: 2 }} />
                  <div style={{ fontFamily: hf, fontSize: 22, fontWeight: 800, color: colors.text, wordBreak: 'keep-all', lineHeight: 1.4 }}>
                    {item.title || `특장점 ${i + 1}`}
                  </div>
                  {item.desc && (
                    <div style={{ fontSize: 14, color: hexToRgba(colors.text, 0.65), lineHeight: 1.8, wordBreak: 'keep-all', maxWidth: 340 }}>
                      {item.desc}
                    </div>
                  )}
                </div>
                {/* Image side */}
                <div style={{
                  flex: '0 0 50%',
                  background: isEven ? darken(blockBg, 0.08) : lighten(blockBg, 0.04),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 320,
                  padding: 40,
                }}>
                  {photoUrl && i === 0 ? (
                    <img src={photoUrl} alt="" crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain', filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.35))' }} />
                  ) : (
                    <div style={{ width: 120, height: 120, border: `2px dashed ${hexToRgba(colors.accent, 0.2)}`, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: hexToRgba(colors.accent, 0.3), fontSize: 11, gap: 8 }}>
                      <span style={{ fontSize: 28, opacity: 0.4 }}>[ ]</span>
                      <span>이미지</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'detail': {
      const paragraphs = body.split(/\n\n+/).filter(p => p.trim()).slice(0, 4);
      return (
        <div ref={canvasRef} style={{ ...base, background: colors.bg }}>
          {/* Section header */}
          <div style={{ padding: '56px 56px 40px', textAlign: 'center', borderBottom: `1px solid ${hexToRgba(colors.accent, 0.08)}` }}>
            <div style={{ fontSize: 10, letterSpacing: 6, textTransform: 'uppercase', color: colors.accent, fontWeight: 700, marginBottom: 14, fontFamily: bf }}>
              DETAIL
            </div>
            <div style={{ fontFamily: hf, fontSize: 28, fontWeight: 800, color: colors.text, wordBreak: 'keep-all', lineHeight: 1.3 }}>
              {title}
            </div>
          </div>
          {/* Full-width stacked blocks: image top, text below */}
          {paragraphs.map((para, i) => {
            const lines = para.trim().split('\n');
            const paraTitle = lines[0].replace(/^[-*•\d.\)]\s*/, '').trim();
            const paraBody = lines.slice(1).join(' ').trim();
            const blockBg = i % 2 === 0 ? colors.bg : darken(colors.bg, 0.1);
            return (
              <div key={i} style={{ background: blockBg, borderBottom: `1px solid ${hexToRgba(colors.accent, 0.06)}` }}>
                {/* Full-width image zone */}
                <div style={{
                  width: '100%',
                  height: 380,
                  background: darken(blockBg, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {photoUrl && i === 0 ? (
                    <img src={photoUrl} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: hexToRgba(colors.accent, 0.25) }}>
                      <span style={{ fontSize: 44 }}>[ ]</span>
                      <span style={{ fontSize: 12, letterSpacing: 2 }}>이미지 영역</span>
                    </div>
                  )}
                </div>
                {/* Text below image */}
                <div style={{ padding: '40px 80px 48px', maxWidth: 640, margin: '0 auto' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: colors.accent, fontFamily: bf, marginBottom: 16 }}>
                    0{i + 1}
                  </div>
                  <div style={{ fontFamily: hf, fontSize: 22, fontWeight: 800, color: colors.text, wordBreak: 'keep-all', lineHeight: 1.4, marginBottom: 16 }}>
                    {paraTitle}
                  </div>
                  {paraBody && (
                    <div style={{ fontSize: 14, color: hexToRgba(colors.text, 0.65), lineHeight: 1.85, wordBreak: 'keep-all' }}>
                      {paraBody}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'howto': {
      const steps = parseSteps(body);
      return (
        <div ref={canvasRef} style={{ ...base, background: colors.bg }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', padding: '56px 56px 44px', background: darken(colors.bg, 0.08), borderBottom: `1px solid ${hexToRgba(colors.accent, 0.08)}` }}>
            <div style={{ fontSize: 10, letterSpacing: 6, textTransform: 'uppercase', color: colors.accent, fontWeight: 700, marginBottom: 14, fontFamily: bf }}>
              HOW TO USE
            </div>
            <div style={{ fontFamily: hf, fontSize: 28, fontWeight: 800, color: colors.text, wordBreak: 'keep-all', lineHeight: 1.3 }}>
              {title}
            </div>
          </div>
          {/* Vertical steps */}
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            const stepBg = i % 2 === 0 ? colors.bg : darken(colors.bg, 0.08);
            return (
              <div key={i} style={{
                display: 'flex',
                background: stepBg,
                borderBottom: isLast ? undefined : `1px solid ${hexToRgba(colors.accent, 0.06)}`,
                minHeight: 220,
              }}>
                {/* Left: big number column */}
                <div style={{
                  flex: '0 0 160px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: `1px solid ${hexToRgba(colors.accent, 0.1)}`,
                  padding: '40px 20px',
                  gap: 6,
                  background: darken(stepBg, 0.06),
                }}>
                  <div style={{ fontSize: 72, fontWeight: 900, color: hexToRgba(colors.accent, 0.25), fontFamily: hf, lineHeight: 1 }}>
                    {String(step.num).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: 9, letterSpacing: 3, fontWeight: 700, color: colors.accent, fontFamily: bf, textTransform: 'uppercase' }}>
                    STEP
                  </div>
                </div>
                {/* Right: content */}
                <div style={{ flex: 1, padding: '40px 52px', display: 'flex', alignItems: 'center', gap: 40 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontFamily: hf, fontSize: 20, fontWeight: 800, color: colors.text, wordBreak: 'keep-all', lineHeight: 1.4 }}>
                      {step.title || `Step ${step.num}`}
                    </div>
                    {step.desc && (
                      <div style={{ fontSize: 13, color: hexToRgba(colors.text, 0.62), lineHeight: 1.8, wordBreak: 'keep-all', maxWidth: 440 }}>
                        {step.desc}
                      </div>
                    )}
                  </div>
                  {/* Product image for first step */}
                  {i === 0 && photoUrl && (
                    <div style={{ flex: '0 0 160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={photoUrl} alt="" crossOrigin="anonymous" style={{ maxWidth: 140, maxHeight: 160, objectFit: 'contain', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'trust': {
      const items = parseTrustItems(body);
      return (
        <div ref={canvasRef} style={{ ...base, background: darken(colors.bg, 0.16), padding: '56px 56px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: 10, letterSpacing: 6, textTransform: 'uppercase', color: colors.accent, fontWeight: 700, marginBottom: 14, fontFamily: bf }}>
              TRUST
            </div>
            <div style={{ fontFamily: hf, fontSize: 26, fontWeight: 800, color: colors.text, wordBreak: 'keep-all' }}>
              {title}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {items.slice(0, 6).map((item, i) => (
              <div key={i} style={{
                background: hexToRgba(colors.accent, 0.07),
                border: `1px solid ${hexToRgba(colors.accent, 0.2)}`,
                borderRadius: 12,
                padding: '20px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: hexToRgba(colors.accent, 0.14),
                  border: `1px solid ${hexToRgba(colors.accent, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  color: colors.accent,
                  fontFamily: hf,
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, wordBreak: 'keep-all', lineHeight: 1.45, fontFamily: bf }}>
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'cta': {
      const lines = body.split('\n').filter(l => l.trim());
      const ctaHead = title || lines[0] || '지금 바로 시작하세요';
      const ctaSub = lines.slice(1, 3).join(' ') || '';
      return (
        <div ref={canvasRef} style={{
          ...base,
          minHeight: 300,
          background: `linear-gradient(140deg, ${colors.accent} 0%, ${darken(colors.accent, 0.28)} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
          gap: 20,
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: hf, fontSize: 34, fontWeight: 900, color: '#fff', wordBreak: 'keep-all', lineHeight: 1.3, textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
            {ctaHead}
          </div>
          {ctaSub && (
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', wordBreak: 'keep-all', maxWidth: 520, lineHeight: 1.6, fontFamily: bf }}>
              {ctaSub}
            </div>
          )}
          <div style={{
            marginTop: 12,
            background: '#fff',
            color: colors.accent,
            padding: '14px 40px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: 0.4,
            fontFamily: bf,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}>
            구매하기
          </div>
        </div>
      );
    }

    default:
      return (
        <div ref={canvasRef} style={{ ...base, background: colors.bg, padding: 40 }}>
          <div style={{ fontFamily: hf, fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 16 }}>{title}</div>
          <div style={{ fontSize: 14, color: hexToRgba(colors.text, 0.65), lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>{body}</div>
        </div>
      );
  }
}

// ===== Available Korean fonts =====

const FONT_OPTIONS = [
  { label: 'Noto Sans KR', value: 'Noto Sans KR' },
  { label: 'Noto Serif KR', value: 'Noto Serif KR' },
  { label: 'Black Han Sans', value: 'Black Han Sans' },
  { label: 'Jua', value: 'Jua' },
];

// ===== Main component =====

export default function Step4ImageEditor() {
  const { state, dispatch } = useDetailPage();
  const { manuscriptSections, productPhotos, colorPalette, fontRecommendation, productInfo } = state;

  const visibleSections = [...manuscriptSections]
    .sort((a, b) => a.order - b.order)
    .filter(s => s.visible);

  const [selectedId, setSelectedId] = useState<string>(() => visibleSections[0]?.id || '');
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [removedBgUrl, setRemovedBgUrl] = useState<string | null>(null);
  const [removingBg, setRemovingBg] = useState(false);
  const [bgRemoveError, setBgRemoveError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<'none' | 'section' | 'all'>('none');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [resolution, setResolution] = useState<1 | 2>(2);
  const [headlineFont, setHeadlineFont] = useState<string>('');
  const [bodyFont, setBodyFont] = useState<string>('');

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Derive fonts from AI recommendations on mount
  useEffect(() => {
    const hl = fontRecommendation ? extractFontName(fontRecommendation.headline) : 'Noto Sans KR';
    const bd = fontRecommendation ? extractFontName(fontRecommendation.body) : 'Noto Sans KR';
    setHeadlineFont(hl);
    setBodyFont(bd);
  }, [fontRecommendation]);

  // Load fonts when they change
  useEffect(() => {
    if (headlineFont) loadGoogleFont(headlineFont);
    if (bodyFont && bodyFont !== headlineFont) loadGoogleFont(bodyFont);
    loadGoogleFont('Noto Sans KR');
  }, [headlineFont, bodyFont]);

  // Build canvas colors from AI palette
  const colors: CanvasColors = {
    bg: colorPalette?.colors[0]?.hex || '#0f1729',
    bg2: colorPalette?.colors[1]?.hex || '#1a2744',
    text: colorPalette?.colors[2]?.hex || '#f0f0f0',
    accent: colorPalette?.accent?.hex || '#c3c0ff',
  };

  const productPhotoUrl = productPhotos.length > 0 ? productPhotos[0].dataUrl : null;

  const selectedSection = visibleSections.find(s => s.id === selectedId) || visibleSections[0];
  const selectedIdx = visibleSections.findIndex(s => s.id === selectedId);

  const getPhotoForSection = useCallback((sectionId: string): string | null => {
    return customImages[sectionId] || removedBgUrl || productPhotoUrl;
  }, [customImages, removedBgUrl, productPhotoUrl]);

  // Background removal
  const handleRemoveBg = async () => {
    if (!productPhotoUrl) return;
    setRemovingBg(true);
    setBgRemoveError(null);
    try {
      // Dynamic import with CDN-hosted WASM to avoid webpack issues
      const { removeBackground } = await import('@imgly/background-removal');
      const res = await fetch(productPhotoUrl);
      const blob = await res.blob();
      const resultBlob = await removeBackground(blob, {
        publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/',
        debug: false,
      });
      const url = URL.createObjectURL(resultBlob);
      setRemovedBgUrl(url);
    } catch (e) {
      console.error('Background removal failed:', e);
      setBgRemoveError('배경 제거에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setRemovingBg(false);
    }
  };

  // Image upload for a section
  const handleImageUpload = (sectionId: string) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.dataset.sectionId = sectionId;
    fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const sectionId = e.target.dataset.sectionId;
    if (!file || !sectionId) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setCustomImages(prev => ({ ...prev, [sectionId]: ev.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Download single section
  const downloadSection = async (sectionId: string) => {
    const el = allSectionRefs.current[sectionId];
    if (!el) return;
    setDownloading('section');
    try {
      await document.fonts.ready;
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        scale: resolution,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const section = visibleSections.find(s => s.id === sectionId);
      const link = document.createElement('a');
      link.download = `${productInfo.name || 'detail'}_${SECTION_LABEL_MAP[section?.sectionType ?? 'hero']}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Section download failed:', e);
    } finally {
      setDownloading('none');
    }
  };

  // Download all sections merged
  const downloadAll = async () => {
    setDownloading('all');
    setDownloadProgress(0);
    const originalId = selectedId;
    try {
      await document.fonts.ready;
      const html2canvas = (await import('html2canvas')).default;
      const canvases: HTMLCanvasElement[] = [];

      for (let i = 0; i < visibleSections.length; i++) {
        const section = visibleSections[i];
        setSelectedId(section.id);
        setDownloadProgress(Math.round(((i) / visibleSections.length) * 90));
        // Wait for React render + image load
        await new Promise(r => setTimeout(r, 200));
        const el = allSectionRefs.current[section.id];
        if (el) {
          const canvas = await html2canvas(el, {
            scale: resolution,
            useCORS: true,
            allowTaint: true,
            logging: false,
          });
          canvases.push(canvas);
        }
      }

      if (canvases.length > 0) {
        const totalH = canvases.reduce((s, c) => s + c.height, 0);
        const merged = document.createElement('canvas');
        merged.width = canvases[0].width;
        merged.height = totalH;
        const ctx = merged.getContext('2d')!;
        let y = 0;
        for (const c of canvases) {
          ctx.drawImage(c, 0, y);
          y += c.height;
        }
        setDownloadProgress(100);
        const link = document.createElement('a');
        link.download = `${productInfo.name || 'detail'}_상세페이지_전체.png`;
        link.href = merged.toDataURL('image/png');
        link.click();
      }
    } catch (e) {
      console.error('Download all failed:', e);
    } finally {
      setSelectedId(originalId);
      setDownloading('none');
      setDownloadProgress(0);
    }
  };

  if (visibleSections.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto text-center py-16 space-y-4">
        <p className="text-[#e5e2e1]/40">편집할 섹션이 없습니다. 원고를 먼저 생성해주세요.</p>
        <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>이전으로</Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-headline font-extrabold text-[#e5e2e1] mb-2">이미지 에디터</h2>
        <p className="text-[#c7c4d8] text-sm">
          AI 추천 컬러와 폰트가 적용된 상세페이지를 확인하고 PNG로 다운로드하세요.
        </p>
      </div>

      {/* Settings bar */}
      <div className="max-w-[960px] mx-auto flex flex-wrap gap-2.5 items-center">
        {/* Color palette */}
        {colorPalette && (
          <div className="flex items-center gap-2 bg-[#1c1b1b] rounded-lg px-3 py-2 border border-[#464555]/15">
            <Palette className="w-3.5 h-3.5 text-[#c3c0ff]/50 flex-shrink-0" />
            <div className="flex gap-1.5">
              {[...colorPalette.colors, colorPalette.accent].map((c, i) => (
                <div
                  key={i}
                  title={c.label}
                  style={{ background: c.hex }}
                  className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0"
                />
              ))}
            </div>
            <span className="text-[11px] text-[#c7c4d8]/50 ml-1 hidden sm:inline">{colorPalette.rationale}</span>
          </div>
        )}

        {/* Font selector headline */}
        <div className="flex items-center gap-2 bg-[#1c1b1b] rounded-lg px-3 py-2 border border-[#464555]/15">
          <Type className="w-3.5 h-3.5 text-[#c3c0ff]/50 flex-shrink-0" />
          <select
            value={headlineFont}
            onChange={e => { setHeadlineFont(e.target.value); loadGoogleFont(e.target.value); }}
            className="bg-transparent text-xs text-[#c7c4d8] outline-none cursor-pointer"
          >
            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value} className="bg-[#1c1b1b]">{f.label}</option>)}
          </select>
          <span className="text-[#464555]/40">/</span>
          <select
            value={bodyFont}
            onChange={e => { setBodyFont(e.target.value); loadGoogleFont(e.target.value); }}
            className="bg-transparent text-xs text-[#c7c4d8] outline-none cursor-pointer"
          >
            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value} className="bg-[#1c1b1b]">{f.label}</option>)}
          </select>
        </div>

        {/* Resolution */}
        <div className="flex items-center gap-1 bg-[#1c1b1b] rounded-lg p-1 border border-[#464555]/15">
          {([1, 2] as const).map(r => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                resolution === r ? 'bg-[#c3c0ff] text-[#0f0069]' : 'text-[#e5e2e1]/50 hover:text-[#e5e2e1]'
              }`}
            >
              {r}x
            </button>
          ))}
        </div>

        {/* BG removal */}
        {productPhotoUrl && (
          <button
            onClick={handleRemoveBg}
            disabled={removingBg}
            className={`flex items-center gap-2 bg-[#1c1b1b] rounded-lg px-3 py-2 border transition-all text-xs disabled:opacity-50 ${
              removedBgUrl
                ? 'border-[#c3c0ff]/30 text-[#c3c0ff]'
                : 'border-[#464555]/15 text-[#c7c4d8] hover:border-[#c3c0ff]/20 hover:text-[#e5e2e1]'
            }`}
          >
            {removingBg ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {removingBg ? '배경 제거 중...' : removedBgUrl ? '배경 제거됨' : '배경 제거'}
          </button>
        )}

        {removedBgUrl && (
          <button
            onClick={() => setRemovedBgUrl(null)}
            className="flex items-center gap-1.5 text-xs text-[#e5e2e1]/40 hover:text-[#e5e2e1] transition-colors px-2 py-2 rounded-lg border border-[#464555]/15"
            title="배경 제거 취소"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {bgRemoveError && (
          <span className="text-xs text-red-400/80">{bgRemoveError}</span>
        )}
      </div>

      {/* Editor layout */}
      <div className="max-w-[1100px] mx-auto flex gap-5 items-start">

        {/* Section sidebar */}
        <div className="w-40 flex-shrink-0 sticky top-28 space-y-1.5">
          <div className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/35 mb-3 ml-1 font-label">
            섹션 목록 ({visibleSections.length})
          </div>
          {visibleSections.map((section, i) => (
            <button
              key={section.id}
              onClick={() => setSelectedId(section.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all ${
                selectedId === section.id
                  ? 'bg-[#c3c0ff]/10 border border-[#c3c0ff]/30 text-[#c3c0ff]'
                  : 'bg-[#1c1b1b] border border-[#464555]/12 text-[#c7c4d8] hover:border-[#c3c0ff]/20 hover:text-[#e5e2e1]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${
                  selectedId === section.id ? 'bg-[#c3c0ff] text-[#0f0069]' : 'bg-[#2a2a2a] text-[#e5e2e1]/40'
                }`}>{i + 1}</span>
                <span className="font-medium">{SECTION_LABEL_MAP[section.sectionType]}</span>
              </div>
              <div className="text-[10px] opacity-50 mt-1 truncate ml-6">{section.title}</div>
            </button>
          ))}
        </div>

        {/* Canvas area */}
        <div className="flex-1 min-w-0 space-y-4">
          {selectedSection && (
            <>
              {/* Section toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#c3c0ff]/50" />
                  <span className="text-sm font-semibold text-[#e5e2e1]">
                    {SECTION_LABEL_MAP[selectedSection.sectionType]}
                  </span>
                  <span className="text-xs text-[#c7c4d8]/50">— {selectedSection.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Prev/Next section */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => selectedIdx > 0 && setSelectedId(visibleSections[selectedIdx - 1].id)}
                      disabled={selectedIdx === 0}
                      className="p-1.5 rounded-lg border border-[#464555]/15 text-[#e5e2e1]/40 hover:text-[#e5e2e1] hover:border-[#c3c0ff]/20 disabled:opacity-20 transition-all"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => selectedIdx < visibleSections.length - 1 && setSelectedId(visibleSections[selectedIdx + 1].id)}
                      disabled={selectedIdx === visibleSections.length - 1}
                      className="p-1.5 rounded-lg border border-[#464555]/15 text-[#e5e2e1]/40 hover:text-[#e5e2e1] hover:border-[#c3c0ff]/20 disabled:opacity-20 transition-all"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Image replace */}
                  <button
                    onClick={() => handleImageUpload(selectedSection.id)}
                    className="flex items-center gap-1.5 text-xs text-[#c7c4d8] hover:text-[#e5e2e1] transition-colors px-3 py-1.5 rounded-lg border border-[#464555]/15 hover:border-[#c3c0ff]/20"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    이미지 교체
                  </button>
                  {customImages[selectedSection.id] && (
                    <button
                      onClick={() => setCustomImages(prev => { const n = { ...prev }; delete n[selectedSection.id]; return n; })}
                      className="p-1.5 rounded-lg border border-[#464555]/15 text-[#e5e2e1]/40 hover:text-[#e5e2e1] hover:border-[#464555]/30 transition-all"
                      title="교체 이미지 제거"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Download section */}
                  <button
                    onClick={() => downloadSection(selectedSection.id)}
                    disabled={downloading !== 'none'}
                    className="flex items-center gap-1.5 text-xs bg-[#c3c0ff]/10 border border-[#c3c0ff]/20 text-[#c3c0ff] hover:bg-[#c3c0ff]/18 transition-all px-3 py-1.5 rounded-lg disabled:opacity-40"
                  >
                    {downloading === 'section' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    PNG 저장
                  </button>
                </div>
              </div>

              {/* Section canvas */}
              <div className="overflow-x-auto rounded-2xl border border-[#464555]/12 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
                <SectionCanvas
                  key={`${selectedSection.id}-${headlineFont}-${bodyFont}`}
                  sectionType={selectedSection.sectionType}
                  title={selectedSection.title}
                  body={selectedSection.body}
                  photoUrl={getPhotoForSection(selectedSection.id)}
                  colors={colors}
                  headlineFont={headlineFont || 'Noto Sans KR'}
                  bodyFont={bodyFont || 'Noto Sans KR'}
                  canvasRef={el => {
                    sectionRef.current = el;
                    allSectionRefs.current[selectedSection.id] = el;
                  }}
                />
              </div>

              {/* Width badge */}
              <div className="text-center text-[10px] text-[#e5e2e1]/20 tracking-wider font-label">
                860px — 네이버 스마트스토어 기준 폭
              </div>

              {/* Image guide hint */}
              {selectedSection.imageGuide && (
                <div className="bg-[#1c1b1b] rounded-xl px-4 py-3 border border-[#464555]/10">
                  <div className="text-[10px] uppercase tracking-widest text-[#c3c0ff]/40 mb-1 font-label">이미지 가이드</div>
                  <p className="text-xs text-[#c7c4d8]/60 leading-relaxed">{selectedSection.imageGuide}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Download all progress */}
      {downloading === 'all' && (
        <div className="max-w-[960px] mx-auto">
          <div className="bg-[#1c1b1b] rounded-xl px-5 py-4 border border-[#c3c0ff]/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#c7c4d8]">전체 상세페이지 렌더링 중...</span>
              <span className="text-xs text-[#c3c0ff]">{downloadProgress}%</span>
            </div>
            <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#c3c0ff] rounded-full"
                animate={{ width: `${downloadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="max-w-[1100px] mx-auto border-t border-[#464555]/10 pt-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
            이전 (원고 수정)
          </Button>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadAll}
              disabled={downloading !== 'none'}
              className="flex items-center gap-2 bg-[#1c1b1b] border border-[#464555]/15 text-[#c7c4d8] hover:text-[#e5e2e1] hover:border-[#c3c0ff]/20 transition-all px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40"
            >
              {downloading === 'all' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              전체 1장 저장
            </button>
            <Button size="lg" onClick={() => dispatch({ type: 'NEXT_STEP' })}>
              다음: 내보내기
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
