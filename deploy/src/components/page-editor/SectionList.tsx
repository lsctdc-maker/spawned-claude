'use client';

import { useState } from 'react';
import { ManuscriptSection, ManuscriptSectionType } from '@/lib/types';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

const SECTION_LABELS: Record<ManuscriptSectionType, string> = {
  hooking: '후킹', hero: '히어로', problem: '문제 공감', solution: '솔루션',
  features: '핵심 특장점', detail: '상세 설명', howto: '사용 방법',
  social_proof: '사회적 증거', trust: '신뢰 요소', specs: '스펙/상세',
  guarantee: '보증/신뢰', event_banner: '이벤트', cta: '구매 유도',
};

// 추가 가능한 섹션 타입 목록
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

interface SectionListProps {
  sections: ManuscriptSection[];
  allSections: ManuscriptSection[]; // visible + hidden
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: ManuscriptSectionType) => void;
  onDelete: (id: string) => void;
  onReorder: (sections: ManuscriptSection[]) => void;
  onToggleVisibility: (id: string) => void;
}

export default function SectionList({
  sections, allSections, selectedId, onSelect, onAdd, onDelete, onReorder, onToggleVisibility,
}: SectionListProps) {
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
    <div className="w-52 bg-white border-r border-[#E5E8EB] flex flex-col flex-shrink-0">
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-3 px-1">
          섹션 ({sections.length})
        </div>

        <div className="space-y-1">
          {allSections.map((section, i) => {
            const isActive = section.id === selectedId;
            const isVisible = section.visible;
            return (
              <div
                key={section.id}
                className={`group relative rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#EBF4FF] ring-1 ring-[#3182F6]/40'
                    : isVisible ? 'hover:bg-[#F4F5F7]' : 'opacity-40'
                }`}
              >
                <button
                  onClick={() => onSelect(section.id)}
                  className="w-full text-left p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      isActive ? 'bg-[#3182F6] text-white' : 'bg-[#F4F5F7] text-[#8B95A1]'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[11px] font-semibold truncate ${
                        isActive ? 'text-[#3182F6]' : 'text-[#4E5968]'
                      }`}>
                        {SECTION_LABELS[section.sectionType] || section.sectionType}
                      </div>
                      <div className="text-[9px] text-[#8B95A1] truncate">
                        {section.title?.slice(0, 18) || '제목 없음'}
                      </div>
                    </div>
                  </div>
                </button>

                {/* 액션 버튼 (hover 시 표시) */}
                <div className="absolute right-1 top-1 hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSection(i, -1); }}
                    disabled={i === 0}
                    className="p-0.5 rounded text-[#8B95A1] hover:text-[#191F28] hover:bg-white disabled:opacity-20"
                    title="위로"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSection(i, 1); }}
                    disabled={i === allSections.length - 1}
                    className="p-0.5 rounded text-[#8B95A1] hover:text-[#191F28] hover:bg-white disabled:opacity-20"
                    title="아래로"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(section.id); }}
                    className="p-0.5 rounded text-[#8B95A1] hover:text-[#191F28] hover:bg-white"
                    title={isVisible ? '숨기기' : '표시'}
                  >
                    {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`"${SECTION_LABELS[section.sectionType]}" 섹션을 삭제하시겠습니까?`)) {
                        onDelete(section.id);
                      }
                    }}
                    className="p-0.5 rounded text-[#8B95A1] hover:text-red-500 hover:bg-red-50"
                    title="삭제"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 섹션 추가 버튼 */}
      <div className="p-3 border-t border-[#E5E8EB] relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold text-[#3182F6] bg-[#EBF4FF] rounded-xl hover:bg-[#D6E8FF] transition-colors"
        >
          <Plus className="w-4 h-4" />
          섹션 추가
        </button>

        {/* 섹션 타입 선택 드롭다운 */}
        {showAddMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-[#E5E8EB] rounded-xl shadow-xl max-h-[360px] overflow-y-auto z-50">
            <div className="p-2">
              {ADDABLE_SECTIONS.map(({ type, label, desc }) => (
                <button
                  key={type}
                  onClick={() => { onAdd(type); setShowAddMenu(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F4F5F7] transition-colors"
                >
                  <div className="text-[12px] font-semibold text-[#191F28]">{label}</div>
                  <div className="text-[10px] text-[#8B95A1]">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
