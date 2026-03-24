'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import { CategoryKey } from '@/lib/types';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';
import { Lightbulb, Upload, Link } from 'lucide-react';

export default function Step1ProductInfo() {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;
  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [analyzeUrl, setAnalyzeUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [analyzeTab, setAnalyzeTab] = useState<'url' | 'image'>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        applyAnalysisResult(data.data);
      }
    } catch (err) {
      setAnalyzeError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setAnalyzeError('');
    setAnalyzeResult(null);
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setAnalyzeError('');
    setAnalyzeResult(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const res = await fetch('/api/analyze-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: imageFile.type,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setAnalyzeError(data.error || '이미지 분석에 실패했습니다.');
        return;
      }

      if (data.success && data.data) {
        applyAnalysisResult(data.data);
      }
    } catch (err) {
      setAnalyzeError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAnalysisResult = (result: any) => {
    setAnalyzeResult(result);
    const updates: Record<string, any> = {};
    if (result.productName) updates.name = result.productName;
    if (result.category) updates.category = result.category;
    if (result.price) updates.price = result.price;
    if (result.targetCustomer) updates.targetAudience = result.targetCustomer;
    if (result.features) updates.shortDescription = result.features;
    if (Object.keys(updates).length > 0) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: updates });
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
      className="max-w-3xl mx-auto"
    >
      {/* Form Card */}
      <div className="bg-[#201f1f] rounded-xl shadow-[0_40px_100px_rgba(0,0,0,0.4)] p-8 md:p-12 relative overflow-hidden">
        {/* Subtle glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c3c0ff]/5 blur-[100px] rounded-full -mr-32 -mt-32" />

        <header className="mb-10 relative">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-[#e5e2e1] mb-2">상품 정보 입력</h1>
          <p className="text-[#c7c4d8]">AI 기획에 필요한 기본 정보를 입력해주세요.</p>
        </header>

        <div className="space-y-8 relative">
          {/* 분석 섹션 */}
          <div className="p-5 rounded-xl bg-[#c3c0ff]/5 border border-[#c3c0ff]/10">
            <label className="block text-xs uppercase tracking-widest text-[#c3c0ff]/70 mb-3 ml-1 font-label">
              기존 상세페이지가 있으신가요? (선택)
            </label>

            {/* 탭 */}
            <div className="flex gap-1 mb-3">
              <button
                onClick={() => { setAnalyzeTab('url'); setAnalyzeError(''); setAnalyzeResult(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${analyzeTab === 'url' ? 'bg-[#c3c0ff]/20 text-[#c3c0ff]' : 'text-[#e5e2e1]/40 hover:text-[#e5e2e1]/70'}`}
              >
                <Link className="w-3 h-3" />
                URL 입력
              </button>
              <button
                onClick={() => { setAnalyzeTab('image'); setAnalyzeError(''); setAnalyzeResult(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${analyzeTab === 'image' ? 'bg-[#c3c0ff]/20 text-[#c3c0ff]' : 'text-[#e5e2e1]/40 hover:text-[#e5e2e1]/70'}`}
              >
                <Upload className="w-3 h-3" />
                이미지 업로드
              </button>
            </div>

            {analyzeTab === 'url' ? (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={analyzeUrl}
                  onChange={(e) => setAnalyzeUrl(e.target.value)}
                  placeholder="https://smartstore.naver.com/..."
                  className="flex-1 bg-[#1c1b1b] border-0 border-b border-[#464555]/20 py-3 px-2 text-sm text-[#e5e2e1] placeholder:text-[#e5e2e1]/20 focus:outline-none focus:ring-0 focus:border-[#c3c0ff] transition-all"
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
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img src={imagePreview} alt="업로드된 이미지" className="w-full max-h-40 object-contain rounded-lg border border-[#464555]/20" />
                      <button
                        onClick={() => { setImageFile(null); setImagePreview(''); setAnalyzeResult(null); }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1c1b1b]/80 text-[#e5e2e1]/60 hover:text-[#e5e2e1] text-xs flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAnalyzeImage}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? '분석 중...' : 'AI로 분석하기'}
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border border-dashed border-[#464555]/30 rounded-lg text-center hover:border-[#c3c0ff]/40 transition-all group"
                  >
                    <Upload className="w-6 h-6 text-[#e5e2e1]/30 group-hover:text-[#c3c0ff]/60 mx-auto mb-2 transition-colors" />
                    <p className="text-sm text-[#e5e2e1]/40 group-hover:text-[#e5e2e1]/60 transition-colors">
                      상세페이지 스크린샷을 업로드하세요
                    </p>
                    <p className="text-xs text-[#e5e2e1]/20 mt-1">PNG, JPG, WEBP</p>
                  </button>
                )}
              </div>
            )}

            {analyzeError && (
              <p className="mt-2 text-sm text-[#ffb4ab]">{analyzeError}</p>
            )}
            {analyzeResult && (
              <div className="mt-3 p-3 rounded-lg bg-[#2ed573]/10 border border-[#2ed573]/20">
                <p className="text-sm text-[#2ed573] font-medium">분석 완료! 기본 정보가 자동으로 채워졌습니다.</p>
                {analyzeResult.improvementSuggestions?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-[#c7c4d8] font-medium mb-1">개선 제안:</p>
                    {analyzeResult.improvementSuggestions.map((s: string, i: number) => (
                      <p key={i} className="text-xs text-[#c7c4d8]/70">• {s}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Name */}
          <Input
            label="상품명 *"
            placeholder="예: 시그니처 세라믹 화병"
            value={productInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
          />

          {/* Category Grid - 15 categories */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#e5e2e1]/50 mb-4 ml-1 font-label">카테고리 *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {(Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][]).map(
                ([key, cat]) => {
                  const isSelected = productInfo.category === key;
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleCategorySelect(key)}
                      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#c3c0ff]/5 border border-[#c3c0ff]/40 shadow-[0_0_15px_rgba(195,192,255,0.1)]'
                          : 'bg-[#2a2a2a] border border-[#464555]/15 hover:border-[#c3c0ff]/50 hover:bg-[#353534]'
                      }`}
                    >
                      <span className={`text-[11px] font-medium leading-tight text-center ${isSelected ? 'text-[#c3c0ff]' : 'text-[#e5e2e1]'}`}>{cat.label}</span>
                    </motion.button>
                  );
                }
              )}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-[#ffb4ab]">{errors.category}</p>
            )}
          </div>

          {/* Price */}
          <Input
            label="판매 가격"
            placeholder="예: 29,900원"
            value={productInfo.price}
            onChange={(e) => handleChange('price', e.target.value)}
          />

          {/* Target Audience */}
          <Input
            label="타겟 고객"
            placeholder="예: 라이프스타일에 가치를 두는 30~40대 전문직"
            value={productInfo.targetAudience}
            onChange={(e) => handleChange('targetAudience', e.target.value)}
          />

          {/* Short Description */}
          <TextArea
            label="상품 간단 설명 *"
            placeholder="제품의 핵심 특징과 차별점을 간결하게 설명해주세요..."
            value={productInfo.shortDescription}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            error={errors.shortDescription}
            rows={3}
          />

          {/* Keyword Tags */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#e5e2e1]/50 mb-3 ml-1 font-label">키워드 태그</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="키워드 입력 후 Enter"
                className="flex-1 bg-[#1c1b1b] border-0 border-b border-[#464555]/20 py-3 px-2 text-sm text-[#e5e2e1] placeholder:text-[#e5e2e1]/20 focus:outline-none focus:ring-0 focus:border-[#c3c0ff] transition-all"
              />
              <Button variant="secondary" size="sm" onClick={handleAddKeyword}>추가</Button>
            </div>
            {productInfo.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {productInfo.keywords.map((keyword) => (
                  <span key={keyword} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#c3c0ff]/10 text-[#c3c0ff] text-sm border border-[#c3c0ff]/20">
                    {keyword}
                    <button onClick={() => handleRemoveKeyword(keyword)} className="text-[#c3c0ff]/50 hover:text-[#c3c0ff] ml-1">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <Button size="lg" fullWidth onClick={handleNext} className="flex items-center justify-center gap-2">
              다음 단계로
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Pro Studio Tip */}
      <div className="mt-8 bg-[#c3c0ff]/5 border border-[#c3c0ff]/10 rounded-xl p-5 flex gap-4">
        <Lightbulb className="w-5 h-5 text-[#c3c0ff] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#c3c0ff]">Pro Studio Tip</p>
          <p className="text-[13px] text-[#dad7ff] leading-relaxed">상품명에 &lsquo;유기농&rsquo;, &lsquo;프리미엄&rsquo;, &lsquo;한정판&rsquo; 등 핵심 키워드를 포함하면 AI가 더 정확한 브랜딩 전략을 수립할 수 있습니다.</p>
        </div>
      </div>
    </motion.div>
  );
}
