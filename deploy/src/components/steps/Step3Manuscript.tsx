'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import { TONE_STYLES } from '@/lib/constants';
import { generateManuscript } from '@/lib/api';
import { ManuscriptSection, ManuscriptSectionType, ToneKey } from '@/lib/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Wand2, ChevronUp, ChevronDown, Plus, Trash2, Eye, EyeOff, ImageIcon, Palette, Type, Lightbulb, BarChart2 } from 'lucide-react';

const SECTION_LABELS: Record<ManuscriptSectionType, string> = {
  hooking: '후킹',
  problem: '문제 공감',
  solution: '솔루션 제시',
  features: '핵심 특장점',
  howto: '사용 방법',
  social_proof: '사회적 증거',
  specs: '스펙/상세',
  guarantee: '보증/신뢰',
  event_banner: '이벤트 배너',
  cta: '구매 유도',
  // legacy
  hero: '히어로 카피',
  detail: '상세 설명',
  trust: '신뢰 요소',
};

const SECTION_COLORS: Record<ManuscriptSectionType, string> = {
  hooking: 'border-[#3182F6]/20 bg-[#3182F6]/5',
  problem: 'border-[#F04452]/20 bg-[#F04452]/5',
  solution: 'border-[#00C471]/20 bg-[#00C471]/5',
  features: 'border-[#3182F6]/20 bg-[#3182F6]/5',
  howto: 'border-[#00C471]/20 bg-[#00C471]/5',
  social_proof: 'border-[#8B5CF6]/20 bg-[#8B5CF6]/5',
  specs: 'border-[#4E5968]/15 bg-[#4E5968]/5',
  guarantee: 'border-[#00C471]/20 bg-[#00C471]/5',
  event_banner: 'border-[#FF9F00]/20 bg-[#FF9F00]/5',
  cta: 'border-[#F04452]/20 bg-[#F04452]/5',
  // legacy
  hero: 'border-[#3182F6]/20 bg-[#3182F6]/5',
  detail: 'border-[#4E5968]/15 bg-[#4E5968]/5',
  trust: 'border-[#8B5CF6]/20 bg-[#8B5CF6]/5',
};

const TONE_ACCENT: Record<ToneKey, { border: string; bg: string; text: string }> = {
  trust:     { border: 'border-[#3182F6]/30', bg: 'bg-[#3182F6]/10', text: 'text-[#3182F6]' },
  emotional: { border: 'border-[#8B5CF6]/30', bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]' },
  impact:    { border: 'border-[#F04452]/30', bg: 'bg-[#F04452]/10', text: 'text-[#F04452]' },
};

