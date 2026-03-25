'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import { TONE_STYLES } from '@/lib/constants';
import { generateManuscript } from '@/lib/api';
import { ManuscriptSection, ManuscriptSectionType, ToneKey } from '@/lib/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Loader2, Wand2, ChevronUp, ChevronDown, Plus, Trash2, Eye, EyeOff, ImageIcon, Palette, Type } from 'lucide-react';

const SECTION_LABELS: Record<ManuscriptSectionType, string> = {
  hero: '히어로 카피',
  features: '핵심 특장점',
  detail: '상세 설명',
  howto: '사용 방법',
  trust: '신뢰 요소',
  cta: '구매 유도',
};

const SECTION_COLORS: Record<ManuscriptSectionType, string> = {
  hero: 'border-[#c3c0ff]/30 bg-[#c3c0ff]/5',
  features: 'border-[#a5c8ff]/30 bg-[#a5c8ff]/5',
  detail: 'border-[#bbc3ff]/30 bg-[#bbc3ff]/5',
  howto: 'border-[#a0e7e5]/30 bg-[#a0e7e5]/5',
  trust: 'border-[#d4a5ff]/30 bg-[#d4a5ff]/5',
  cta: 'border-[#ffb3b3]/30 bg-[#ffb3b3]/5',
};

const TONE_ACCENT: Record<ToneKey, { border: string; bg: string; text: string }> = {
  trust:     { border: 'border-[#a5c8ff]/40', bg: 'bg-[#a5c8ff]/10', text: 'text-[#a5c8ff]' },
  emotional: { border: 'border-[#d4a5ff]/40', bg: 'bg-[#d4a5ff]/10', text: 'text-[#d4a5ff]' },
  impact:    { border: 'border-[#ffb3b3]/40', bg: 'bg-[#ffb3b3]/10', text: 'text-[#ffb3b3]' },
};

