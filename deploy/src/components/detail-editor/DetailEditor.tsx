'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useDetailPage } from '@/hooks/useDetailPage';
import { ManuscriptSection, ManuscriptSectionType, ProductPhoto } from '@/lib/types';
import {
  ChevronLeft, Download, ZoomIn, ZoomOut, Undo2, Redo2, Save,
  Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  Type, Image as ImageIcon, Palette, Sparkles,
  LayoutGrid, Layers,
  Zap, AlertTriangle, Lightbulb, Star, FileText, BookOpen,
  Users, Award, Table2, ShieldCheck, ShoppingCart, Tag,
  Upload, Wand2, Search,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import CompositionRenderer from './CompositionRenderer';
import { getCompositionTemplate } from '@/lib/composition-templates';
import type { SectionComposition, CompositionElement } from '@/lib/composition-types';

// ─── Dark Scrollbar Style (inject once) ──────────────────────────────────────
const SCROLLBAR_STYLE_ID = 'dm-dark-scrollbar';
if (typeof document !== 'undefined' && !document.getElementById(SCROLLBAR_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = SCROLLBAR_STYLE_ID;
  style.textContent = `
    *::-webkit-scrollbar { width: 4px; height: 4px; }
    *::-webkit-scrollbar-track { background: transparent; }
    *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
    *::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
  `;
  document.head.appendChild(style);
}

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

type ToolId = 'sections' | 'text' | 'colors' | 'image' | 'ai';

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

// Maps section type → Lucide icon component (16x16)
const SECTION_ICON_MAP: Record<string, React.ReactNode> = {
  hooking:      <Zap className="w-3.5 h-3.5" />,
  hero:         <Zap className="w-3.5 h-3.5" />,
  problem:      <AlertTriangle className="w-3.5 h-3.5" />,
  solution:     <Lightbulb className="w-3.5 h-3.5" />,
  features:     <Star className="w-3.5 h-3.5" />,
  detail:       <FileText className="w-3.5 h-3.5" />,
  howto:        <BookOpen className="w-3.5 h-3.5" />,
  social_proof: <Users className="w-3.5 h-3.5" />,
  trust:        <Award className="w-3.5 h-3.5" />,
  specs:        <Table2 className="w-3.5 h-3.5" />,
  guarantee:    <ShieldCheck className="w-3.5 h-3.5" />,
  event_banner: <Tag className="w-3.5 h-3.5" />,
  cta:          <ShoppingCart className="w-3.5 h-3.5" />,
};

function SectionIcon({ type }: { type: string }) {
  return <>{SECTION_ICON_MAP[type] ?? <Layers className="w-3.5 h-3.5" />}</>;
}

// ─── Image Tool Panel ─────────────────────────────────────────────────────────

function ImageToolPanel({
  productPhotos,
  onAddPhoto,
  onRemovePhoto,
}: {
  productPhotos: ProductPhoto[];
  onAddPhoto: (photo: ProductPhoto) => void;
  onRemovePhoto: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        onAddPhoto({ id: `photo-${Date.now()}`, dataUrl: ev.target.result as string, name: file.name });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div>
      <p style={{ fontSize: 11, color: '#636B77', marginBottom: 12, lineHeight: 1.6 }}>업로드한 제품 사진을 관리합니다.</p>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {productPhotos.map((photo, i) => (
          <div key={photo.id} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #2A2A38', aspectRatio: '1', background: '#1A1A24', position: 'relative' }}>
            <img src={photo.dataUrl} alt={`제품 ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={() => onRemovePhoto(photo.id)}
              style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: 4, color: '#fff', fontSize: 10, cursor: 'pointer', padding: '2px 5px', lineHeight: 1 }}
            >✕</button>
          </div>
        ))}
      </div>
      {productPhotos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#636B77', fontSize: 11 }}>업로드한 이미지가 없습니다</div>
      )}
      <button
        onClick={() => fileInputRef.current?.click()}
        style={{ width: '100%', padding: '12px', background: '#1A1A24', border: '1px dashed #2A2A38', borderRadius: 10, color: '#636B77', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        <Upload className="w-4 h-4" />
        이미지 추가
      </button>
    </div>
  );
}

// ─── Tool Sidebar ─────────────────────────────────────────────────────────────

function ToolSidebar({ activeTool, onToolChange }: { activeTool: ToolId; onToolChange: (t: ToolId) => void }) {
  const tools: { id: ToolId; icon: React.ReactNode; label: string }[] = [
    { id: 'sections', icon: <Layers className="w-5 h-5" />, label: '섹션' },
    { id: 'text', icon: <Type className="w-5 h-5" />, label: '텍스트' },
    { id: 'colors', icon: <Palette className="w-5 h-5" />, label: '색상' },
    { id: 'image', icon: <ImageIcon className="w-5 h-5" />, label: '이미지' },
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
    <div style={{ width: 280, background: '#13131A', borderRight: '1px solid #1E1E28', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
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
                  <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#A8C8FF' : '#9BA3AD', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <SectionIcon type={section.sectionType} /> {SECTION_LABELS[section.sectionType] || section.sectionType}
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
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#C9D1D9', display: 'flex', alignItems: 'center', gap: 4 }}><SectionIcon type={type} /> {label}</div>
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
  activeToolId: ToolId;
  colors: { primary: string; secondary: string; text: string; accent: string };
  onOverrideChange: (patch: Partial<SectionOverride>) => void;
  onSectionDataChange: (patch: { title?: string; body?: string }) => void;
  onImageUpload: (dataUrl: string) => void;
  onAIRewrite: () => void;
  isAILoading: boolean;
}

function PropPanel({ selected, override, activeToolId, colors, onOverrideChange, onSectionDataChange, onImageUpload, onAIRewrite, isAILoading }: PropPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 600, color: '#636B77', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, display: 'block' };
  const inputStyle: React.CSSProperties = { width: '100%', background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 8, color: '#C9D1D9', fontSize: 12, padding: '8px 10px', outline: 'none', resize: 'none' };
  const sectionStyle: React.CSSProperties = { marginBottom: 20 };

  if (!selected) {
    return (
      <div style={{ width: 300, background: '#13131A', borderLeft: '1px solid #1E1E28', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', color: '#4E5968', padding: 24 }}>
          <LayoutGrid className="w-8 h-8 mx-auto mb-3" style={{ opacity: 0.3 }} />
          <p style={{ fontSize: 12 }}>섹션을 클릭하여<br />선택하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: 300, background: '#13131A', borderLeft: '1px solid #1E1E28', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #1E1E28' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#C9D1D9', display: 'flex', alignItems: 'center', gap: 5 }}>
          <SectionIcon type={selected.sectionType} /> {SECTION_LABELS[selected.sectionType] || selected.sectionType}
        </div>
        <div style={{ fontSize: 10, color: '#636B77', marginTop: 2 }}>섹션 속성</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

        {/* TEXT */}
        <div style={sectionStyle}>
          <label style={labelStyle}>섹션 제목</label>
          <input
            style={inputStyle}
            value={override.title ?? selected.title ?? ''}
            onChange={e => onOverrideChange({ title: e.target.value })}
            placeholder="섹션 제목"
          />
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>본문 내용</label>
          <textarea
            style={{ ...inputStyle, minHeight: 120 }}
            value={override.body ?? selected.body ?? ''}
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

        <div style={{ height: 1, background: '#1E1E28', margin: '4px 0 20px' }} />

        {/* TYPOGRAPHY */}
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

        {/* SPACING */}
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

        <div style={{ height: 1, background: '#1E1E28', margin: '4px 0 20px' }} />

        {/* COLORS */}
        <div style={sectionStyle}>
          <label style={labelStyle}>배경색</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={override.bgColor || colors.primary}
              onChange={e => onOverrideChange({ bgColor: e.target.value })}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #2A2A38', cursor: 'pointer', padding: 2 }} />
            <span style={{ fontSize: 11, color: '#9BA3AD' }}>{override.bgColor || colors.primary}</span>
            <button onClick={() => onOverrideChange({ bgColor: undefined })} style={{ marginLeft: 'auto', fontSize: 10, color: '#636B77', background: 'none', border: 'none', cursor: 'pointer' }}>&#8635;</button>
          </div>
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>텍스트 색상</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={override.textColor || '#FFFFFF'}
              onChange={e => onOverrideChange({ textColor: e.target.value })}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #2A2A38', cursor: 'pointer', padding: 2 }} />
            <span style={{ fontSize: 11, color: '#9BA3AD' }}>{override.textColor || '#FFFFFF'}</span>
            <button onClick={() => onOverrideChange({ textColor: undefined })} style={{ marginLeft: 'auto', fontSize: 10, color: '#636B77', background: 'none', border: 'none', cursor: 'pointer' }}>&#8635;</button>
          </div>
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>강조 색상</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={override.accentColor || colors.accent}
              onChange={e => onOverrideChange({ accentColor: e.target.value })}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #2A2A38', cursor: 'pointer', padding: 2 }} />
            <span style={{ fontSize: 11, color: '#9BA3AD' }}>{override.accentColor || colors.accent}</span>
            <button onClick={() => onOverrideChange({ accentColor: undefined })} style={{ marginLeft: 'auto', fontSize: 10, color: '#636B77', background: 'none', border: 'none', cursor: 'pointer' }}>&#8635;</button>
          </div>
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>색상 팔레트</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[colors.primary, colors.secondary, colors.text, colors.accent].map((c, i) => (
              <button key={i} onClick={() => onOverrideChange({ bgColor: c })}
                style={{ width: 28, height: 28, borderRadius: 8, background: c, border: '2px solid #2A2A38', cursor: 'pointer' }} title={c} />
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: '#1E1E28', margin: '4px 0 20px' }} />

        {/* IMAGE */}
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

        <div style={{ height: 1, background: '#1E1E28', margin: '4px 0 20px' }} />

        {/* AI */}
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
  const [activeTool, setActiveTool] = useState<ToolId>('sections');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [overrides, setOverrides] = useState<Record<string, SectionOverride>>({});
  const overridesRef = useRef<Record<string, SectionOverride>>({});
  useEffect(() => { overridesRef.current = overrides; }, [overrides]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [textFontFamily, setTextFontFamily] = useState('Noto Sans KR');

  // ── Composition state (per-section element positions persist drag edits) ──
  const [compositions, setCompositions] = useState<Record<string, SectionComposition>>({});
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Stable dep key: comma-joined visible section IDs
  const visibleSectionIds = useMemo(() => visibleSections.map(s => s.id).join(','), [visibleSections]);

  // Initialize compositions from templates when sections change
  useEffect(() => {
    const pUrl = productPhotos.length > 0 ? productPhotos[0].dataUrl : null;
    const newComps: Record<string, SectionComposition> = {};
    visibleSections.forEach(section => {
      if (!compositions[section.id]) {
        const comp = getCompositionTemplate(section.sectionType, colors);
        const elements = comp.elements.map(el => {
          const isSectionTitle = el.id.endsWith('-title') && !el.id.includes('card') && !el.id.includes('item');
          const isSectionSubtitle = el.id.endsWith('-subtitle');
          if (isSectionTitle && el.type === 'text' && section.title) return { ...el, text: section.title };
          if (isSectionSubtitle && el.type === 'text' && section.body) return { ...el, text: section.body.slice(0, 150) };
          if (el.type === 'image' && !el.src && pUrl) return { ...el, src: pUrl };
          return el;
        });
        newComps[section.id] = { ...comp, elements };
      }
    });
    if (Object.keys(newComps).length > 0) setCompositions(prev => ({ ...prev, ...newComps }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSectionIds, colors.primary, colors.accent, colors.text]);

  // When product photos change, inject the first photo into all image-type elements that have no src
  useEffect(() => {
    const pUrl = productPhotos.length > 0 ? productPhotos[0].dataUrl : null;
    if (!pUrl) return;
    setCompositions(prev => {
      const updated: Record<string, SectionComposition> = { ...prev };
      let anyChanged = false;
      Object.entries(prev).forEach(([id, comp]) => {
        let compChanged = false;
        const newElements = comp.elements.map(el => {
          if (el.type === 'image' && !el.src) {
            compChanged = true;
            return { ...el, src: pUrl };
          }
          return el;
        });
        if (compChanged) {
          updated[id] = { ...comp, elements: newElements };
          anyChanged = true;
        }
      });
      return anyChanged ? updated : prev;
    });
  }, [productPhotos]);

  // Update element in composition
  const handleUpdateElement = useCallback((sectionId: string, elementId: string, updates: Partial<CompositionElement>) => {
    setCompositions(prev => {
      const comp = prev[sectionId];
      if (!comp) return prev;
      return { ...prev, [sectionId]: { ...comp, elements: comp.elements.map(el => el.id === elementId ? { ...el, ...updates } : el) } };
    });
  }, []);

  // ── Undo/Redo history ──
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  // historyIndexRef keeps the index in sync with state so pushHistory doesn't close over a stale value
  const historyIndexRef = useRef(historyIndex);
  useEffect(() => { historyIndexRef.current = historyIndex; }, [historyIndex]);

  const pushHistory = useCallback((sections: ManuscriptSection[], ov: Record<string, SectionOverride>) => {
    if (isUndoRedo.current) return;
    const currentIndex = historyIndexRef.current;
    setHistory(prev => {
      const truncated = prev.slice(0, currentIndex + 1);
      const next = [...truncated, { sections: JSON.parse(JSON.stringify(sections)), overrides: JSON.parse(JSON.stringify(ov)) }];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, []);

  // Track section changes for undo (overridesRef avoids stale closure)
  const prevSections = useRef<ManuscriptSection[]>(manuscriptSections);
  const initialHistoryPushed = useRef(false);
  useEffect(() => {
    // Push initial snapshot on first render so undo index starts at 0
    if (!initialHistoryPushed.current) {
      initialHistoryPushed.current = true;
      pushHistory(manuscriptSections, overridesRef.current);
      prevSections.current = manuscriptSections;
      return;
    }
    if (JSON.stringify(prevSections.current) !== JSON.stringify(manuscriptSections)) {
      pushHistory(manuscriptSections, overridesRef.current);
      prevSections.current = manuscriptSections;
    }
  }, [manuscriptSections]); // intentionally omitting pushHistory to avoid loops

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

  // ── Selections ──
  const selectedSection = useMemo(() => allSections.find(s => s.id === selectedId) ?? null, [allSections, selectedId]);
  const selectedOverride = useMemo(() => (selectedId ? overrides[selectedId] ?? {} : {}), [overrides, selectedId]);

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

  // Keyboard shortcuts (declared after handleDeleteSection to avoid hoisting issues)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
      // Delete / Backspace removes the selected section (skip if focus is on an input/textarea)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          if (window.confirm('선택된 섹션을 삭제하시겠습니까?')) {
            handleDeleteSection(selectedId);
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, selectedId, handleDeleteSection]);

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

  // ── Full-page AI rewrite (rewrites every visible section sequentially) ──
  const handleFullPageAIRewrite = useCallback(async () => {
    if (visibleSections.length === 0) return;
    setIsAILoading(true);
    try {
      for (const section of visibleSections) {
        const sectionLabel = SECTION_LABELS[section.sectionType];
        const sectionOverride = overrides[section.id] ?? {};
        const currentTitle = sectionOverride.title ?? section.title;
        const currentBody = sectionOverride.body ?? section.body;

        const res = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: `상세페이지의 "${sectionLabel}" 섹션을 더 매력적으로 다시 작성해주세요.\n\n제품명: ${productInfo.name || '제품'}\n현재 제목: ${currentTitle}\n현재 내용: ${currentBody}\n\nJSON 형식으로 응답하세요:\n{"title": "새 제목", "body": "새 내용"}`,
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
                setOverrides(prev => ({
                  ...prev,
                  [section.id]: {
                    ...prev[section.id],
                    title: parsed.title || currentTitle,
                    body: parsed.body || currentBody,
                  },
                }));
              }
            }
          } catch { /* ignore parse errors */ }
        }
      }
      // Push a single history entry after all sections have been rewritten
      pushHistory(manuscriptSections, overridesRef.current);
    } catch (e) {
      console.error('Full page AI rewrite failed:', e);
    } finally {
      setIsAILoading(false);
    }
  }, [visibleSections, overrides, productInfo.name, pushHistory, manuscriptSections]);

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

        {/* Left Panel: Sections or Tool SubPanel */}
        {activeTool === 'sections' ? (
          <SectionPanel
            allSections={allSections}
            selectedId={selectedId}
            onSelect={id => {
              setSelectedId(id);
              const el = sectionRefs.current[id];
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            onAdd={handleAddSection}
            onDelete={handleDeleteSection}
            onReorder={handleReorder}
            onToggleVisibility={handleToggleVisibility}
          />
        ) : (
          <div style={{ width: 280, background: '#13131A', borderRight: '1px solid #1E1E28', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #1E1E28' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#C9D1D9' }}>
                {activeTool === 'text' ? '텍스트 추가' : activeTool === 'colors' ? '컬러 스킴' : activeTool === 'image' ? '이미지 관리' : 'AI 도구'}
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

              {/* TEXT tool */}
              {activeTool === 'text' && (
                <div>
                  <p style={{ fontSize: 11, color: '#636B77', marginBottom: 12, lineHeight: 1.6 }}>
                    {selectedId ? '새 텍스트 섹션을 추가합니다.' : '섹션을 먼저 선택하세요.'}
                  </p>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 10, color: '#636B77', display: 'block', marginBottom: 4 }}>폰트</label>
                    <select
                      value={textFontFamily}
                      onChange={e => setTextFontFamily(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 8, color: '#C9D1D9', fontSize: 12 }}
                    >
                      <option value="Noto Sans KR">Noto Sans KR</option>
                      <option value="Pretendard">Pretendard</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: '제목 추가', size: '24px', weight: 800, type: 'hooking' as ManuscriptSectionType },
                      { label: '본문 추가', size: '14px', weight: 400, type: 'detail' as ManuscriptSectionType },
                    ].map(t => (
                      <button
                        key={t.label}
                        onClick={() => handleAddSection(t.type)}
                        disabled={!selectedId}
                        style={{ padding: '14px 10px', background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 10, color: selectedId ? '#C9D1D9' : '#4E5968', cursor: selectedId ? 'pointer' : 'not-allowed', textAlign: 'center', opacity: selectedId ? 1 : 0.5 }}
                        onMouseEnter={e => { if (selectedId) (e.currentTarget as HTMLButtonElement).style.borderColor = '#3182F6'; }}
                        onMouseLeave={e => { if (selectedId) (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A2A38'; }}
                      >
                        <div style={{ fontSize: parseInt(t.size) > 16 ? 18 : 13, fontWeight: t.weight, marginBottom: 4 }}>Aa</div>
                        <div style={{ fontSize: 10, color: '#636B77' }}>{t.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COLORS tool */}
              {activeTool === 'colors' && (
                <div>
                  <p style={{ fontSize: 11, color: '#636B77', marginBottom: 12, lineHeight: 1.6 }}>AI가 추천한 컬러 스킴입니다. 변경하면 전체 분위기가 바뀝니다.</p>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: '#636B77', marginBottom: 6 }}>현재 팔레트</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {Object.entries(colors).map(([key, hex]) => (
                        <div key={key} style={{ textAlign: 'center' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: hex, border: '1px solid #2A2A38', cursor: 'pointer' }} />
                          <div style={{ fontSize: 8, color: '#636B77', marginTop: 3 }}>{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#636B77', marginBottom: 6 }}>추천 스킴</div>
                    {[
                      { name: '딥 네이비', colors: ['#111827', '#1F2937', '#E5E7EB', '#3182F6'], palette: { colors: [{ hex: '#111827', label: '딥 네이비' }, { hex: '#1F2937', label: '다크 그레이' }, { hex: '#E5E7EB', label: '라이트 그레이' }], accent: { hex: '#3182F6', label: '블루 액센트' }, rationale: '딥 네이비 스킴' } },
                      { name: '내추럴 그린', colors: ['#1b3a2d', '#2d5a42', '#F0FDF4', '#16a34a'], palette: { colors: [{ hex: '#1b3a2d', label: '딥 그린' }, { hex: '#2d5a42', label: '포레스트 그린' }, { hex: '#F0FDF4', label: '민트 화이트' }], accent: { hex: '#16a34a', label: '그린 액센트' }, rationale: '내추럴 그린 스킴' } },
                      { name: '웜 브라운', colors: ['#292524', '#44403C', '#FAFAF9', '#D97706'], palette: { colors: [{ hex: '#292524', label: '다크 브라운' }, { hex: '#44403C', label: '미디엄 브라운' }, { hex: '#FAFAF9', label: '오프 화이트' }], accent: { hex: '#D97706', label: '앰버 액센트' }, rationale: '웜 브라운 스킴' } },
                    ].map(scheme => (
                      <button
                        key={scheme.name}
                        onClick={() => dispatch({ type: 'SET_COLOR_PALETTE', payload: scheme.palette })}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 10, cursor: 'pointer', marginBottom: 6 }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#3182F6')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#2A2A38')}
                      >
                        <div style={{ display: 'flex', gap: 3 }}>
                          {scheme.colors.map((c, i) => (
                            <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: c, border: '1px solid #2A2A38' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: '#C9D1D9' }}>{scheme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* IMAGE tool */}
              {activeTool === 'image' && (
                <ImageToolPanel
                  productPhotos={productPhotos}
                  onAddPhoto={photo => dispatch({ type: 'ADD_PRODUCT_PHOTO', payload: photo })}
                  onRemovePhoto={id => dispatch({ type: 'REMOVE_PRODUCT_PHOTO', payload: id })}
                />
              )}

              {/* AI tool */}
              {activeTool === 'ai' && (
                <div>
                  <p style={{ fontSize: 11, color: '#636B77', marginBottom: 12, lineHeight: 1.6 }}>AI가 상세페이지를 분석하고 개선합니다.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      onClick={handleAIRewrite}
                      disabled={isAILoading || !selectedSection}
                      style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #3182F6, #8B5CF6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, cursor: (isAILoading || !selectedSection) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: (isAILoading || !selectedSection) ? 0.5 : 1 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      {isAILoading ? '생성 중...' : '선택 섹션 AI 재작성'}
                    </button>
                    <button
                      onClick={handleFullPageAIRewrite}
                      disabled={isAILoading}
                      style={{ width: '100%', padding: '12px', background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 10, color: isAILoading ? '#636B77' : '#C9D1D9', fontSize: 12, fontWeight: 600, cursor: isAILoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: isAILoading ? 0.6 : 1 }}
                    >
                      <Wand2 className="w-4 h-4" />
                      {isAILoading ? '생성 중...' : '전체 페이지 AI 개선'}
                    </button>
                    <button
                      disabled
                      title="준비 중"
                      style={{ width: '100%', padding: '12px', background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 10, color: '#3A3A4A', fontSize: 12, fontWeight: 600, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.5 }}
                    >
                      <ImageIcon className="w-4 h-4" />
                      AI 이미지 생성 (준비 중)
                    </button>
                    <button
                      disabled
                      title="준비 중"
                      style={{ width: '100%', padding: '12px', background: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 10, color: '#3A3A4A', fontSize: 12, fontWeight: 600, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.5 }}
                    >
                      <Search className="w-4 h-4" />
                      경쟁사 재분석 (준비 중)
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: '#1A1A22', padding: '32px 24px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          {/* CSS zoom affects layout flow (unlike transform:scale) — scroll works correctly at all zoom levels */}
          <div style={{
            zoom: zoom as unknown as number,
            flexShrink: 0,
          } as React.CSSProperties}>
            <div
              ref={canvasRef}
              style={{ width: CANVAS_WIDTH, background: '#FFFFFF', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', borderRadius: 4, overflow: 'hidden' }}
            >
              {visibleSections.map(section => {
                const comp = compositions[section.id];
                if (!comp) return null;
                return (
                  <div
                    key={section.id}
                    ref={el => { sectionRefs.current[section.id] = el; }}
                    onClick={() => setSelectedId(section.id)}
                    style={{ outline: section.id === selectedId ? '2px solid #3182F6' : '2px solid transparent', outlineOffset: -2, cursor: 'default' }}
                  >
                    <CompositionRenderer
                      composition={comp}
                      selectedElementId={selectedId === section.id ? selectedElementId : null}
                      onSelectElement={elId => { setSelectedId(section.id); setSelectedElementId(elId); }}
                      onUpdateElement={(elId, updates) => handleUpdateElement(section.id, elId, updates)}
                      onDoubleClickText={elId => { setSelectedId(section.id); setSelectedElementId(elId); }}
                    />
                  </div>
                );
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

        {/* Properties Panel — always visible when a section is selected */}
        <PropPanel
          selected={selectedSection}
          override={selectedOverride}
          activeToolId={activeTool}
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
