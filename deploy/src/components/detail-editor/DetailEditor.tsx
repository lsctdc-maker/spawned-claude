'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useDetailPage } from '@/hooks/useDetailPage';
import { ManuscriptSection, ManuscriptSectionType } from '@/lib/types';
import {
  ChevronLeft, Download, ZoomIn, ZoomOut, Undo2, Redo2, Save,
  Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  Type, Image as ImageIcon, Palette, AlignLeft, Sliders, Sparkles,
  LayoutGrid, Layers,
} from 'lucide-react';
import { toPng } from 'html-to-image';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionOverride {
  title?: string;
  body?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  paddingY?: number;
  fontSize?: number;
  imageUrl?: string;
}

interface HistoryEntry {
  sections: ManuscriptSection[];
  overrides: Record<string, SectionOverride>;
}

type PropTab = 'text' | 'typography' | 'colors' | 'image' | 'spacing' | 'ai';

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<ManuscriptSectionType, string> = {
  hooking: '후킹', hero: '히어로', problem: '문제 공감', solution: '솔루션',
  features: '핵심 특장점', detail: '상세 설명', howto: '사용 방법',
  social_proof: '고객 후기', trust: '인증/신뢰', specs: '스펙',
  guarantee: '보증/환불', event_banner: '이벤트', cta: '구매 유도',
};

const ADDABLE_SECTIONS: { type: ManuscriptSectionType; label: string; desc: string }[] = [
  { type: 'hooking', label: '후킹/히어로', desc: '제품 첫인상' },
  { type: 'problem', label: '문제 공감', desc: '고객 페인 포인트' },
  { type: 'solution', label: '솔루션', desc: '해결책 제시' },
  { type: 'features', label: '핵심 특장점', desc: '기능/장점 카드' },
  { type: 'detail', label: '상세 설명', desc: '제품 디테일' },
  { type: 'howto', label: '사용 방법', desc: 'Step 1-4' },
  { type: 'social_proof', label: '고객 후기', desc: '리뷰 카드' },
  { type: 'trust', label: '인증/수상', desc: '배지 그리드' },
  { type: 'specs', label: '스펙 테이블', desc: '상세 사양' },
  { type: 'guarantee', label: '보증/환불', desc: '안심 보장' },
  { type: 'cta', label: '구매 유도', desc: 'CTA 버튼' },
  { type: 'event_banner', label: '이벤트 배너', desc: '할인/프로모' },
];

const SECTION_ICON: Record<string, string> = {
  hooking: '🔥', hero: '🔥', problem: '😰', solution: '💡',
  features: '⭐', detail: '📋', howto: '📖', social_proof: '💬',
  trust: '🏆', specs: '🔩', guarantee: '🛡️', event_banner: '🎉', cta: '🛒',
};

// ─── Canvas Section Renderers ─────────────────────────────────────────────────

interface RenderCtx {
  section: ManuscriptSection;
  override: SectionOverride;
  colors: { primary: string; secondary: string; text: string; accent: string };
  productPhotoUrl: string | null;
  selected: boolean;
  onClick: () => void;
  canvasWidth: number;
}