export default function Step3Manuscript() {
  const { state, dispatch } = useDetailPage();
  const { productInfo, productPhotos, extractedUSPs, interviewMessages, manuscriptSections, selectedTone, colorPalette, fontRecommendation, isGenerating } = state;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  // ===== 원고 생성 =====
  const handleGenerate = async () => {
    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const firstPhoto = productPhotos[0];
    let photoBase64: string | undefined;
    let photoMimeType: string | undefined;

    if (firstPhoto) {
      const parts = firstPhoto.dataUrl.split(',');
      photoBase64 = parts[1];
      const mimeMatch = parts[0].match(/:(.*?);/);
      photoMimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    }

    try {
      const result = await generateManuscript(
        productInfo,
        extractedUSPs,
        interviewMessages,
        selectedTone,
        photoBase64,
        photoMimeType
      );

      if (result.success && result.data) {
        dispatch({ type: 'SET_MANUSCRIPT', payload: result.data.sections });
        if (result.data.colorPalette) {
          dispatch({ type: 'SET_COLOR_PALETTE', payload: result.data.colorPalette });
        }
        if (result.data.fontRecommendation) {
          dispatch({ type: 'SET_FONT_RECOMMENDATION', payload: result.data.fontRecommendation });
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || '원고 생성에 실패했습니다.' });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: '예기치 않은 오류가 발생했습니다.' });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  };

  // ===== 섹션 편집 =====
  const handleBodyChange = (id: string, value: string) => {
    dispatch({ type: 'UPDATE_MANUSCRIPT_SECTION', payload: { id, data: { body: value } } });
  };

  const handleTitleChange = (id: string, value: string) => {
    dispatch({ type: 'UPDATE_MANUSCRIPT_SECTION', payload: { id, data: { title: value } } });
  };

  const handleToggleVisibility = (id: string) => {
    dispatch({ type: 'TOGGLE_MANUSCRIPT_VISIBILITY', payload: id });
  };

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_MANUSCRIPT_SECTION', payload: id });
    if (editingId === id) setEditingId(null);
  };

  const handleAddSection = () => {
    const newSection: ManuscriptSection = {
      id: `ms-custom-${Date.now()}`,
      sectionType: 'detail',
      title: '새 섹션',
      body: '여기에 내용을 입력하세요.',
      imageGuide: '이 섹션에 필요한 이미지를 설명해주세요.',
      visible: true,
      order: manuscriptSections.length,
    };
    dispatch({ type: 'ADD_MANUSCRIPT_SECTION', payload: newSection });
    setEditingId(newSection.id);
  };

  // ===== 섹션 순서 변경 (드래그 앤 드롭) =====
  const handleDragStart = (id: string) => {
    dragIdRef.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = (targetId: string) => {
    const sourceId = dragIdRef.current;
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null);
      return;
    }

    const sorted = [...manuscriptSections].sort((a, b) => a.order - b.order);
    const sourceIdx = sorted.findIndex((s) => s.id === sourceId);
    const targetIdx = sorted.findIndex((s) => s.id === targetId);

    const reordered = [...sorted];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    const updated = reordered.map((s, i) => ({ ...s, order: i }));
    dispatch({ type: 'REORDER_MANUSCRIPT', payload: updated });
    dragIdRef.current = null;
    setDragOverId(null);
  };

  const handleMoveUp = (id: string) => {
    const sorted = [...manuscriptSections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx <= 0) return;
    const reordered = [...sorted];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    dispatch({ type: 'REORDER_MANUSCRIPT', payload: reordered.map((s, i) => ({ ...s, order: i })) });
  };

  const handleMoveDown = (id: string) => {
    const sorted = [...manuscriptSections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx >= sorted.length - 1) return;
    const reordered = [...sorted];
    [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
    dispatch({ type: 'REORDER_MANUSCRIPT', payload: reordered.map((s, i) => ({ ...s, order: i })) });
  };

  const sortedSections = [...manuscriptSections].sort((a, b) => a.order - b.order);
  const visibleCount = sortedSections.filter((s) => s.visible).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-headline font-extrabold text-[#e5e2e1] mb-2">원고 확인 / 수정</h2>
        <p className="text-[#c7c4d8]">톤앤매너를 선택하고 AI가 인터뷰 내용을 바탕으로 원고를 작성합니다.</p>
      </div>

      {/* ===== 톤앤매너 선택 ===== */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/50 mb-3 ml-1 font-label">톤앤매너</h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(TONE_STYLES) as [ToneKey, typeof TONE_STYLES[ToneKey]][]).map(([key, tone]) => {
            const accent = TONE_ACCENT[key];
            const isSelected = selectedTone === key;
            return (
              <button
                key={key}
                onClick={() => dispatch({ type: 'SET_TONE', payload: key })}
                className={`rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                  isSelected
                    ? `${accent.border} ${accent.bg} ring-1 ring-inset ${accent.border}`
                    : 'border-[#464555]/20 bg-[#1c1b1b]/60 hover:border-[#464555]/40'
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${isSelected ? accent.text : 'text-[#e5e2e1]'}`}>
                  {tone.label}
                </div>
                <div className="text-[11px] text-[#c7c4d8]/70 leading-relaxed">{tone.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== 생성 버튼 / 재생성 ===== */}
      {manuscriptSections.length === 0 ? (
        <Card variant="elevated" padding="lg">
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#c3c0ff]/10 border border-[#c3c0ff]/20 flex items-center justify-center mx-auto">
              <Wand2 className="w-6 h-6 text-[#c3c0ff]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#e5e2e1] mb-1">원고 자동 생성</h3>
              <p className="text-sm text-[#c7c4d8]">
                인터뷰 답변과 USP를 바탕으로 6개 섹션 원고를 작성합니다.
                {productPhotos.length > 0 && ' 제품 사진도 함께 분석합니다.'}
              </p>
            </div>
            <Button size="lg" onClick={handleGenerate} loading={isGenerating} disabled={isGenerating}>
              {isGenerating ? '원고 생성 중...' : '원고 생성하기'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#e5e2e1]/50">{visibleCount}개 섹션 활성 · 드래그하여 순서 변경</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAddSection}>
              <Plus className="w-3.5 h-3.5 mr-1" />섹션 추가
            </Button>
            <Button variant="ghost" size="sm" onClick={handleGenerate} loading={isGenerating} disabled={isGenerating}>
              <Wand2 className="w-3.5 h-3.5 mr-1" />재생성
            </Button>
          </div>
        </div>
      )}

      {state.error && (
        <div className="p-4 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/20 text-[#ffb4ab] text-sm">
          {state.error}
        </div>
      )}

      {/* ===== 색상 팔레트 + 폰트 추천 ===== */}
      {manuscriptSections.length > 0 && (colorPalette || fontRecommendation) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {/* 색상 팔레트 */}
          {colorPalette && (
            <div className="rounded-xl border border-[#464555]/20 bg-[#1c1b1b]/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#c3c0ff]/70" />
                <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/50 font-label">추천 색상 팔레트</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {colorPalette.colors.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-9 h-9 rounded-lg border border-white/10 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[9px] text-[#e5e2e1]/40 font-mono">{c.hex}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-9 h-9 rounded-lg border-2 border-dashed border-white/20 shadow-sm"
                    style={{ backgroundColor: colorPalette.accent.hex }}
                  />
                  <span className="text-[9px] text-[#e5e2e1]/40 font-mono">{colorPalette.accent.hex}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {colorPalette.colors.map((c, i) => (
                  <div key={i} className="text-[10px] text-[#c7c4d8]/60 leading-tight hidden">{c.label}</div>
                ))}
              </div>
              <p className="text-[11px] text-[#c7c4d8]/60 leading-relaxed">{colorPalette.rationale}</p>
              <div className="space-y-1">
                {colorPalette.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="text-[10px] text-[#e5e2e1]/50">{c.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0 border border-dashed border-white/30" style={{ backgroundColor: colorPalette.accent.hex }} />
                  <span className="text-[10px] text-[#e5e2e1]/50">{colorPalette.accent.label} (포인트)</span>
                </div>
              </div>
            </div>
          )}

          {/* 폰트 추천 */}
          {fontRecommendation && (
            <div className="rounded-xl border border-[#464555]/20 bg-[#1c1b1b]/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#c3c0ff]/70" />
                <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/50 font-label">추천 폰트 스타일</span>
              </div>
              <div className="space-y-2.5">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase tracking-wider text-[#e5e2e1]/30 font-label">제목</div>
                  <p className="text-[11px] text-[#c7c4d8] leading-relaxed">{fontRecommendation.headline}</p>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase tracking-wider text-[#e5e2e1]/30 font-label">본문</div>
                  <p className="text-[11px] text-[#c7c4d8] leading-relaxed">{fontRecommendation.body}</p>
                </div>
                <div className="pt-1 border-t border-[#464555]/15">
                  <p className="text-[11px] text-[#e5e2e1]/40 italic">{fontRecommendation.mood}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== 섹션 목록 ===== */}
      <AnimatePresence>
        {sortedSections.map((section, idx) => {
          const colorClass = SECTION_COLORS[section.sectionType] || 'border-[#464555]/20 bg-[#2a2a2a]';
          const isEditing = editingId === section.id;
          const isDragOver = dragOverId === section.id;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              draggable
              onDragStart={() => handleDragStart(section.id)}
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDrop={() => handleDrop(section.id)}
              onDragLeave={() => setDragOverId(null)}
              className={`rounded-xl border transition-all duration-200 ${colorClass} ${
                isDragOver ? 'ring-2 ring-[#c3c0ff]/50 scale-[1.01]' : ''
              } ${!section.visible ? 'opacity-40' : ''}`}
            >
              {/* 섹션 헤더 */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="cursor-grab text-[#e5e2e1]/20 select-none text-xs mr-1">⠿⠿</div>
                <span className="text-[10px] uppercase tracking-widest text-[#e5e2e1]/40 font-label w-20 flex-shrink-0">
                  {SECTION_LABELS[section.sectionType] || section.sectionType}
                </span>
                {isEditing ? (
                  <input
                    value={section.title}
                    onChange={(e) => handleTitleChange(section.id, e.target.value)}
                    className="flex-1 bg-transparent text-sm font-semibold text-[#e5e2e1] focus:outline-none border-b border-[#c3c0ff]/30"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="flex-1 text-sm font-semibold text-[#e5e2e1] cursor-pointer hover:text-[#c3c0ff] transition-colors truncate"
                    onClick={() => setEditingId(section.id)}
                  >
                    {section.title}
                  </span>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleMoveUp(section.id)} disabled={idx === 0} className="p-1 text-[#e5e2e1]/30 hover:text-[#e5e2e1] disabled:opacity-20 transition-colors">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleMoveDown(section.id)} disabled={idx === sortedSections.length - 1} className="p-1 text-[#e5e2e1]/30 hover:text-[#e5e2e1] disabled:opacity-20 transition-colors">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleToggleVisibility(section.id)} className="p-1 text-[#e5e2e1]/30 hover:text-[#e5e2e1] transition-colors">
                    {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleRemove(section.id)} className="p-1 text-[#e5e2e1]/20 hover:text-[#ffb4ab] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 본문 편집 영역 */}
              <div className="p-4 space-y-3">
                {isEditing ? (
                  <textarea
                    value={section.body}
                    onChange={(e) => handleBodyChange(section.id, e.target.value)}
                    rows={8}
                    className="w-full bg-[#1c1b1b]/60 border border-[#464555]/20 rounded-lg px-4 py-3 text-sm text-[#e5e2e1] placeholder:text-[#e5e2e1]/20 resize-y focus:outline-none focus:border-[#c3c0ff]/50 transition-all leading-relaxed"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditingId(section.id)}
                    className="text-sm text-[#c7c4d8] leading-relaxed whitespace-pre-wrap cursor-text hover:text-[#e5e2e1] transition-colors min-h-[4rem] p-2 rounded-lg hover:bg-white/5"
                  >
                    {section.body}
                  </div>
                )}

                {/* 이미지 + 색상/폰트 가이드 */}
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-black/20 border border-white/5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#e5e2e1]/30 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#e5e2e1]/40 leading-relaxed">
                    <span className="font-medium text-[#e5e2e1]/50">이미지 가이드:</span> {section.imageGuide}
                  </p>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-[#c3c0ff]/60 hover:text-[#c3c0ff] transition-colors"
                    >
                      편집 완료
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ===== 네비게이션 버튼 ===== */}
      {manuscriptSections.length > 0 && (
        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>이전</Button>
          <Button size="lg" onClick={() => dispatch({ type: 'NEXT_STEP' })}>
            다음: 내보내기
          </Button>
        </div>
      )}
      {manuscriptSections.length === 0 && (
        <div className="flex justify-start pt-2">
          <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>이전</Button>
        </div>
      )}
    </motion.div>
  );
}