export default function Step3Manuscript() {
  const { state, dispatch } = useDetailPage();
  const { productInfo, productPhotos, extractedUSPs, interviewMessages, manuscriptSections, selectedTone, colorPalette, fontRecommendation, layoutRationale, referenceGuide, isGenerating } = state;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingId) {
      const timer = setTimeout(() => {
        editingTextareaRef.current?.focus({ preventScroll: true });
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [editingId]);

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
        dispatch({ type: 'SET_COLOR_PALETTE', payload: result.data.colorPalette ?? null });
        dispatch({ type: 'SET_FONT_RECOMMENDATION', payload: result.data.fontRecommendation ?? null });
        dispatch({ type: 'SET_LAYOUT_RATIONALE', payload: result.data.layoutRationale ?? null });
        dispatch({ type: 'SET_REFERENCE_GUIDE', payload: result.data.referenceGuide ?? null });
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

  // ===== 섹션 순서 변경 =====
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
        <h2 className="text-2xl font-bold text-[#191F28] mb-2">원고 확인 / 수정</h2>
        <p className="text-[#8B95A1]">톤앤매너를 선택하고 AI가 인터뷰 내용을 바탕으로 원고를 작성합니다.</p>
      </div>

      {/* ===== 톤앤매너 선택 ===== */}
      <div>
        <h3 className="text-xs font-medium text-[#8B95A1] mb-3 ml-1">톤앤매너</h3>
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
                    : 'border-[#E5E8EB] bg-white hover:border-[#D1D6DB]'
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${isSelected ? accent.text : 'text-[#191F28]'}`}>
                  {tone.label}
                </div>
                <div className="text-[11px] text-[#8B95A1] leading-relaxed">{tone.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== 생성 버튼 / 재생성 ===== */}
      {manuscriptSections.length === 0 ? (
        <Card variant="elevated" padding="lg">
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#3182F6]/10 border border-[#3182F6]/20 flex items-center justify-center mx-auto">
              <Wand2 className="w-6 h-6 text-[#3182F6]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#191F28] mb-1">원고 자동 생성</h3>
              <p className="text-sm text-[#8B95A1]">
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
          <p className="text-sm text-[#8B95A1]">{visibleCount}개 섹션 활성 · 드래그하여 순서 변경</p>
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
        <div className="p-4 rounded-xl bg-[#F04452]/10 border border-[#F04452]/20 text-[#F04452] text-sm">
          {state.error}
        </div>
      )}

      {/* ===== AI 추천 레이아웃 근거 ===== */}
      {manuscriptSections.length > 0 && layoutRationale && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#3182F6]/5 border border-[#3182F6]/15">
          <Lightbulb className="w-4 h-4 text-[#3182F6] flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-medium text-[#3182F6]">AI 추천 레이아웃 근거</span>
            <p className="text-sm text-[#4E5968] mt-0.5 leading-relaxed">{layoutRationale}</p>
          </div>
        </div>
      )}

      {/* ===== 색상 팔레트 + 폰트 추천 ===== */}
      {manuscriptSections.length > 0 && (colorPalette || fontRecommendation) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {colorPalette && (
            <div className="rounded-xl border border-[#E5E8EB] bg-white p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#3182F6]" />
                <span className="text-xs font-medium text-[#8B95A1]">추천 색상 팔레트</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {colorPalette.colors.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-9 h-9 rounded-lg border border-[#E5E8EB] shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[9px] text-[#8B95A1] font-mono">{c.hex}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-9 h-9 rounded-lg border-2 border-dashed border-[#D1D6DB] shadow-sm"
                    style={{ backgroundColor: colorPalette.accent.hex }}
                  />
                  <span className="text-[9px] text-[#8B95A1] font-mono">{colorPalette.accent.hex}</span>
                </div>
              </div>
              <p className="text-[11px] text-[#8B95A1] leading-relaxed">{colorPalette.rationale}</p>
              <div className="space-y-1">
                {colorPalette.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="text-[10px] text-[#8B95A1]">{c.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0 border border-dashed border-[#D1D6DB]" style={{ backgroundColor: colorPalette.accent.hex }} />
                  <span className="text-[10px] text-[#8B95A1]">{colorPalette.accent.label} (포인트)</span>
                </div>
              </div>
            </div>
          )}

          {fontRecommendation && (
            <div className="rounded-xl border border-[#E5E8EB] bg-white p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#3182F6]" />
                <span className="text-xs font-medium text-[#8B95A1]">추천 폰트 스타일</span>
              </div>
              <div className="space-y-2.5">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase tracking-wider text-[#D1D6DB]">제목</div>
                  <p className="text-[11px] text-[#4E5968] leading-relaxed">{fontRecommendation.headline}</p>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase tracking-wider text-[#D1D6DB]">본문</div>
                  <p className="text-[11px] text-[#4E5968] leading-relaxed">{fontRecommendation.body}</p>
                </div>
                <div className="pt-1 border-t border-[#E5E8EB]">
                  <p className="text-[11px] text-[#8B95A1] italic">{fontRecommendation.mood}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== 추천 레퍼런스 가이드 ===== */}
      {manuscriptSections.length > 0 && referenceGuide && (
        <div className="rounded-xl border border-[#E5E8EB] bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E8EB]">
            <BarChart2 className="w-4 h-4 text-[#3182F6]" />
            <span className="text-xs font-medium text-[#8B95A1]">추천 레퍼런스 가이드</span>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-xs text-[#8B95A1] leading-relaxed">{referenceGuide.summary}</p>

            <div className="space-y-1.5">
              {referenceGuide.sections.map((sec, i) => {
                const hue = [210, 220, 260, 170, 340, 30][i % 6];
                const barColor = `hsl(${hue} 60% 55% / 0.15)`;
                const textColor = `hsl(${hue} 60% 45%)`;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="h-7 rounded-md flex items-center px-2.5 transition-all"
                        style={{
                          width: `${Math.max(sec.percentage, 8)}%`,
                          backgroundColor: barColor,
                          minWidth: '3rem',
                        }}
                      >
                        <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: textColor }}>
                          {sec.percentage}%
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-[#191F28]">{sec.label}</span>
                        <span className="text-[11px] text-[#8B95A1] ml-2">— {sec.tip}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <span className="text-[10px] text-[#D1D6DB] font-mono">
                합계: {referenceGuide.sections.reduce((s, r) => s + r.percentage, 0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== 섹션 목록 ===== */}
      <AnimatePresence>
        {sortedSections.map((section, idx) => {
          const colorClass = SECTION_COLORS[section.sectionType] || 'border-[#E5E8EB] bg-[#F4F5F7]';
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
                isDragOver ? 'ring-2 ring-[#3182F6]/50 scale-[1.01]' : ''
              } ${!section.visible ? 'opacity-40' : ''}`}
            >
              {/* 섹션 헤더 */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5">
                <div className="cursor-grab text-[#D1D6DB] select-none text-xs mr-1">⠿⠿</div>
                <span className="text-[10px] uppercase tracking-widest text-[#8B95A1] font-medium w-20 flex-shrink-0">
                  {SECTION_LABELS[section.sectionType] || section.sectionType}
                </span>
                {isEditing ? (
                  <input
                    value={section.title}
                    onChange={(e) => handleTitleChange(section.id, e.target.value)}
                    className="flex-1 bg-transparent text-sm font-semibold text-[#191F28] focus:outline-none border-b border-[#3182F6]/30"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="flex-1 text-sm font-semibold text-[#191F28] cursor-pointer hover:text-[#3182F6] transition-colors truncate"
                    onClick={() => setEditingId(section.id)}
                  >
                    {section.title}
                  </span>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleMoveUp(section.id)} disabled={idx === 0} className="p-1 text-[#D1D6DB] hover:text-[#191F28] disabled:opacity-20 transition-colors">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleMoveDown(section.id)} disabled={idx === sortedSections.length - 1} className="p-1 text-[#D1D6DB] hover:text-[#191F28] disabled:opacity-20 transition-colors">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleToggleVisibility(section.id)} className="p-1 text-[#D1D6DB] hover:text-[#191F28] transition-colors">
                    {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleRemove(section.id)} className="p-1 text-[#D1D6DB] hover:text-[#F04452] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 본문 편집 영역 */}
              <div className="p-4 space-y-3">
                {isEditing ? (
                  <textarea
                    ref={editingTextareaRef}
                    value={section.body}
                    onChange={(e) => handleBodyChange(section.id, e.target.value)}
                    rows={8}
                    className="w-full bg-white border border-[#E5E8EB] rounded-lg px-4 py-3 text-sm text-[#191F28] placeholder:text-[#D1D6DB] resize-y focus:outline-none focus:border-[#3182F6] transition-all leading-relaxed"
                  />
                ) : (
                  <div
                    onClick={() => setEditingId(section.id)}
                    className="text-sm text-[#4E5968] leading-relaxed whitespace-pre-wrap cursor-text hover:text-[#191F28] transition-colors min-h-[4rem] p-2 rounded-lg hover:bg-black/[0.02]"
                  >
                    {section.body}
                  </div>
                )}

                {/* 이미지 가이드 */}
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[#F4F5F7] border border-[#E5E8EB]">
                  <ImageIcon className="w-3.5 h-3.5 text-[#D1D6DB] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#8B95A1] leading-relaxed">
                    <span className="font-medium text-[#4E5968]">이미지 가이드:</span> {section.imageGuide}
                  </p>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-[#3182F6]/60 hover:text-[#3182F6] transition-colors"
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
      <div className="flex justify-between sticky bottom-0 bg-white py-4 border-t border-[#E5E8EB] -mx-4 px-4 mt-2">
        <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>이전</Button>
        {manuscriptSections.length > 0 && (
          <Button size="lg" onClick={() => dispatch({ type: 'NEXT_STEP' })}>
            다음: 이미지 에디터
          </Button>
        )}
      </div>
    </motion.div>
  );
}
