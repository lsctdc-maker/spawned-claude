'use client';

import { useCallback } from 'react';
import { HeroContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';
import { ImageIcon, Loader2, Sparkles } from 'lucide-react';
import EditableText from './EditableText';

interface SectionHeroProps {
  content: HeroContent;
  sectionId: string;
}

export default function SectionHero({ content, sectionId }: SectionHeroProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo, images, imageGenerating } = state;

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#c3c0ff';
  const heroImage = images.hero;
  const isGeneratingImage = imageGenerating['hero'] || false;

  const updateContent = useCallback((field: keyof HeroContent, value: string) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: { ...content, [field]: value } } } });
  }, [dispatch, sectionId, content]);

  const handleGenerateImage = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGeneratingImage) return;

    dispatch({ type: 'SET_IMAGE_GENERATING', payload: { key: 'hero', generating: true } });

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hero',
          productName: productInfo.name,
          category: productInfo.category,
          usps: state.extractedUSPs.map((u) => u.title),
          tone: state.selectedTone,
        }),
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        dispatch({ type: 'SET_IMAGE', payload: { key: 'hero', url: data.imageUrl } });
      }
    } catch (error) {
      console.error('Hero image generation failed:', error);
    } finally {
      dispatch({ type: 'SET_IMAGE_GENERATING', payload: { key: 'hero', generating: false } });
    }
  }, [isGeneratingImage, dispatch, productInfo, state.extractedUSPs, state.selectedTone]);

  return (
    <div className="relative">
      <div
        className="py-20 px-8 text-center relative overflow-hidden"
        style={
          heroImage
            ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}08 100%)` }
        }
      >
        {heroImage && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        )}

        <div className="relative z-10">
          <EditableText
            tag="h1"
            value={content.headline}
            onSave={(v) => updateContent('headline', v)}
            className="text-3xl sm:text-4xl font-headline font-extrabold mb-4 leading-tight"
            style={{ color: heroImage ? '#ffffff' : primaryColor }}
          />
          <EditableText
            tag="p"
            value={content.subheadline}
            onSave={(v) => updateContent('subheadline', v)}
            className="text-lg mb-8 max-w-xl mx-auto leading-relaxed"
            style={{ color: heroImage ? 'rgba(255,255,255,0.85)' : '#c7c4d8' }}
            multiline
          />
          <EditableText
            tag="span"
            value={content.ctaText}
            onSave={(v) => updateContent('ctaText', v)}
            className="inline-block px-8 py-4 rounded-full text-[#0f0069] font-bold text-lg shadow-lg primary-gradient"
          />
          {productInfo.price && <p className="mt-4 text-2xl font-bold" style={{ color: heroImage ? '#ffffff' : primaryColor }}>{productInfo.price}</p>}
        </div>

        {/* 이미지 생성 버튼 */}
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={handleGenerateImage}
            disabled={isGeneratingImage}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all bg-[#201f1f]/80 hover:bg-[#201f1f] text-[#c3c0ff] border border-[#c3c0ff]/20 backdrop-blur-sm disabled:opacity-50"
          >
            {isGeneratingImage ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />생성 중...</>
            ) : heroImage ? (
              <><Sparkles className="w-3.5 h-3.5" />이미지 재생성</>
            ) : (
              <><ImageIcon className="w-3.5 h-3.5" />AI 이미지 생성</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
