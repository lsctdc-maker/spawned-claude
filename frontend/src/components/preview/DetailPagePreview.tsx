'use client';

import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDetailPage } from '@/hooks/useDetailPage';
import { DetailPageSection, HeroContent, USPContent, DetailContent, ComparisonContent, HowToContent, CertificationContent, ReviewContent, FAQContent, CTAContent } from '@/lib/types';
import SectionHero from './SectionHero';
import SectionUSP from './SectionUSP';
import SectionDetail from './SectionDetail';
import SectionComparison from './SectionComparison';
import SectionHowTo from './SectionHowTo';
import SectionCertification from './SectionCertification';
import SectionReviews from './SectionReviews';
import SectionFAQ from './SectionFAQ';
import SectionCTA from './SectionCTA';

// ===== Sortable Wrapper =====
function SortableSection({ section }: { section: DetailPageSection }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  const renderSection = () => {
    switch (section.type) {
      case 'hero':
        return <SectionHero content={section.content as HeroContent} sectionId={section.id} styles={section.styles} />;
      case 'usp':
        return <SectionUSP content={section.content as USPContent} sectionId={section.id} styles={section.styles} />;
      case 'detail':
        return <SectionDetail content={section.content as DetailContent} sectionId={section.id} styles={section.styles} />;
      case 'comparison':
        return <SectionComparison content={section.content as ComparisonContent} sectionId={section.id} styles={section.styles} />;
      case 'howto':
        return <SectionHowTo content={section.content as HowToContent} sectionId={section.id} styles={section.styles} />;
      case 'certification':
        return <SectionCertification content={section.content as CertificationContent} sectionId={section.id} styles={section.styles} />;
      case 'reviews':
        return <SectionReviews content={section.content as ReviewContent} sectionId={section.id} styles={section.styles} />;
      case 'faq':
        return <SectionFAQ content={section.content as FAQContent} sectionId={section.id} styles={section.styles} />;
      case 'cta':
        return <SectionCTA content={section.content as CTAContent} sectionId={section.id} styles={section.styles} />;
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="block w-4 h-0.5 bg-gray-400 rounded" />
          <span className="block w-4 h-0.5 bg-gray-400 rounded" />
          <span className="block w-4 h-0.5 bg-gray-400 rounded" />
        </div>
      </div>
      {renderSection()}
    </div>
  );
}

// ===== Main Preview =====
export default function DetailPagePreview() {
  const { state, dispatch } = useDetailPage();
  const { generatedSections } = state;

  const visibleSections = generatedSections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = visibleSections.findIndex((s) => s.id === active.id);
      const newIndex = visibleSections.findIndex((s) => s.id === over.id);

      const reordered = arrayMove(visibleSections, oldIndex, newIndex).map(
        (section, index) => ({ ...section, order: index })
      );

      // 보이지 않는 섹션도 유지
      const hiddenSections = generatedSections.filter((s) => !s.visible);
      dispatch({ type: 'REORDER_SECTIONS', payload: [...reordered, ...hiddenSections] });
    },
    [visibleSections, generatedSections, dispatch]
  );

  if (visibleSections.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-lg mb-2">표시할 섹션이 없습니다</p>
        <p className="text-sm">위의 토글 버튼으로 섹션을 활성화해주세요.</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleSections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="divide-y divide-gray-100">
          {visibleSections.map((section) => (
            <SortableSection key={section.id} section={section} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
