'use client';

import { useState } from 'react';
import { ReviewContent, TextStyle } from '@/lib/types';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import TextStyleBar from '@/components/ui/TextStyleBar';

const DEFAULT_STYLE: TextStyle = { fontSize: 16, color: '#111827' };

interface SectionReviewsProps {
  content: ReviewContent;
  sectionId: string;
  styles?: TextStyle;
}

export default function SectionReviews({ content, sectionId, styles }: SectionReviewsProps) {
  const { state, dispatch } = useDetailPage();
  const [isEditing, setIsEditing] = useState(false);
  const [editReviews, setEditReviews] = useState(content.reviews);
  const [editStyles, setEditStyles] = useState<TextStyle>(styles ?? DEFAULT_STYLE);

  const category = state.productInfo.category
    ? CATEGORIES[state.productInfo.category as keyof typeof CATEGORIES]
    : null;
  const primaryColor = category?.primary || '#6366F1';

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { id: sectionId, data: { content: { reviews: editReviews }, styles: editStyles } },
    });
    setIsEditing(false);
  };

  const updateReview = (index: number, field: string, value: string | number) => {
    const updated = [...editReviews];
    updated[index] = { ...updated[index], [field]: value };
    setEditReviews(updated);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#FBBF24' : '#D1D5DB' }}>
        ★
      </span>
    ));
  };

  if (isEditing) {
    return (
      <div className="p-6 space-y-4 bg-gray-50">
        <TextStyleBar style={editStyles} onChange={setEditStyles} />
        {editReviews.map((review, idx) => (
          <div key={idx} className="p-4 bg-white rounded-xl space-y-2">
            <div className="flex gap-3">
              <input
                value={review.author}
                onChange={(e) => updateReview(idx, 'author', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="작성자"
                style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
              />
              <select
                value={review.rating}
                onChange={(e) => updateReview(idx, 'rating', Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}점</option>
                ))}
              </select>
            </div>
            <textarea
              value={review.text}
              onChange={(e) => updateReview(idx, 'text', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
            />
          </div>
        ))}
        <div className="flex gap-2 justify-end">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-200">취소</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700">저장</button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-editable py-16 px-8 cursor-pointer" onClick={() => setIsEditing(true)}>
      <div className="section-edit-overlay">
        <span className="px-3 py-1.5 rounded-lg bg-white shadow-md text-xs text-gray-500">클릭하여 편집</span>
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">고객 후기</h2>
      <div className="max-w-2xl mx-auto space-y-4">
        {content.reviews.map((review, idx) => (
          <div key={idx} className="p-6 bg-gray-50 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="font-medium" style={{ fontSize: styles?.fontSize, color: styles?.color ?? '#111827' }}>{review.author}</p>
                  <div className="text-sm">{renderStars(review.rating)}</div>
                </div>
              </div>
              <span className="text-xs text-gray-400">{review.date}</span>
            </div>
            <p className="leading-relaxed" style={{ fontSize: styles?.fontSize, color: styles?.color ?? 'rgb(55 65 81)' }}>{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
