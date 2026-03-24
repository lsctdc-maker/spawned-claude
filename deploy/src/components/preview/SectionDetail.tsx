'use client';

import { useCallback } from 'react';
import { DetailContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';
import { ImageIcon, Loader2, Sparkles } from 'lucide-react';
import EditableText from './EditableText';

interface SectionDetailProps {
  content: DetailContent;
  sectionId: string;
}

export default function SectionDetail({ content, sectionId }: SectionDetailProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo, images, imageGenerating } = state;

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#c3c0ff';

  const parseFeatureImages = (): string[] => {
    const raw = images.features;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getFeatureImage = (index: number): string | undefined => {
    return parseFeatureImages()[index];
  };

  const updateParagraph = useCallback((idx: number, field: string, value: string) => {
    const newParagraphs = [...content.paragraphs];
    newParagraphs[idx] = { ...newParagraphs[idx], [field]: value };
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: { ...content, paragraphs: newParagraphs } } } });
  }, [dispatch, sectionId, content]);

  const handleGenerateImage = useCallback(async (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const key = `feature-${index}`;
    if (imageGenerating[key]) return;

    dispatch({ type: 'SET_IMAGE_GENERATING', payload: { key, generating: true } });

    try {
      const paragraph = content.paragraphs[index];
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feature',
          productName: productInfo.name,
          category: productInfo.category,
          usps: paragraph ? [paragraph.title] : [],
          tone: state.selectedTone,
        }),
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        const currentFeatures = parseFeatureImages();
        const newFeatures = [...currentFeatures];
        newFeatures[index] = data.imageUrl;
        dispatch({ type: 'SET_IMAGE', payload: { key: 'features', url: JSON.stringify(newFeatures) } });
      }
    } catch (error) {
      console.error('Feature image generation failed:', error);
    } finally {
      dispatch({ type: 'SET_IMAGE_GENERATING', payload: { key, generating: false } });
    }
  }, [imageGenerating, dispatch, productInfo, content.paragraphs, state.selectedTone, images.features]);

  return (
    <div className="py-16 px-8">
      <div className="max-w-6xl mx-auto">
        {content.paragraphs.map((para, idx) => {
          const featureImg = getFeatureImage(idx);
          const isGenerating = imageGenerating[`feature-${idx}`] || false;

          return (
            <div key={idx} className={`flex gap-8 items-center mb-12 ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <EditableText
                  tag="h2"
                  value={para.title}
                  onSave={(v) => updateParagraph(idx, 'title', v)}
                  className="text-2xl font-headline font-bold mb-4"
                  style={{ color: primaryColor }}
                />
                <EditableText
                  tag="p"
                  value={para.text}
                  onSave={(v) => updateParagraph(idx, 'text', v)}
                  className="text-[#c7c4d8] leading-relaxed"
                  multiline
                />
              </div>
              <div className="flex-1 relative group/img">
                {featureImg ? (
                  <div className="w-full h-64 rounded-2xl overflow-hidden relative">
                    <img
                      src={featureImg}
                      alt={para.title}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    {/* 이미지 재생성 오버레이 */}
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                      <button
                        onClick={(e) => handleGenerateImage(e, idx)}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#201f1f]/90 text-[#c3c0ff] border border-[#c3c0ff]/20 disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 생성 중...</>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5" /> 이미지 재생성</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 rounded-2xl flex flex-col items-center justify-center gap-3" style={{ backgroundColor: `${primaryColor}10` }}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-10 h-10 text-[#c3c0ff]/40 animate-spin" />
                        <span className="text-xs text-[#c7c4d8]/50">이미지 생성 중...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-16 h-16 text-[#e5e2e1]/20" />
                        <button
                          onClick={(e) => handleGenerateImage(e, idx)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#201f1f]/60 text-[#c3c0ff] border border-[#c3c0ff]/15 hover:bg-[#201f1f] transition-all"
                        >
                          <Sparkles className="w-3 h-3" />
                          AI 이미지 생성
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
