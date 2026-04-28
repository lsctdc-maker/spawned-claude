'use client';

import { useRef } from 'react';
import { ManuscriptSection, ManuscriptSectionType } from '@/lib/types';
import { Download, Upload, Sparkles, Type, Image as ImageIcon } from 'lucide-react';

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
  onExportSectionPng?: (sectionId: string) => void;
  exporting: boolean;
  sectionImage?: string | null;
  onImageUpload?: (sectionId: string, dataUrl: string) => void;
  sectionBgColor?: string;
  onBgColorChange?: (sectionId: string, color: string) => void;
}

export default function PropertiesPanel({
  selectedSection, colors, onUpdateSection, onExportPng, onExportSectionPng,
  exporting, sectionImage, onImageUpload, sectionBgColor, onBgColorChange,
}: PropertiesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSection || !onImageUpload) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageUpload(selectedSection.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="w-64 bg-white border-l border-[#E5E8EB] flex flex-col flex-shrink-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* 컬러 팔레트 */}
        <div>
          <div className="text-[9px] uppercase tracking-widest text-[#8B95A1] mb-2">컬러</div>
          <div className="flex gap-2">
            {Object.entries(colors).map(([key, hex]) => (
              <div key={key} className="text-center">
                <div
                  className="w-9 h-9 rounded-xl border border-[#E5E8EB] cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: hex }}
                  title={`${key}: ${hex}`}
                />
                <div className="text-[8px] text-[#8B95A1] mt-1">{key}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 선택된 섹션 편집 */}
        {selectedSection ? (
          <>
            <div className="border-t border-[#E5E8EB] pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Type className="w-3.5 h-3.5 text-[#8B95A1]" />
                <span className="text-[10px] uppercase tracking-widest text-[#8B95A1] font-semibold">
                  {SECTION_LABELS[selectedSection.sectionType]} 편집
                </span>
              </div>

              {/* 제목 */}
              <div className="mb-3">
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
              <div className="mb-3">
                <label className="text-[11px] font-semibold text-[#4E5968] block mb-1">본문</label>
                <textarea
                  value={selectedSection.body || ''}
                  onChange={e => onUpdateSection(selectedSection.id, { body: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-[#E5E8EB] rounded-lg focus:ring-2 focus:ring-[#3182F6]/30 focus:border-[#3182F6] outline-none resize-none leading-relaxed"
                  placeholder="섹션 본문"
                />
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div className="border-t border-[#E5E8EB] pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <ImageIcon className="w-3.5 h-3.5 text-[#8B95A1]" />
                <span className="text-[10px] uppercase tracking-widest text-[#8B95A1] font-semibold">이미지</span>
              </div>

              {sectionImage ? (
                <div className="relative mb-2">
                  <img src={sectionImage} alt="섹션 이미지" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg text-white text-xs font-semibold"
                  >
                    이미지 교체
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-[#E5E8EB] rounded-xl hover:border-[#3182F6]/30 hover:bg-[#F4F5F7] transition-colors"
                >
                  <Upload className="w-5 h-5 text-[#8B95A1]" />
                  <span className="text-[11px] text-[#8B95A1]">이미지 추가</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* 배경색 */}
            <div className="border-t border-[#E5E8EB] pt-4">
              <label className="text-[11px] font-semibold text-[#4E5968] block mb-2">배경색</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={sectionBgColor || '#FFFFFF'}
                  onChange={e => onBgColorChange?.(selectedSection.id, e.target.value)}
                  className="w-8 h-8 rounded-lg border border-[#E5E8EB] cursor-pointer"
                />
                <span className="text-[11px] text-[#8B95A1] font-mono">
                  {sectionBgColor || '#FFFFFF'}
                </span>
              </div>
            </div>

            {/* 섹션 타입/순서 */}
            <div className="text-[10px] text-[#8B95A1] px-1">
              타입: {selectedSection.sectionType} · 순서: {selectedSection.order + 1}
            </div>

            {/* 이 섹션 PNG */}
            {onExportSectionPng && (
              <button
                onClick={() => onExportSectionPng(selectedSection.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-[#4E5968] border border-[#E5E8EB] rounded-lg hover:bg-[#F4F5F7] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                이 섹션만 PNG
              </button>
            )}
          </>
        ) : (
          <div className="border-t border-[#E5E8EB] pt-4 text-center py-8">
            <p className="text-[12px] text-[#8B95A1]">
              좌측에서 섹션을 선택하면<br />여기서 편집할 수 있습니다
            </p>
          </div>
        )}
      </div>

      {/* 하단: 내보내기 */}
      <div className="p-3 border-t border-[#E5E8EB]">
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
  );
}
