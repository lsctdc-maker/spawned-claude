'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES, TARGET_AGE_OPTIONS, TARGET_GENDER_OPTIONS, TONE_STYLES } from '@/lib/constants';
import { CategoryKey, ProductPhoto, TargetAge, TargetGender, ToneKey } from '@/lib/types';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';
import { authFetch } from '@/lib/auth-fetch';
import {
  Upload, X, Link, ImageIcon, ChevronDown, ChevronUp,
  Monitor, Shirt, Home, Sparkles, UtensilsCrossed, Dumbbell,
  Heart, Lamp, PawPrint, Baby, Car, PenTool, Wine, Cpu, MoreHorizontal,
} from 'lucide-react';

const MAX_PHOTOS = 10;

// Category icon mapping
const CATEGORY_ICON_MAP: Record<CategoryKey, React.ElementType> = {
  electronics: Monitor,
  fashion: Shirt,
  interior: Home,
  cosmetics: Sparkles,
  food: UtensilsCrossed,
  sports: Dumbbell,
  health: Heart,
  living: Lamp,
  pets: PawPrint,
  kids: Baby,
  automotive: Car,
  stationery: PenTool,
  beverages: Wine,
  digital: Cpu,
  others: MoreHorizontal,
};

// Main 6 categories shown by default
const MAIN_CATEGORIES: CategoryKey[] = ['electronics', 'fashion', 'interior', 'cosmetics', 'food', 'sports'];