function HeroSectionHTML({ section, override, colors, productPhotoUrl, selected, onClick }: RenderCtx) {
  const bg = override.bgColor || colors.primary;
  const accent = override.accentColor || colors.accent;
  const textCol = override.textColor || '#FFFFFF';
  const title = ( override.title ?? section.title) || '제품명을 입력하세요';
  const body = ( override.body ?? section.body) || '제품의 핵심 가치를 한 줄로';
  const py = override.paddingY ?? 80;

  return (
    <div
      onClick={onClick}
      style={{ background: bg, paddingTop: py, paddingBottom: py, cursor: 'pointer', outline: selected ? `3px solid ${accent}` : 'none', outlineOffset: -3 }}
      className="relative w-full overflow-hidden"
    >
      {/* Decorative blob */}
      <div style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)` }} className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="relative flex flex-col items-center text-center px-12 gap-6">
        {/* Product image */}
        {productPhotoUrl ? (
          <img src={productPhotoUrl} alt="product" className="w-48 h-48 object-contain drop-shadow-2xl rounded-2xl" />
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.08)', border: '2px dashed rgba(255,255,255,0.2)' }} className="w-48 h-48 rounded-2xl flex items-center justify-center">
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>제품 이미지</span>
          </div>
        )}
        {/* Accent bar */}
        <div style={{ background: accent, width: 48, height: 3, borderRadius: 2 }} />
        <h1 style={{ color: textCol, fontSize: override.fontSize ?? 40, fontWeight: 900, lineHeight: 1.2, maxWidth: 680 }}>{title}</h1>
        <p style={{ color: `${textCol}CC`, fontSize: 17, lineHeight: 1.8, maxWidth: 560 }}>{body}</p>
        {/* CTA pill */}
        <button style={{ background: accent, color: '#fff', padding: '14px 36px', borderRadius: 40, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'default', boxShadow: `0 8px 24px ${accent}55` }}>
          지금 구매하기 →
        </button>
      </div>
    </div>
  );
}

function PainSectionHTML({ section, override, colors, selected, onClick }: RenderCtx) {
  const bg = override.bgColor || '#FFFFFF';
  const accent = override.accentColor || colors.accent;
  const title = ( override.title ?? section.title) || '이런 고민, 공감되시나요?';
  const body = ( override.body ?? section.body) || '고민 1\n고민 2\n고민 3';
  const cards = body.split('\n').filter(l => l.trim()).slice(0, 3);
  const emojis = ['😫', '😔', '😤'];
  const py = override.paddingY ?? 64;

  return (
    <div onClick={onClick} style={{ background: bg, paddingTop: py, paddingBottom: py, cursor: 'pointer', outline: selected ? `3px solid ${accent}` : 'none', outlineOffset: -3 }}>
      <div className="flex flex-col items-center px-12 gap-10">
        <div className="flex flex-col items-center gap-2">
          <div style={{ background: accent, width: 40, height: 3, borderRadius: 2 }} />
          <h2 style={{ fontSize: override.fontSize ?? 34, fontWeight: 900, color: '#191F28', textAlign: 'center' }}>{title}</h2>
        </div>
        <div className="flex gap-5 w-full justify-center">
          {cards.map((card, i) => (
            <div key={i} style={{ background: '#F8F9FA', borderRadius: 20, padding: '32px 24px', flex: 1, maxWidth: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: 36 }}>{emojis[i] || '😟'}</span>
              <p style={{ fontSize: 14, color: '#4E5968', textAlign: 'center', lineHeight: 1.7 }}>{card.trim()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SolutionSectionHTML({ section, override, colors, selected, onClick }: RenderCtx) {
  const accent = override.accentColor || colors.accent;
  const bg = override.bgColor || `${accent}11`;
  const title = ( override.title ?? section.title) || '이제 해결됩니다';
  const body = ( override.body ?? section.body) || '제품이 어떻게 문제를 해결하는지 설명';
  const py = override.paddingY ?? 64;

  return (
    <div onClick={onClick} style={{ background: bg, paddingTop: py, paddingBottom: py, cursor: 'pointer', outline: selected ? `3px solid ${accent}` : 'none', outlineOffset: -3 }}>
      <div className="flex flex-col items-center px-12 gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div style={{ background: accent, width: 40, height: 3, borderRadius: 2 }} />
          <h2 style={{ fontSize: override.fontSize ?? 34, fontWeight: 900, color: '#191F28' }}>{title}</h2>
        </div>
        <p style={{ fontSize: 16, color: '#4E5968', lineHeight: 1.9, maxWidth: 600 }}>{body}</p>
        <div className="flex gap-6">
          {['즉각적인 효과', '안전한 성분', '지속되는 결과'].map((cp, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: accent, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</div>
              <span style={{ fontSize: 14, color: '#191F28', fontWeight: 600 }}>{cp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturesSectionHTML({ section, override, colors, selected, onClick }: RenderCtx) {
  const bg = override.bgColor || colors.primary;
  const accent = override.accentColor || colors.accent;
  const textCol = override.textColor || '#FFFFFF';
  const title = ( override.title ?? section.title) || '핵심 특장점';
  const body = ( override.body ?? section.body) || '특장점 1\n특장점 2\n특장점 3\n특장점 4';
  const items = body.split('\n').filter(l => l.trim()).slice(0, 4);
  const cardColors = ['#1a2f4a', '#1a3a2f', '#3a1a2f', '#2a2a1a'];
  const py = override.paddingY ?? 64;

  return (
    <div onClick={onClick} style={{ background: bg, paddingTop: py, paddingBottom: py, cursor: 'pointer', outline: selected ? `3px solid ${accent}` : 'none', outlineOffset: -3 }}>
      <div className="flex flex-col items-center px-12 gap-10">
        <div className="flex flex-col items-center gap-2">
          <div style={{ background: 'rgba(255,255,255,0.4)', width: 40, height: 3, borderRadius: 2 }} />
          <h2 style={{ fontSize: override.fontSize ?? 34, fontWeight: 900, color: textCol, textAlign: 'center' }}>{title}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', maxWidth: 760 }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: cardColors[i] || 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ background: accent, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 900, marginBottom: 14 }}>
                0{i + 1}
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{item.trim()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpecsSectionHTML({ section, override, colors, selected, onClick }: RenderCtx) {
  const accent = override.accentColor || colors.accent;
  const bg = override.bgColor || '#F4F5F7';
  const title = ( override.title ?? section.title) || '제품 상세 스펙';
  const body = ( override.body ?? section.body) || '용량: -\n성분: -\n원산지: -\n유통기한: -';
  const specs = body.split('\n').filter(l => l.trim()).slice(0, 8);
  const py = override.paddingY ?? 64;

  return (
    <div onClick={onClick} style={{ background: bg, paddingTop: py, paddingBottom: py, cursor: 'pointer', outline: selected ? `3px solid ${accent}` : 'none', outlineOffset: -3 }}>
      <div className="flex flex-col items-center px-12 gap-8">
        <div className="flex flex-col items-center gap-2">
          <div style={{ background: accent, width: 40, height: 3, borderRadius: 2 }} />
          <h2 style={{ fontSize: override.fontSize ?? 32, fontWeight: 900, color: '#191F28', textAlign: 'center' }}>{title}</h2>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E8EB', overflow: 'hidden', width: '100%', maxWidth: 640 }}>
          {specs.map((spec, i) => {
            const [label, value] = spec.includes(':') ? spec.split(':').map(s => s.trim()) : [spec, '-'];
            return (
              <div key={i} style={{ display: 'flex', padding: '14px 24px', borderBottom: i < specs.length - 1 ? '1px solid #E5E8EB' : 'none', background: i % 2 === 0 ? '#FAFBFC' : '#fff' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#191F28', width: 160, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, color: '#4E5968' }}>{value || '-'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReviewsSectionHTML({ section, override, colors, selected, onClick }: RenderCtx) {
  const accent = override.accentColor || colors.accent;
  const bg = override.bgColor || '#FFFFFF';
  const title = ( override.title ?? section.title) || '고객 후기';
  const body = ( override.body ?? section.body) || '정말 만족스러운 제품이에요!\n생각보다 효과가 빨랐어요.\n주변에 추천하고 싶은 제품입니다.';
  const reviews = body.split('\n').filter(l => l.trim()).slice(0, 3);
  const names = ['김민수', '이지영', '박서준'];
  const py = override.paddingY ?? 64;

  return (
    <div onClick={onClick} style={{ background: bg, paddingTop: py, paddingBottom: py, cursor: 'pointer', outline: selected ? `3px solid ${accent}` : 'none', outlineOffset: -3 }}>
      <div className="flex flex-col items-center px-12 gap-10">
        <div className="flex flex-col items-center gap-2">
          <div style={{ background: accent, width: 40, height: 3, borderRadius: 2 }} />
          <h2 style={{ fontSize: override.fontSize ?? 32, fontWeight: 900, color: '#191F28', textAlign: 'center' }}>{title}</h2>
        </div>
        <div className="flex gap-4 w-full" style={{ maxWidth: 800 }}>
          {reviews.map((rev, i) => (
            <div key={i} style={{ background: '#F8F9FA', borderRadius: 20, padding: '24px', flex: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {['👤', '👩', '🧑'][i]}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#191F28' }}>{names[i]}</div>
                  <div style={{ color: '#F5A623', fontSize: 11 }}>★★★★★</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#4E5968', lineHeight: 1.7 }}>{rev.trim()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CertSectionHTML({ section, override, colors, selected, onClick }: RenderCtx) {
  const accent = override.accentColor || colors.accent;
  const bg = override.bgColor || '#F4F5F7';
  const title = ( override.title ?? section.title) || '인증 및 수상';
  const body = ( override.body ?? section.body) || 'HACCP\nISO 9001\n친환경 인증\n안전인증';
  const certs = body.split('\n').filter(l => l.trim()).slice(0, 4);
  const py = override.paddingY ?? 56;

  return (
    <div onClick={onClick} style={{ background: bg, paddingTop: py, paddingBottom: py, cursor: 'pointer', outline: selected ? `3px solid ${accent}` : 'none', outlineOffset: -3 }}>
      <div className="flex flex-col items-center px-12 gap-8">
        <div className="flex flex-col items-center gap-2">
          <div style={{ background: accent, width: 40, height: 3, borderRadius: 2 }} />
          <h2 style={{ fontSize: override.fontSize ?? 32, fontWeight: 900, color: '#191F28', textAlign: 'center' }}>{title}</h2>
        </div>
        <div className="flex gap-6 flex-wrap justify-center">
          {certs.map((cert, i) => (
            <div key={i} style={{ width: 110, height: 110, borderRadius: '50%', background: '#FFFFFF', border: `3px solid ${accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <span style={{ fontSize: 26 }}>🏅</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#191F28', textAlign: 'center', padding: '0 8px' }}>{cert.trim()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CTASectionHTML({ section, override, colors, selected, onClick }: RenderCtx) {
  const primary = override.bgColor || colors.primary;
  const accent = override.accentColor || colors.accent;
  const textCol = override.textColor || '#FFFFFF';
  const title = ( override.title ?? section.title) || '지금 바로 시작하세요';
  const body = ( override.body ?? section.body) || '특별한 혜택을 놓치지 마세요';
  const py = override.paddingY ?? 80;

  return (
    <div onClick={onClick} style={{ background: `linear-gradient(135deg, ${primary} 0%, ${accent}88 100%)`, paddingTop: py, paddingBottom: py, cursor: 'pointer', position: 'relative', overflow: 'hidden', outline: selected ? `3px solid ${accent}` : 'none', outlineOffset: -3 }}>
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      </div>
      <div className="relative flex flex-col items-center text-center px-12 gap-6">
        <h2 style={{ fontSize: override.fontSize ?? 40, fontWeight: 900, color: textCol, lineHeight: 1.2 }}>{title}</h2>
        <div style={{ background: accent, width: 48, height: 3, borderRadius: 2 }} />
        <p style={{ fontSize: 17, color: `${textCol}CC`, maxWidth: 520, lineHeight: 1.8 }}>{body}</p>
        <button style={{ marginTop: 8, background: '#FFFFFF', color: primary, padding: '16px 48px', borderRadius: 40, fontSize: 17, fontWeight: 900, border: 'none', cursor: 'default', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          지금 구매하기 →
        </button>
      </div>
    </div>
  );
}

function GenericSectionHTML({ section, override, colors, selected, onClick }: RenderCtx) {
  const accent = override.accentColor || colors.accent;
  const bg = override.bgColor || '#FFFFFF';
  const title = ( override.title ?? section.title) || '섹션 제목';
  const body = ( override.body ?? section.body) || '섹션 내용을 입력하세요';
  const py = override.paddingY ?? 56;
  const label = SECTION_LABELS[section.sectionType] || section.sectionType;

  return (
    <div onClick={onClick} style={{ background: bg, paddingTop: py, paddingBottom: py, cursor: 'pointer', outline: selected ? `3px solid ${accent}` : 'none', outlineOffset: -3 }}>
      <div className="flex flex-col items-center px-12 gap-6 text-center">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${accent}18`, padding: '4px 12px', borderRadius: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{SECTION_ICON[section.sectionType] || '📄'} {label}</span>
        </div>
        <div style={{ background: accent, width: 40, height: 3, borderRadius: 2 }} />
        <h2 style={{ fontSize: override.fontSize ?? 32, fontWeight: 900, color: '#191F28', maxWidth: 680 }}>{title}</h2>
        <p style={{ fontSize: 15, color: '#4E5968', lineHeight: 1.9, maxWidth: 600 }}>{body}</p>
      </div>
    </div>
  );
}

function renderSectionHTML(ctx: RenderCtx): React.ReactNode {
  switch (ctx.section.sectionType) {
    case 'hooking': case 'hero': return <HeroSectionHTML key={ctx.section.id} {...ctx} />;
    case 'problem': return <PainSectionHTML key={ctx.section.id} {...ctx} />;
    case 'solution': return <SolutionSectionHTML key={ctx.section.id} {...ctx} />;
    case 'features': case 'detail': return <FeaturesSectionHTML key={ctx.section.id} {...ctx} />;
    case 'specs': return <SpecsSectionHTML key={ctx.section.id} {...ctx} />;
    case 'social_proof': return <ReviewsSectionHTML key={ctx.section.id} {...ctx} />;
    case 'trust': return <CertSectionHTML key={ctx.section.id} {...ctx} />;
    case 'cta': return <CTASectionHTML key={ctx.section.id} {...ctx} />;
    default: return <GenericSectionHTML key={ctx.section.id} {...ctx} />;
  }
}

// ─── Tool Sidebar ─────────────────────────────────────────────────────────────

function ToolSidebar({ activeTool, onToolChange }: { activeTool: PropTab | null; onToolChange: (t: PropTab) => void }) {
  const tools: { id: PropTab; icon: React.ReactNode; label: string }[] = [
    { id: 'text', icon: <Type className="w-5 h-5" />, label: '텍스트' },
    { id: 'typography', icon: <AlignLeft className="w-5 h-5" />, label: '타이포' },
    { id: 'colors', icon: <Palette className="w-5 h-5" />, label: '색상' },
    { id: 'image', icon: <ImageIcon className="w-5 h-5" />, label: '이미지' },
    { id: 'spacing', icon: <Sliders className="w-5 h-5" />, label: '간격' },
    { id: 'ai', icon: <Sparkles className="w-5 h-5" />, label: 'AI' },
  ];

  return (
    <div style={{ width: 56, background: '#0D0D11', borderRight: '1px solid #1E1E28', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, gap: 4, flexShrink: 0 }}>
      {tools.map(t => (
        <button
          key={t.id}
          title={t.label}
          onClick={() => onToolChange(t.id)}
          style={{
            width: 40, height: 40, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            background: activeTool === t.id ? '#3182F6' : 'transparent',
            color: activeTool === t.id ? '#FFFFFF' : '#636B77',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (activeTool !== t.id) (e.currentTarget as HTMLButtonElement).style.background = '#1A1A24'; }}
          onMouseLeave={e => { if (activeTool !== t.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────

interface SectionPanelProps {
  allSections: ManuscriptSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: ManuscriptSectionType) => void;
  onDelete: (id: string) => void;
  onReorder: (sections: ManuscriptSection[]) => void;
  onToggleVisibility: (id: string) => void;
}

function SectionPanel({ allSections, selectedId, onSelect, onAdd, onDelete, onReorder, onToggleVisibility }: SectionPanelProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const moveSection = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= allSections.length) return;
    const reordered = [...allSections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    onReorder(reordered.map((s, i) => ({ ...s, order: i })));
  };

  return (
    <div style={{ width: 220, background: '#13131A', borderRight: '1px solid #1E1E28', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #1E1E28', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Layers className="w-4 h-4" style={{ color: '#636B77' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#636B77', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          섹션 ({allSections.length})
        </span>
      </div>

      {/* Section list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {allSections.map((section, i) => {
          const isActive = section.id === selectedId;
          const isVisible = section.visible;
          return (
            <div
              key={section.id}
              style={{
                borderRadius: 10, marginBottom: 2, position: 'relative',
                background: isActive ? '#1E2D4A' : 'transparent',
                border: isActive ? '1px solid #3182F644' : '1px solid transparent',
                opacity: isVisible ? 1 : 0.45,
              }}
              className="group"
            >
              <button
                onClick={() => onSelect(section.id)}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 900, flexShrink: 0,
                  background: isActive ? '#3182F6' : '#1E1E2E',
                  color: isActive ? '#FFFFFF' : '#636B77',
                }}>
                  {i + 1}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#A8C8FF' : '#9BA3AD', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {SECTION_ICON[section.sectionType]} {SECTION_LABELS[section.sectionType] || section.sectionType}
                  </div>
                  <div style={{ fontSize: 10, color: '#4E5968', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {(section.title || '제목 없음').slice(0, 16)}
                  </div>
                </div>
              </button>

              {/* Hover actions */}
              <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', display: 'none', alignItems: 'center', gap: 2 }} className="group-hover:!flex">
                <button onClick={e => { e.stopPropagation(); moveSection(i, -1); }} disabled={i === 0}
                  style={{ background: 'none', border: 'none', color: '#636B77', cursor: 'pointer', padding: 3, borderRadius: 4, opacity: i === 0 ? 0.3 : 1 }} title="위로">
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button onClick={e => { e.stopPropagation(); moveSection(i, 1); }} disabled={i === allSections.length - 1}
                  style={{ background: 'none', border: 'none', color: '#636B77', cursor: 'pointer', padding: 3, borderRadius: 4, opacity: i === allSections.length - 1 ? 0.3 : 1 }} title="아래로">
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button onClick={e => { e.stopPropagation(); onToggleVisibility(section.id); }}
                  style={{ background: 'none', border: 'none', color: '#636B77', cursor: 'pointer', padding: 3, borderRadius: 4 }} title={isVisible ? '숨기기' : '표시'}>
                  {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button onClick={e => { e.stopPropagation(); if (window.confirm('삭제하시겠습니까?')) onDelete(section.id); }}
                  style={{ background: 'none', border: 'none', color: '#636B77', cursor: 'pointer', padding: 3, borderRadius: 4 }} title="삭제">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add section button */}
      <div style={{ padding: '10px', borderTop: '1px solid #1E1E28', position: 'relative' }}>
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#1E2D4A', border: '1px solid #3182F644', borderRadius: 10, color: '#3182F6', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus className="w-4 h-4" />
          섹션 추가
        </button>
        {showAddMenu && (
          <div style={{ position: 'absolute', bottom: '100%', left: 10, right: 10, marginBottom: 8, background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 12, boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', maxHeight: 360, overflowY: 'auto', zIndex: 50 }}>
            <div style={{ padding: 8 }}>
              {ADDABLE_SECTIONS.map(({ type, label, desc }) => (
                <button
                  key={type}
                  onClick={() => { onAdd(type); setShowAddMenu(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'block' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#22222E')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#C9D1D9' }}>{SECTION_ICON[type]} {label}</div>
                  <div style={{ fontSize: 10, color: '#636B77', marginTop: 2 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Properties Panel ─────────────────────────────────────────────────────────

interface PropPanelProps {
  selected: ManuscriptSection | null;
  override: SectionOverride;
  activeTool: PropTab;
  colors: { primary: string; secondary: string; text: string; accent: string };
  onOverrideChange: (patch: Partial<SectionOverride>) => void;
  onSectionDataChange: (patch: { title?: string; body?: string }) => void;
  onImageUpload: (dataUrl: string) => void;
  onAIRewrite: () => void;
  isAILoading: boolean;
}

function PropPanel({ selected, override, activeTool, colors, onOverrideChange, onSectionDataChange, onImageUpload, onAIRewrite, isAILoading }: PropPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 600, color: '#636B77', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, display: 'block' };
  const inputStyle: React.CSSProperties = { width: '100%', background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 8, color: '#C9D1D9', fontSize: 12, padding: '8px 10px', outline: 'none', resize: 'none' };
  const sectionStyle: React.CSSProperties = { marginBottom: 20 };

  if (!selected) {
    return (
      <div style={{ width: 260, background: '#13131A', borderLeft: '1px solid #1E1E28', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', color: '#4E5968', padding: 24 }}>
          <LayoutGrid className="w-8 h-8 mx-auto mb-3" style={{ opacity: 0.3 }} />
          <p style={{ fontSize: 12 }}>섹션을 클릭하여<br />선택하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: 260, background: '#13131A', borderLeft: '1px solid #1E1E28', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #1E1E28' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#C9D1D9' }}>
          {SECTION_ICON[selected.sectionType]} {SECTION_LABELS[selected.sectionType] || selected.sectionType}
        </div>
        <div style={{ fontSize: 10, color: '#636B77', marginTop: 2 }}>섹션 속성</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

        {/* TEXT TAB */}
        {activeTool === 'text' && (
          <>
            <div style={sectionStyle}>
              <label style={labelStyle}>섹션 제목</label>
              <input
                style={inputStyle}
                value={override.title ?? selected.title}
                onChange={e => onOverrideChange({ title: e.target.value })}
                placeholder="섹션 제목"
              />
            </div>
            <div style={sectionStyle}>
              <label style={labelStyle}>본문 내용</label>
              <textarea
                style={{ ...inputStyle, minHeight: 120 }}
                value={override.body ?? selected.body}
                onChange={e => onOverrideChange({ body: e.target.value })}
                placeholder="본문을 입력하세요"
              />
            </div>
            <div style={{ ...sectionStyle, display: 'flex', gap: 8 }}>
              <button
                onClick={() => onSectionDataChange({ title: override.title ?? selected.title, body: override.body ?? selected.body })}
                style={{ flex: 1, background: '#3182F6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >
                저장
              </button>
              <button
                onClick={() => onOverrideChange({ title: undefined, body: undefined })}
                style={{ flex: 1, background: '#1A1A24', color: '#9BA3AD', border: '1px solid #2A2A38', borderRadius: 8, padding: '8px', fontSize: 11, cursor: 'pointer' }}
              >
                원래대로
              </button>
            </div>
          </>
        )}

        {/* TYPOGRAPHY TAB */}
        {activeTool === 'typography' && (
          <div style={sectionStyle}>
            <label style={labelStyle}>제목 크기</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="range" min={20} max={60} step={1}
                value={override.fontSize ?? 34}
                onChange={e => onOverrideChange({ fontSize: Number(e.target.value) })}
                style={{ flex: 1, accentColor: '#3182F6' }}
              />
              <span style={{ fontSize: 11, color: '#9BA3AD', width: 32, textAlign: 'right' }}>{override.fontSize ?? 34}px</span>
            </div>
          </div>
        )}

        {/* COLORS TAB */}
        {activeTool === 'colors' && (
          <>
            <div style={sectionStyle}>
              <label style={labelStyle}>배경색</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={override.bgColor || colors.primary}
                  onChange={e => onOverrideChange({ bgColor: e.target.value })}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #2A2A38', cursor: 'pointer', padding: 2 }} />
                <span style={{ fontSize: 11, color: '#9BA3AD' }}>{override.bgColor || colors.primary}</span>
                <button onClick={() => onOverrideChange({ bgColor: undefined })} style={{ marginLeft: 'auto', fontSize: 10, color: '#636B77', background: 'none', border: 'none', cursor: 'pointer' }}>↺</button>
              </div>
            </div>
            <div style={sectionStyle}>
              <label style={labelStyle}>텍스트 색상</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={override.textColor || '#FFFFFF'}
                  onChange={e => onOverrideChange({ textColor: e.target.value })}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #2A2A38', cursor: 'pointer', padding: 2 }} />
                <span style={{ fontSize: 11, color: '#9BA3AD' }}>{override.textColor || '#FFFFFF'}</span>
                <button onClick={() => onOverrideChange({ textColor: undefined })} style={{ marginLeft: 'auto', fontSize: 10, color: '#636B77', background: 'none', border: 'none', cursor: 'pointer' }}>↺</button>
              </div>
            </div>
            <div style={sectionStyle}>
              <label style={labelStyle}>강조 색상</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={override.accentColor || colors.accent}
                  onChange={e => onOverrideChange({ accentColor: e.target.value })}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #2A2A38', cursor: 'pointer', padding: 2 }} />
                <span style={{ fontSize: 11, color: '#9BA3AD' }}>{override.accentColor || colors.accent}</span>
                <button onClick={() => onOverrideChange({ accentColor: undefined })} style={{ marginLeft: 'auto', fontSize: 10, color: '#636B77', background: 'none', border: 'none', cursor: 'pointer' }}>↺</button>
              </div>
            </div>
            {/* Palette presets */}
            <div style={sectionStyle}>
              <label style={labelStyle}>색상 팔레트</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[colors.primary, colors.secondary, colors.text, colors.accent].map((c, i) => (
                  <button key={i} onClick={() => onOverrideChange({ bgColor: c })}
                    style={{ width: 28, height: 28, borderRadius: 8, background: c, border: '2px solid #2A2A38', cursor: 'pointer' }} title={c} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* IMAGE TAB */}
        {activeTool === 'image' && (
          <div style={sectionStyle}>
            <label style={labelStyle}>섹션 이미지</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => { if (ev.target?.result) onImageUpload(ev.target.result as string); };
              reader.readAsDataURL(file);
            }} />
            {override.imageUrl && (
              <img src={override.imageUrl} alt="section" style={{ width: '100%', borderRadius: 10, marginBottom: 10, objectFit: 'cover', maxHeight: 120 }} />
            )}
            <button
              onClick={() => fileRef.current?.click()}
              style={{ width: '100%', padding: '10px', background: '#1A1A24', border: '1px dashed #2A2A38', borderRadius: 10, color: '#9BA3AD', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <ImageIcon className="w-4 h-4" />
              이미지 업로드
            </button>
            {override.imageUrl && (
              <button onClick={() => onOverrideChange({ imageUrl: undefined })}
                style={{ marginTop: 8, width: '100%', padding: '8px', background: 'none', border: '1px solid #2A2A38', borderRadius: 8, color: '#636B77', fontSize: 11, cursor: 'pointer' }}>
                이미지 제거
              </button>
            )}
          </div>
        )}

        {/* SPACING TAB */}
        {activeTool === 'spacing' && (
          <div style={sectionStyle}>
            <label style={labelStyle}>상하 패딩</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="range" min={20} max={160} step={4}
                value={override.paddingY ?? 64}
                onChange={e => onOverrideChange({ paddingY: Number(e.target.value) })}
                style={{ flex: 1, accentColor: '#3182F6' }}
              />
              <span style={{ fontSize: 11, color: '#9BA3AD', width: 32, textAlign: 'right' }}>{override.paddingY ?? 64}px</span>
            </div>
          </div>
        )}

        {/* AI TAB */}
        {activeTool === 'ai' && (
          <div style={sectionStyle}>
            <label style={labelStyle}>AI 도구</label>
            <button
              onClick={onAIRewrite}
              disabled={isAILoading}
              style={{ width: '100%', padding: '12px', background: isAILoading ? '#2A2A38' : 'linear-gradient(135deg, #3182F6, #8B5CF6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, cursor: isAILoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Sparkles className="w-4 h-4" />
              {isAILoading ? 'AI 생성 중...' : 'AI로 내용 다시 쓰기'}
            </button>
            <p style={{ marginTop: 10, fontSize: 11, color: '#636B77', lineHeight: 1.6 }}>
              선택된 섹션의 제목과 본문을 AI가 더 매력적으로 다시 작성합니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const MAX_HISTORY = 30;
const CANVAS_WIDTH = 860;

export default function DetailEditor() {
  const { state, dispatch } = useDetailPage();
  const { manuscriptSections, productPhotos, colorPalette, productInfo } = state;

  // ── Color palette ──
  const colors = useMemo(() => ({
    primary: colorPalette?.colors[0]?.hex || '#111827',
    secondary: colorPalette?.colors[1]?.hex || '#1F2937',
    text: colorPalette?.colors[2]?.hex || '#E5E7EB',
    accent: colorPalette?.accent?.hex || '#3182F6',
  }), [colorPalette]);

  // ── Sections ──
  const allSections = useMemo(() =>
    [...manuscriptSections].sort((a, b) => a.order - b.order),
    [manuscriptSections]
  );
  const visibleSections = useMemo(() => allSections.filter(s => s.visible), [allSections]);

  // ── State ──
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.75);
  const [activeTool, setActiveTool] = useState<PropTab>('text');
  const [overrides, setOverrides] = useState<Record<string, SectionOverride>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  // ── Undo/Redo history ──
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  const pushHistory = useCallback((sections: ManuscriptSection[], ov: Record<string, SectionOverride>) => {
    if (isUndoRedo.current) return;
    setHistory(prev => {
      const truncated = prev.slice(0, historyIndex + 1);
      const next = [...truncated, { sections: JSON.parse(JSON.stringify(sections)), overrides: JSON.parse(JSON.stringify(ov)) }];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Track section changes for undo
  const prevSections = useRef<ManuscriptSection[]>(manuscriptSections);
  useEffect(() => {
    if (JSON.stringify(prevSections.current) !== JSON.stringify(manuscriptSections)) {
      pushHistory(manuscriptSections, overrides);
      prevSections.current = manuscriptSections;
    }
  }, [manuscriptSections]); // intentionally omitting pushHistory/overrides to avoid loops

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo) return;
    isUndoRedo.current = true;
    const entry = history[historyIndex - 1];
    dispatch({ type: 'SET_MANUSCRIPT', payload: entry.sections });
    setOverrides(entry.overrides);
    setHistoryIndex(i => i - 1);
    setTimeout(() => { isUndoRedo.current = false; }, 50);
  }, [canUndo, history, historyIndex, dispatch]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    isUndoRedo.current = true;
    const entry = history[historyIndex + 1];
    dispatch({ type: 'SET_MANUSCRIPT', payload: entry.sections });
    setOverrides(entry.overrides);
    setHistoryIndex(i => i + 1);
    setTimeout(() => { isUndoRedo.current = false; }, 50);
  }, [canRedo, history, historyIndex, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // ── Selections ──
  const selectedSection = useMemo(() => allSections.find(s => s.id === selectedId) ?? null, [allSections, selectedId]);
  const selectedOverride = useMemo(() => (selectedId ? overrides[selectedId] ?? {} : {}), [overrides, selectedId]);

  const productPhotoUrl = productPhotos.length > 0 ? productPhotos[0].dataUrl : null;

  // ── Section actions ──
  const handleAddSection = useCallback((type: ManuscriptSectionType) => {
    const newSection: ManuscriptSection = {
      id: `ms-${type}-${Date.now()}`,
      sectionType: type,
      title: SECTION_LABELS[type] || type,
      body: '',
      imageGuide: '',
      visible: true,
      order: manuscriptSections.length,
    };
    dispatch({ type: 'ADD_MANUSCRIPT_SECTION', payload: newSection });
    setSelectedId(newSection.id);
  }, [dispatch, manuscriptSections.length]);

  const handleDeleteSection = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_MANUSCRIPT_SECTION', payload: id });
    if (selectedId === id) setSelectedId(null);
  }, [dispatch, selectedId]);

  const handleReorder = useCallback((sections: ManuscriptSection[]) => {
    dispatch({ type: 'REORDER_MANUSCRIPT', payload: sections });
  }, [dispatch]);

  const handleToggleVisibility = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_MANUSCRIPT_VISIBILITY', payload: id });
  }, [dispatch]);

  // ── Override changes ──
  const handleOverrideChange = useCallback((patch: Partial<SectionOverride>) => {
    if (!selectedId) return;
    setOverrides(prev => {
      const updated = { ...prev, [selectedId]: { ...prev[selectedId], ...patch } };
      pushHistory(manuscriptSections, updated);
      return updated;
    });
  }, [selectedId, manuscriptSections, pushHistory]);

  const handleSectionDataChange = useCallback((patch: { title?: string; body?: string }) => {
    if (!selectedId) return;
    dispatch({ type: 'UPDATE_MANUSCRIPT_SECTION', payload: { id: selectedId, data: patch } });
  }, [selectedId, dispatch]);

  const handleImageUpload = useCallback((dataUrl: string) => {
    if (!selectedId) return;
    handleOverrideChange({ imageUrl: dataUrl });
  }, [selectedId, handleOverrideChange]);

  // ── AI Rewrite ──
  const handleAIRewrite = useCallback(async () => {
    if (!selectedSection) return;
    setIsAILoading(true);
    try {
      const sectionLabel = SECTION_LABELS[selectedSection.sectionType];
      const productName = productInfo.name || '제품';
      const currentTitle = selectedOverride.title ?? selectedSection.title;
      const currentBody = selectedOverride.body ?? selectedSection.body;

      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `상세페이지의 "${sectionLabel}" 섹션을 더 매력적으로 다시 작성해주세요.

제품명: ${productName}
현재 제목: ${currentTitle}
현재 내용: ${currentBody}

JSON 형식으로 응답하세요:
{"title": "새 제목", "body": "새 내용"}`
          }],
          systemPrompt: '당신은 상품 상세페이지 카피라이터입니다. 주어진 섹션을 더 매력적으로 다시 작성하고 JSON으로 응답하세요.',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.message || data.content || '';
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.title || parsed.body) {
              handleOverrideChange({
                title: parsed.title || currentTitle,
                body: parsed.body || currentBody,
              });
            }
          }
        } catch {
          // If parsing fails, use raw text as body
        }
      }
    } catch (e) {
      console.error('AI rewrite failed:', e);
    } finally {
      setIsAILoading(false);
    }
  }, [selectedSection, selectedOverride, productInfo.name, handleOverrideChange]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Apply overrides to manuscript data
      const updated = manuscriptSections.map(s => {
        const ov = overrides[s.id];
        if (!ov) return s;
        return {
          ...s,
          title: ov.title ?? s.title,
          body: ov.body ?? s.body,
        };
      });
      dispatch({ type: 'SET_MANUSCRIPT', payload: updated });
      // Clear text overrides since they are now saved
      setOverrides(prev => {
        const cleaned: Record<string, SectionOverride> = {};
        Object.entries(prev).forEach(([id, ov]) => {
          const { title, body, ...rest } = ov;
          if (Object.keys(rest).length > 0) cleaned[id] = rest;
        });
        return cleaned;
      });
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  }, [manuscriptSections, overrides, dispatch]);

  // ── Export PNG ──
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipAutoScale: false,
      });
      const link = document.createElement('a');
      link.download = `${productInfo.name || '상세페이지'}_detail.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export failed:', e);
      alert('내보내기에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsExporting(false);
    }
  }, [productInfo.name]);

  // ── Zoom ──
  const zoomPercent = Math.round(zoom * 100);
  const clampZoom = (v: number) => Math.min(1.2, Math.max(0.3, v));

  // ─── Render ───

  if (visibleSections.length === 0 && allSections.length === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#111115', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <div style={{ color: '#4E5968', textAlign: 'center' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>편집할 섹션이 없습니다.</p>
          <p style={{ fontSize: 12, color: '#636B77' }}>이전 단계에서 원고를 생성해 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111115', display: 'flex', flexDirection: 'column', zIndex: 50 }}>

      {/* ── Top Bar ── */}
      <div style={{ height: 48, background: '#0D0D11', borderBottom: '1px solid #1E1E28', display: 'flex', alignItems: 'center', paddingLeft: 12, paddingRight: 16, gap: 8, flexShrink: 0 }}>
        {/* Logo / Back */}
        <button
          onClick={() => { if (window.confirm('메인으로 이동하시겠습니까? 저장되지 않은 변경사항이 있을 수 있습니다.')) window.location.href = '/'; }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'none', border: 'none', color: '#636B77', cursor: 'pointer', fontSize: 12 }}
        >
          <ChevronLeft className="w-4 h-4" />
          메인
        </button>
        <div style={{ width: 1, height: 20, background: '#1E1E28' }} />
        <div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#C9D1D9' }}>DetailMaker</span>
          <span style={{ fontSize: 10, color: '#636B77', marginLeft: 8 }}>{visibleSections.length}개 섹션</span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title="실행 취소 (Ctrl+Z)"
          style={{ padding: '6px 8px', borderRadius: 8, background: 'none', border: 'none', color: canUndo ? '#9BA3AD' : '#3A3A4A', cursor: canUndo ? 'pointer' : 'not-allowed' }}
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="다시 실행 (Ctrl+Y)"
          style={{ padding: '6px 8px', borderRadius: 8, background: 'none', border: 'none', color: canRedo ? '#9BA3AD' : '#3A3A4A', cursor: canRedo ? 'pointer' : 'not-allowed' }}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div style={{ width: 1, height: 20, background: '#1E1E28' }} />

        {/* Zoom */}
        <button onClick={() => setZoom(z => clampZoom(z - 0.1))} style={{ padding: '6px 8px', borderRadius: 8, background: 'none', border: 'none', color: '#9BA3AD', cursor: 'pointer' }}>
          <ZoomOut className="w-4 h-4" />
        </button>
        <span style={{ fontSize: 11, color: '#9BA3AD', minWidth: 40, textAlign: 'center' }}>{zoomPercent}%</span>
        <button onClick={() => setZoom(z => clampZoom(z + 0.1))} style={{ padding: '6px 8px', borderRadius: 8, background: 'none', border: 'none', color: '#9BA3AD', cursor: 'pointer' }}>
          <ZoomIn className="w-4 h-4" />
        </button>

        <div style={{ width: 1, height: 20, background: '#1E1E28' }} />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'none', border: '1px solid #2A2A38', color: isSaving ? '#636B77' : '#9BA3AD', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? '저장 중...' : '저장'}
        </button>

        {/* Export PNG */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 8, background: '#3182F6', border: 'none', color: '#fff', cursor: isExporting ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, opacity: isExporting ? 0.6 : 1 }}
        >
          <Download className="w-3.5 h-3.5" />
          {isExporting ? '내보내는 중...' : 'PNG 저장'}
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Tool Sidebar */}
        <ToolSidebar activeTool={activeTool} onToolChange={setActiveTool} />

        {/* Section Panel */}
        <SectionPanel
          allSections={allSections}
          selectedId={selectedId}
          onSelect={id => { setSelectedId(id); }}
          onAdd={handleAddSection}
          onDelete={handleDeleteSection}
          onReorder={handleReorder}
          onToggleVisibility={handleToggleVisibility}
        />

        {/* Canvas Area */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: '#1A1A22', display: 'flex', justifyContent: 'center', padding: '32px 24px' }}>
          {/* Canvas scroll wrapper */}
          <div style={{ transformOrigin: 'top center', transform: `scale(${zoom})`, transition: 'transform 0.15s', flexShrink: 0 }}>
            <div
              ref={canvasRef}
              style={{ width: CANVAS_WIDTH, background: '#FFFFFF', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', borderRadius: 4, overflow: 'hidden' }}
            >
              {visibleSections.map(section => {
                const ov = overrides[section.id] ?? {};
                const ctx: RenderCtx = {
                  section,
                  override: ov,
                  colors,
                  productPhotoUrl: ov.imageUrl || productPhotoUrl,
                  selected: section.id === selectedId,
                  onClick: () => setSelectedId(section.id),
                  canvasWidth: CANVAS_WIDTH,
                };
                return renderSectionHTML(ctx);
              })}
              {visibleSections.length === 0 && (
                <div style={{ padding: '80px 40px', textAlign: 'center', color: '#8B95A1' }}>
                  <p style={{ fontSize: 14 }}>표시할 섹션이 없습니다.</p>
                  <p style={{ fontSize: 12, marginTop: 6 }}>왼쪽 패널에서 섹션을 켜거나 추가해 주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <PropPanel
          selected={selectedSection}
          override={selectedOverride}
          activeTool={activeTool}
          colors={colors}
          onOverrideChange={handleOverrideChange}
          onSectionDataChange={handleSectionDataChange}
          onImageUpload={handleImageUpload}
          onAIRewrite={handleAIRewrite}
          isAILoading={isAILoading}
        />
      </div>
    </div>
  );
}
