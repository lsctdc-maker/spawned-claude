'use client';

import { ManuscriptSection, ManuscriptSectionType } from '@/lib/types';

const SECTION_LABELS: Record<ManuscriptSectionType, string> = {
  hooking: '후킹', hero: '히어로', problem: '문제 공감', solution: '솔루션',
  features: '핵심 특장점', detail: '상세 설명', howto: '사용 방법',
  social_proof: '사회적 증거', trust: '신뢰 요소', specs: '스펙/상세',
  guarantee: '보증/신뢰', event_banner: '이벤트', cta: '구매 유도',
};

interface SectionListProps {
  sections: ManuscriptSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function SectionList({ sections, selectedId, onSelect }: SectionListProps) {
  return (
    <div className="w-52 bg-white border-r border-[#E5E8EB] overflow-y-auto flex-shrink-0">
      <div className="p-3">
        <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-3 px-1">
          섹션 ({sections.length})
        </div>
        <div className="space-y-1.5">
          {sections.map((section, i) => {
            const isActive = section.id === selectedId;
            return (
              <button
                key={section.id}
                onClick={() => onSelect(section.id)}
                className={`w-full text-left rounded-xl p-3 transition-all ${
                  isActive
                    ? 'bg-[#EBF4FF] ring-1 ring-[#3182F6]/40'
                    : 'hover:bg-[#F4F5F7]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                      isActive ? 'bg-[#3182F6] text-white' : 'bg-[#F4F5F7] text-[#8B95A1]'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[11px] font-semibold truncate ${
                      isActive ? 'text-[#3182F6]' : 'text-[#4E5968]'
                    }`}>
                      {SECTION_LABELS[section.sectionType] || section.sectionType}
                    </div>
                    <div className="text-[10px] text-[#8B95A1] truncate mt-0.5">
                      {section.title?.slice(0, 20) || '제목 없음'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