export default function Step1ProductInfo() {
  const { state, dispatch } = useDetailPage();
  const { productInfo, productPhotos } = state;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Naver Shopping auto-search
  const [competitorData, setCompetitorData] = useState<any>(null);
  const [searchingCompetitors, setSearchingCompetitors] = useState(false);

  useEffect(() => {
    const name = productInfo.name;
    if (!name || name.length < 2) return;

    const timer = setTimeout(async () => {
      setSearchingCompetitors(true);
      try {
        const res = await fetch('/api/competitor-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: name, display: 10 }),
        });
        const data = await res.json();
        if (data.success) setCompetitorData(data.data.insights);
      } catch {}
      setSearchingCompetitors(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [productInfo.name]);

  // Competitor analysis
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzeTab, setAnalyzeTab] = useState<'url' | 'image'>('url');
  const [analyzeUrl, setAnalyzeUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [compImageFile, setCompImageFile] = useState<File | null>(null);
  const [compImagePreview, setCompImagePreview] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const compFileInputRef = useRef<HTMLInputElement>(null);

  // ===== Photo handling =====
  const processImageFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const remaining = MAX_PHOTOS - productPhotos.length;
    const toProcess = fileArray.slice(0, remaining);
    for (const file of toProcess) {
      const dataUrl = await readFileAsDataUrl(file);
      const photo: ProductPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        dataUrl,
        name: file.name,
      };
      dispatch({ type: 'ADD_PRODUCT_PHOTO', payload: photo });
    }
  }, [productPhotos.length, dispatch]);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

  const handlePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processImageFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processImageFiles(e.dataTransfer.files);
  };
  const handleRemovePhoto = (id: string) => dispatch({ type: 'REMOVE_PRODUCT_PHOTO', payload: id });

  // ===== Form fields =====
  const handleChange = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { [field]: value } });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleCategorySelect = (key: CategoryKey) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { category: key } });
    if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
  };

  const handleAgeToggle = (age: TargetAge) => {
    const current = productInfo.targetAge || [];
    const next = current.includes(age) ? current.filter((a) => a !== age) : [...current, age];
    dispatch({ type: 'UPDATE_PRODUCT', payload: { targetAge: next } });
  };

  const handleGenderSelect = (g: TargetGender) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { targetGender: g } });
  };

  const handleToneSelect = (t: ToneKey) => {
    dispatch({ type: 'SET_TONE', payload: t });
  };

  // ===== Competitor analysis =====
  const applyAnalysisResult = (result: any) => {
    setAnalyzeResult(result);
    const updates: Record<string, any> = {};
    if (result.productName) updates.name = result.productName;
    if (result.category) updates.category = result.category;
    if (result.price) updates.price = result.price;
    if (result.targetCustomer) updates.targetAudience = result.targetCustomer;
    if (result.features) updates.shortDescription = result.features;
    if (Object.keys(updates).length > 0) dispatch({ type: 'UPDATE_PRODUCT', payload: updates });

    // USPs from analysis
    if (result.existingUSPs?.length) {
      const usps = result.existingUSPs.map((usp: string | { title: string; description?: string }, i: number) => ({
        id: `usp-analysis-${i}`,
        title: typeof usp === 'string' ? usp : usp.title,
        description: typeof usp === 'string' ? '' : (usp.description || ''),
      }));
      dispatch({ type: 'SET_USPS', payload: usps });
    }

    // Structured price info
    if (result.originalPrice || result.salePrice) {
      dispatch({
        type: 'SET_PRICE_INFO',
        payload: {
          originalPrice: result.originalPrice || 0,
          salePrice: result.salePrice || 0,
          discountRate: result.discountRate || 0,
        },
      });
    }

    // Package items
    if (result.packageItems?.length) {
      dispatch({ type: 'SET_PACKAGE_ITEMS', payload: result.packageItems });
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!analyzeUrl.trim()) return;
    setIsAnalyzing(true); setAnalyzeError(''); setAnalyzeResult(null);
    try {
      const res = await authFetch('/api/analyze-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analyzeUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setAnalyzeError(data.error || '분석에 실패했습니다.'); return; }
      if (data.success && data.data) applyAnalysisResult(data.data);
    } catch { setAnalyzeError('네트워크 오류가 발생했습니다.'); }
    finally { setIsAnalyzing(false); }
  };

  const handleCompImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCompImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setAnalyzeError(''); setAnalyzeResult(null);
  };

  const handleAnalyzeImage = async () => {
    if (!compImageFile) return;
    setIsAnalyzing(true); setAnalyzeError(''); setAnalyzeResult(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(compImageFile);
      });
      const res = await authFetch('/api/analyze-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: compImageFile.type }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setAnalyzeError(data.error || '분석에 실패했습니다.'); return; }
      if (data.success && data.data) applyAnalysisResult(data.data);
    } catch { setAnalyzeError('네트워크 오류가 발생했습니다.'); }
    finally { setIsAnalyzing(false); }
  };

  // ===== Validation =====
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (productPhotos.length === 0) newErrors.photos = '제품 사진을 1장 이상 업로드해주세요.';
    if (!productInfo.name.trim()) newErrors.name = '상품명을 입력해주세요.';
    if (!productInfo.category) newErrors.category = '카테고리를 선택해주세요.';
    if (!productInfo.shortDescription.trim()) newErrors.shortDescription = '핵심 특징을 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) dispatch({ type: 'NEXT_STEP' });
  };

  // Visible categories
  const visibleCategories = showAllCategories
    ? (Object.keys(CATEGORIES) as CategoryKey[])
    : MAIN_CATEGORIES;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Title */}
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#191F28] mb-1">제품 등록</h1>
        <p className="text-sm text-[#8B95A1]">제품 사진과 기본 정보를 입력해주세요.</p>
      </header>

      <div className="space-y-7">

        {/* ===== Product Name ===== */}
        <Input
          label="상품명 *"
          placeholder="예: 리비에르 페이스 리프트 마스크 10매"
          value={productInfo.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
        />

        {searchingCompetitors && (
          <div className="text-xs text-blue-500 flex items-center gap-1 mt-1">
            <span className="animate-pulse">🔍</span> 경쟁사 분석 중...
          </div>
        )}
        {competitorData && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs space-y-1">
            <div className="font-bold text-blue-600">경쟁사 분석 완료</div>
            <div>평균가: {competitorData.avgPrice?.toLocaleString()}원</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {competitorData.commonKeywords?.slice(0, 6).map((kw: string, i: number) => (
                <span key={i} className="px-1.5 py-0.5 bg-white rounded text-gray-600">{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* ===== Mall URL ===== */}
        <Input
          label="쇼핑몰 URL"
          placeholder="https://smartstore.naver.com/..."
          value={productInfo.mallUrl || ''}
          onChange={(e) => handleChange('mallUrl', e.target.value)}
        />

        {/* ===== Product Photos ===== */}
        <div>
          <label className="block text-sm text-[#8B95A1] font-medium mb-2">
            제품 사진 * <span className="text-[#D1D6DB] ml-1">{productPhotos.length}/{MAX_PHOTOS}장</span>
          </label>
          {productPhotos.length < MAX_PHOTOS && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => photoInputRef.current?.click()}
              className={`w-full py-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#3182F6]/60 bg-[#3182F6]/5'
                  : 'border-[#E5E8EB] hover:border-[#3182F6]/40 hover:bg-[#F4F5F7]'
              }`}
            >
              <Upload className="w-6 h-6 text-[#D1D6DB] mx-auto mb-2" />
              <p className="text-sm text-[#8B95A1]">사진을 드래그하거나 클릭하여 업로드</p>
              <p className="text-xs text-[#D1D6DB] mt-1">최대 {MAX_PHOTOS}장 · JPG, PNG, WEBP</p>
            </div>
          )}
          <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotoInputChange} className="hidden" />
          {productPhotos.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-2">
              <AnimatePresence>
                {productPhotos.map((photo, idx) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square group"
                  >
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 z-10 text-[9px] bg-[#3182F6] text-white px-1 py-0.5 rounded font-bold">대표</span>
                    )}
                    <img src={photo.dataUrl} alt={photo.name} className="w-full h-full object-cover rounded-lg border border-[#E5E8EB]" />
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 text-[#8B95A1] hover:text-white hover:bg-[#F04452] transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          {errors.photos && <p className="mt-2 text-sm text-[#F04452]">{errors.photos}</p>}
        </div>

        {/* ===== Key Features ===== */}
        <TextArea
          label="핵심 특징 *"
          placeholder="제품의 핵심 특징과 차별점을 간결하게 설명해주세요..."
          value={productInfo.shortDescription}
          onChange={(e) => handleChange('shortDescription', e.target.value)}
          error={errors.shortDescription}
          rows={3}
        />

        {/* ===== Category Selection ===== */}
        <div>
          <label className="block text-sm text-[#8B95A1] mb-3 font-medium">카테고리 *</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {visibleCategories.map((key) => {
              const cat = CATEGORIES[key];
              const Icon = CATEGORY_ICON_MAP[key];
              const isSelected = productInfo.category === key;
              return (
                <button
                  key={key}
                  onClick={() => handleCategorySelect(key)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#EBF4FF] border-[#3182F6] shadow-sm'
                      : 'bg-white border-[#E5E8EB] hover:border-[#3182F6]/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#3182F6]' : 'text-[#8B95A1]'}`} />
                  <span className={`text-[11px] font-medium ${isSelected ? 'text-[#3182F6]' : 'text-[#4E5968]'}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
          {!showAllCategories && (
            <button
              onClick={() => setShowAllCategories(true)}
              className="mt-2 text-xs text-[#8B95A1] hover:text-[#3182F6] transition-colors flex items-center gap-1"
            >
              <ChevronDown className="w-3 h-3" /> 더보기 ({Object.keys(CATEGORIES).length - MAIN_CATEGORIES.length}개)
            </button>
          )}
          {showAllCategories && (
            <button
              onClick={() => setShowAllCategories(false)}
              className="mt-2 text-xs text-[#8B95A1] hover:text-[#3182F6] transition-colors flex items-center gap-1"
            >
              <ChevronUp className="w-3 h-3" /> 접기
            </button>
          )}
          {errors.category && <p className="mt-2 text-sm text-[#F04452]">{errors.category}</p>}
        </div>

        {/* ===== Target Age / Gender ===== */}
        <div>
          <label className="block text-sm text-[#8B95A1] mb-3 font-medium">타겟 연령/성별</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {TARGET_AGE_OPTIONS.map((opt) => {
              const isSelected = (productInfo.targetAge || []).includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => handleAgeToggle(opt.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[#3182F6] text-white border-[#3182F6]'
                      : 'bg-white text-[#4E5968] border-[#E5E8EB] hover:border-[#3182F6]/50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {TARGET_GENDER_OPTIONS.map((opt) => {
              const isSelected = (productInfo.targetGender || 'all') === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleGenderSelect(opt.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[#3182F6] text-white border-[#3182F6]'
                      : 'bg-white text-[#4E5968] border-[#E5E8EB] hover:border-[#3182F6]/50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== Tone of Voice ===== */}
        <div>
          <label className="block text-sm text-[#8B95A1] mb-3 font-medium">톤 앤 매너</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(TONE_STYLES) as [ToneKey, typeof TONE_STYLES[ToneKey]][]).map(([key, tone]) => {
              const isSelected = state.selectedTone === key;
              return (
                <button
                  key={key}
                  onClick={() => handleToneSelect(key)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[#3182F6] text-white border-[#3182F6]'
                      : 'bg-white text-[#4E5968] border-[#E5E8EB] hover:border-[#3182F6]/50'
                  }`}
                >
                  {tone.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== Competitor Analysis (expandable) ===== */}
        <div className="border border-[#E5E8EB] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F4F5F7] transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-[#4E5968]">기존 상세페이지 분석</span>
              <span className="ml-2 text-xs text-[#D1D6DB]">선택사항</span>
            </div>
            {showAnalysis ? <ChevronUp className="w-4 h-4 text-[#D1D6DB]" /> : <ChevronDown className="w-4 h-4 text-[#D1D6DB]" />}
          </button>

          {showAnalysis && (
            <div className="px-5 pb-5 bg-[#F4F5F7] border-t border-[#E5E8EB]">
              <p className="text-xs text-[#8B95A1] mt-3 mb-4">경쟁사 또는 자사 기존 상세페이지를 분석하여 정보를 자동으로 채웁니다.</p>
              <div className="flex gap-1 mb-4">
                <button
                  onClick={() => { setAnalyzeTab('url'); setAnalyzeError(''); setAnalyzeResult(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${analyzeTab === 'url' ? 'bg-[#3182F6]/10 text-[#3182F6]' : 'text-[#8B95A1] hover:text-[#4E5968]'}`}
                >
                  <Link className="w-3 h-3" /> URL 입력
                </button>
                <button
                  onClick={() => { setAnalyzeTab('image'); setAnalyzeError(''); setAnalyzeResult(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${analyzeTab === 'image' ? 'bg-[#3182F6]/10 text-[#3182F6]' : 'text-[#8B95A1] hover:text-[#4E5968]'}`}
                >
                  <ImageIcon className="w-3 h-3" /> 스크린샷 업로드
                </button>
              </div>

              {analyzeTab === 'url' ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={analyzeUrl}
                    onChange={(e) => setAnalyzeUrl(e.target.value)}
                    placeholder="https://smartstore.naver.com/..."
                    className="flex-1 bg-white border-0 border-b-2 border-[#E5E8EB] py-3 px-2 text-sm text-[#191F28] placeholder:text-[#D1D6DB] focus:outline-none focus:border-[#3182F6] transition-all"
                  />
                  <Button variant="secondary" size="sm" onClick={handleAnalyzeUrl} disabled={!analyzeUrl.trim() || isAnalyzing}>
                    {isAnalyzing ? '분석 중...' : '분석하기'}
                  </Button>
                </div>
              ) : (
                <div>
                  <input ref={compFileInputRef} type="file" accept="image/*" onChange={handleCompImageChange} className="hidden" />
                  {compImagePreview ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <img src={compImagePreview} alt="분석 이미지" className="w-full max-h-32 object-contain rounded-lg border border-[#E5E8EB]" />
                        <button onClick={() => { setCompImageFile(null); setCompImagePreview(''); setAnalyzeResult(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 text-[#8B95A1] hover:text-[#191F28] text-xs flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <Button variant="secondary" size="sm" onClick={handleAnalyzeImage} disabled={isAnalyzing}>
                        {isAnalyzing ? '분석 중...' : 'AI로 분석하기'}
                      </Button>
                    </div>
                  ) : (
                    <button onClick={() => compFileInputRef.current?.click()} className="w-full py-5 border border-dashed border-[#E5E8EB] rounded-lg text-center hover:border-[#3182F6]/40 transition-all bg-white">
                      <Upload className="w-5 h-5 text-[#D1D6DB] mx-auto mb-1.5" />
                      <p className="text-xs text-[#8B95A1]">상세페이지 스크린샷 업로드</p>
                    </button>
                  )}
                </div>
              )}

              {analyzeError && <p className="mt-2 text-sm text-[#F04452]">{analyzeError}</p>}
              {analyzeResult && (
                <div className="mt-3 p-3 rounded-lg bg-[#00C471]/10 border border-[#00C471]/20">
                  <p className="text-sm text-[#00C471] font-medium">분석 완료! 기본 정보가 자동으로 채워졌습니다.</p>
                  {analyzeResult.improvementSuggestions?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-[#4E5968] font-medium mb-1">개선 제안:</p>
                      {analyzeResult.improvementSuggestions.map((s: string, i: number) => (
                        <p key={i} className="text-xs text-[#8B95A1]">• {s}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== Next Button ===== */}
        <div className="pt-4 flex justify-end">
          <Button size="lg" onClick={handleNext}>
            다음: 타겟 분석
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
