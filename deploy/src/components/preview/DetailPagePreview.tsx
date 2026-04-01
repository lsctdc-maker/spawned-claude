'use client';

import { useCallback, useState } from 'react';
import { useDetailPage } from '@/hooks/useDetailPage';
import { DetailPageSection, HeroContent, USPContent, DetailContent, ComparisonContent, HowToContent, CertificationContent, ReviewContent, FAQContent, PriceBannerContent, PackageContent, CTAContent } from '@/lib/types';
import SectionHero from './SectionHero';
import SectionUSP from './SectionUSP';
import SectionDetail from './SectionDetail';
import SectionComparison from './SectionComparison';
import SectionHowTo from './SectionHowTo';
import SectionCertification from './SectionCertification';
import SectionReviews from './SectionReviews';
import SectionFAQ from './SectionFAQ';
import SectionPriceBanner from './SectionPriceBanner';
import SectionPackage from './SectionPackage';
import SectionCTA from './SectionCTA';

function SectionWrapper({ section, onDragStart, onDragOver, onDrop, isDragging }: {
  section: DetailPageSection;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  isDragging: boolean;
}) {
  const renderSection = () => {
    switch (section.type) {
      case 'hero': return <SectionHero content={section.content as HeroContent} sectionId={section.id} />;
      case 'priceBanner': return <SectionPriceBanner content={section.content as PriceBannerContent} sectionId={section.id} />;
      case 'usp': return <SectionUSP content={section.content as USPContent} sectionId={section.id} />;
      case 'detail': return <SectionDetail content={section.content as DetailContent} sectionId={section.id} />;
      case 'comparison': return <SectionComparison content={section.content as ComparisonContent} sectionId={section.id} />;
      case 'howto': return <SectionHowTo content={section.content as HowToContent} sectionId={section.id} />;
      case 'certification': return <SectionCertification content={section.content as CertificationContent} sectionId={section.id} />;
      case 'reviews': return <SectionReviews content={section.content as ReviewContent} sectionId={section.id} />;
      case 'faq': return <SectionFAQ content={section.content as FAQContent} sectionId={section.id} />;
      case 'package': return <SectionPackage content={section.content as PackageContent} sectionId={section.id} />;
      case 'cta': return <SectionCTA content={section.content as CTAContent} sectionId={section.id} />;
      default: return null;
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, section.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, section.id)}
      className={`relative group transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: 'rgba(25,31,40,0.03)' }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="block w-4 h-0.5 bg-[#191F28]/30 rounded" />
          <span className="block w-4 h-0.5 bg-[#191F28]/30 rounded" />
          <span className="block w-4 h-0.5 bg-[#191F28]/30 rounded" />
        </div>
      </div>
      {renderSection()}
    </div>
  );
}

export default function DetailPagePreview() {
  const { state, dispatch } = useDetailPage();
  const { generatedSections } = state;
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const visibleSections = generatedSections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      return;
    }

    const oldIndex = visibleSections.findIndex((s) => s.id === sourceId);
    const newIndex = visibleSections.findIndex((s) => s.id === targetId);

    if (oldIndex === -1 || newIndex === -1) {
      setDraggedId(null);
      return;
    }

    const reordered = [...visibleSections];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updated = reordered.map((section, index) => ({ ...section, order: index }));
    const hiddenSections = generatedSections.filter((s) => !s.visible);
    dispatch({ type: 'REORDER_SECTIONS', payload: [...updated, ...hiddenSections] });
    setDraggedId(null);
  }, [visibleSections, generatedSections, dispatch]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);

  if (visibleSections.length === 0) {
    return (
      <div className="py-20 text-center text-[#191F28]/30">
        <p className="text-lg mb-2">표시할 섹션이 없습니다</p>
        <p className="text-sm">위의 토글 버튼으로 섹션을 활성화해주세요.</p>
      </div>
    );
  }

  return (
    <div onDragEnd={handleDragEnd}>
      {visibleSections.map((section) => (
        <SectionWrapper
          key={section.id}
          section={section}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          isDragging={draggedId === section.id}
        />
      ))}
    </div>
  );
}
