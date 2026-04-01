'use client';

import { useCallback } from 'react';
import { ReviewContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';
import { Star } from 'lucide-react';
import EditableText from './EditableText';

interface SectionReviewsProps {
  content: ReviewContent;
  sectionId: string;
}

export default function SectionReviews({ content, sectionId }: SectionReviewsProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#3182F6';

  const updateReview = useCallback((idx: number, field: string, value: string) => {
    const newReviews = [...content.reviews];
    newReviews[idx] = { ...newReviews[idx], [field]: value };
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: { ...content, reviews: newReviews } } } });
  }, [dispatch, sectionId, content]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="w-4 h-4" fill={i < rating ? '#FCD34D' : '#353534'} stroke="none" />
    ));
  };

  return (
    <div className="py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-center mb-12" style={{ color: primaryColor }}>고객 리뷰</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.reviews.map((review, idx) => (
            <div key={idx} className="p-6 rounded-xl" style={{ backgroundColor: `${primaryColor}10`, borderLeft: `4px solid ${primaryColor}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm primary-gradient text-white">{review.author.charAt(0)}</div>
                <div>
                  <EditableText
                    tag="p"
                    value={review.author}
                    onSave={(v) => updateReview(idx, 'author', v)}
                    className="font-bold text-sm text-[#191F28]"
                  />
                  <p className="text-xs text-[#191F28]/40">{review.date || '최근'}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">{renderStars(review.rating)}</div>
              <EditableText
                tag="p"
                value={review.text}
                onSave={(v) => updateReview(idx, 'text', v)}
                className="text-[#8B95A1]"
                multiline
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
