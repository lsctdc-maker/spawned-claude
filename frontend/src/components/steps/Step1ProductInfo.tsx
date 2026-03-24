'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import { CategoryKey } from '@/lib/types';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Step1ProductInfo() {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;
  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [analyzeUrl, setAnalyzeUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState<{ improvementSuggestions?: string[] } | null>(null);

  const handleChange = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { [field]: value } });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategorySelect = (key: CategoryKey) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { category: key } });
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: '' }));
    }
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !productInfo.keywords.includes(trimmed)) {
      dispatch({
        type: 'UPDATE_PRODUCT',
        payload: { keywords: [...productInfo.keywords, trimmed] },
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    dispatch({
      type: 'UPDATE_PRODUCT',
      payload: { keywords: productInfo.keywords.filter((k) => k !== keyword) },
    });
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!analyzeUrl.trim()) return;

    setIsAnalyzing(true);
    setAnalyzeError('');
    setAnalyzeResult(null);

    try {
      const res = await fetch('/api/analyze-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analyzeUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setAnalyzeError(data.error || '분석에 실패했습니다.');
        return;
      }

      if (data.success && data.data) {
        const result = data.data;
        setAnalyzeResult(result);

        const updates: Record<string, string> = {};
        if (result.productName) updates.name = result.productName;
        if (result.category) updates.category = result.category;
        if (result.price) updates.price = result.price;
        if (result.targetCustomer) updates.targetAudience = result.targetCustomer;
        if (result.features) updates.shortDescription = result.features;

        if (Object.keys(updates).length > 0) {
          dispatch({ type: 'UPDATE_PRODUCT', payload: updates });
        }
      }
    } catch {
      setAnalyzeError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!productInfo.name.trim()) newErrors.name = '상품명을 입력해주세요.';
    if (!productInfo.category) newErrors.category = '카테고리를 선택해주세요.';
    if (!productInfo.shortDescription.trim()) newErrors.shortDescription = '간단한 설명을 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">상품 기본 정보</h2>
        <p className="text-gray-500">판매할 상품의 기본 정보를 입력해주세요.</p>
      </div>

      {/* URL 분석 */}
      <div className="p-5 rounded-2xl bg-primary-50 border border-primary-100">
        <label className="block text-sm font-medium text-primary-700 mb-3">
          기존 상세페이지가 있으신가요? (선택)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={analyzeUrl}
            onChange={(e) => setAnalyzeUrl(e.target.value)}
            placeholder="https://smartstore.naver.com/..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAnalyzeUrl}
            disabled={!analyzeUrl.trim() || isAnalyzing}
          >
            {isAnalyzing ? '분석 중...' : '분석하기'}
          </Button>
        </div>
        {analyzeError && (
          <p className="mt-2 text-sm text-red-500">{analyzeError}</p>
        )}
        {analyzeResult && (
          <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-medium">분석 완료! 기본 정보가 자동으로 채워졌습니다.</p>
            {analyzeResult.improvementSuggestions && analyzeResult.improvementSuggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 font-medium mb-1">개선 제안:</p>
                {analyzeResult.improvementSuggestions.map((s: string, i: number) => (
                  <p key={i} className="text-xs text-gray-500">• {s}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 카테고리 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          상품 카테고리 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][]).map(
            ([key, cat]) => (
              <Card
                key={key}
                variant="interactive"
                padding="sm"
                selected={productInfo.category === key}
                onClick={() => handleCategorySelect(key)}
                className="text-center"
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-sm font-medium text-gray-700">{cat.label}</div>
              </Card>
            )
          )}
        </div>
        {errors.category && (
          <p className="mt-2 text-sm text-red-500">{errors.category}</p>
        )}
      </div>

      {/* 상품명 */}
      <Input
        label="상품명 *"
        placeholder="예: 프리미엄 유기농 콜드프레스 주스"
        value={productInfo.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
      />

      {/* 가격 */}
      <Input
        label="판매 가격"
        placeholder="예: 29,900원"
        value={productInfo.price}
        onChange={(e) => handleChange('price', e.target.value)}
      />

      {/* 타겟 고객 */}
      <Input
        label="타겟 고객"
        placeholder="예: 건강에 관심 많은 30~40대 직장인"
        value={productInfo.targetAudience}
        onChange={(e) => handleChange('targetAudience', e.target.value)}
      />

      {/* 간단 설명 */}
      <TextArea
        label="상품 간단 설명 *"
        placeholder="상품의 핵심 특징과 장점을 간단히 설명해주세요..."
        value={productInfo.shortDescription}
        onChange={(e) => handleChange('shortDescription', e.target.value)}
        error={errors.shortDescription}
        rows={3}
      />

      {/* 키워드 태그 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          키워드 태그
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
            placeholder="키워드 입력 후 Enter"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <Button variant="secondary" size="sm" onClick={handleAddKeyword}>
            추가
          </Button>
        </div>
        {productInfo.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {productInfo.keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm"
              >
                {keyword}
                <button
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="text-primary-400 hover:text-primary-600 ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 다음 버튼 */}
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleNext}>
          다음: AI 인터뷰
        </Button>
      </div>
    </motion.div>
  );
}
