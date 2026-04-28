'use client';

import { ManuscriptSection, ManuscriptSectionType } from '@/lib/types';
import { Download } from 'lucide-react';

const SECTION_LABELS: Record<ManuscriptSectionType, string> = {
  hooking: '후킹', hero: '히어로', problem: '문제 공감', solution: '솔루션',
  features: '핵심 특장점', detail: '상세 설명', howto: '사용 방법',
  social_proof: '사회적 증거', trust: '신뢰 요소', specs: '스펙/상세',
  guarantee: '보증/신뢰', event_banner: '이벤트', cta: '구매 유도',
};

interface PropertiesPanelProps {
  selectedSection: ManuscriptSection | null;
  colors: { primary: string; secondary: string; text: string; accent: string };
  onUpdateSection: (id: string, data: Partial<ManuscriptSection>) => void;
  onExportPng: () => void;
  exporting: boolean;
}

export default function PropertiesPanel({
  selectedSection, colors, onUpdateSection, onExportPng, exporting,
}: PropertiesPanelProps) {
  return (
    <div className="w-64 bg-white border-l border-[#E5E8EB] overflow-y-auto flex-shrink-0">
      <div className="p-4 space-y-6">

        {/* 컬러 팔레트 */}
        <div>
          <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-2">컬러</div>
          <div className="flex gap-2">
            {Object.entries(colors).map(([key, hex]) => (
              <div key={key} className="text-center">
                <div
                  className="w-10 h-10 rounded-xl border border-[#E5E8EB] cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: hex }}
                  title={`${key}: ${hex}`}
                />
                <div className="text-[8px] text-[#8B95A1] mt-1">{key}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 선택된 섹션 정보 */}
        {selectedSection ? (
          <>
            <div className="border-t border-[#E5E8EB] pt-4">
              <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-3">
                {SECTION_LABELS[selectedSection.sectionType]} 편집
              </div>

              {/* 제목 */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-[#4E5968] block mb-1">제목</label>
                <input
                  type="text"
                  value={selectedSection.title || ''}
                  onChange={e => onUpdateSection(selectedSection.id, { title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E5E8EB] rounded-lg focus:ring-2 focus:ring-[#3182F6]/30 focus:border-[#3182F6] outline-none"
                  placeholder="섹션 제목"
                />
              </div>

              {/* 본문 */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-[#4E5968] block mb-1">본문</label>
                <textarea
                  value={selectedSection.body || ''}
                  onChange={e => onUpdateSection(selectedSection.id, { body: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-[#E5E8EB] rounded-lg focus:ring-2 focus:ring-[#3182F6]/30 focus:border-[#3182F6] outline-none resize-none leading-relaxed"
                  placeholder="섹션 본문 내용"
                />
              </div>

              {/* 이미지 가이드 */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-[#4E5968] block mb-1">이미지 가이드</label>
                <textarea
                  value={selectedSection.imageGuide || ''}
                  onChange={e => onUpdateSection(selectedSection.id, { imageGuide: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-[#E5E8EB] rounded-lg focus:ring-2 focus:ring-[#3182F6]/30 focus:border-[#3182F6] outline-none resize-none text-[#8B95A1]"
                  placeholder="이미지 설명/참조"
                />
              </div>

              {/* 섹션 타입 표시 */}
              <div className="text-[10px] text-[#8B95A1] px-1">
                타입: {selectedSection.sectionType} · 순서: {selectedSection.order + 1}
              </div>
            </div>
          </>
        ) : (
          <div className="border-t border-[#E5E8EB] pt-4">
            <div className="text-center py-8">
              <p className="text-[12px] text-[#8B95A1]">
                좌측에서 섹션을 선택하면<br />여기서 내용을 편집할 수 있습니다
              </p>
            </div>
          </div>
        )}

        {/* 내보내기 */}
        <div className="border-t border-[#E5E8EB] pt-4">
          <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-3">내보내기</div>
          <button
            onClick={onExportPng}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#3182F6] text-white rounded-xl font-semibold text-sm hover:bg-[#1E67D9] transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? '내보내는 중...' : '전체 페이지 PNG'}
          </button>
        </div>
      </div>
    </div>
  );
}
