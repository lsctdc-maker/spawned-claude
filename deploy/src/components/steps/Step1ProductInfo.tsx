'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import { CategoryKey, ProductPhoto } from '@/lib/types';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';
import { authFetch } from '@/lib/auth-fetch';
import { Upload, X, Link, ImageIcon, ChevronDown, ChevronUp, Camera, Type, Tag, Target, ScanSearch } from 'lucide-react';

const MAX_PHOTOS = 10;

// ===== 가이드 패널 =====
type GuideKey = 'photos' | 'name' | 'category' | 'description' | 'competitor';

interface GuideTip {
  text: string;
  good?: boolean;
}

interface GuideItem {
  key: GuideKey;
  icon: React.ElementType;
  label: string;
  tips: GuideTip[];
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    key: 'photos',
    icon: Camera,
    label: '좋은 결과를 위한 사진 팁',
    tips: [
      { text: '정면, 측면, 사용 모습 등 다양한 각도 포함' },
      { text: '밝고 깨끗한 단색 배경 권장' },
      { text: '최소 3장 이상 권장' },
      { text: '단색 배경에 제품이 선명한 사진', good: true },
      { text: '어둡거나 배경이 복잡한 사진', good: false },
    ],
  },
  {
    key: 'name',
    icon: Type,
    label: '제품명 가이드',
    tips: [
      { text: '브랜드명 + 제품 종류 + 핵심 키워드 조합' },
      { text: '리비에르 페이스 리프트 마스크 10매', good: true },
    ],
  },
  {
    key: 'category',
    icon: Tag,
    label: '카테고리 가이드',
    tips: [
      { text: '카테고리에 따라 AI 질문과 레이아웃이 달라집니다' },
      { text: '가장 가까운 카테고리를 선택하세요' },
    ],
  },
  {
    key: 'description',
    icon: Target,
    label: '특장점 가이드',
    tips: [
      { text: '경쟁사 대비 차별점 중심으로 3~5개' },
      { text: '구체적인 수치가 있으면 더 좋음' },
      { text: '"24시간 보습 지속"', good: true },
      { text: '"보습력 좋음"', good: false },
    ],
  },
  {
    key: 'competitor',
    icon: ScanSearch,
    label: '경쟁사 분석 가이드',
    tips: [
      { text: '잘 되는 경쟁사 상세페이지를 스크롤 캡처해서 올려주세요' },
      { text: 'AI가 레이아웃, 카피 스타일, 디자인 톤을 분석합니다' },
      { text: 'URL 또는 스크린샷 이미지 모두 지원' },
    ],
  },
];

function GuidePanel({ activeGuide }: { activeGuide: GuideKey | null }) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium text-[#8B95A1] px-1 mb-3">입력 가이드</p>
      {GUIDE_ITEMS.map((guide) => {
        const isActive = activeGuide === guide.key;
        const Icon = guide.icon;
        return (
          <div
            key={guide.key}
            className={`rounded-xl border p-4 transition-all duration-300 ${
              isActive
                ? 'border-[#3182F6]/30 bg-[#3182F6]/5'
                : 'border-[#E5E8EB] bg-white'
            }`}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Icon
                className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#3182F6]' : 'text-[#D1D6DB]'
                }`}
              />
              <span
                className={`text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-[#3182F6]' : 'text-[#8B95A1]'
                }`}
              >
                {guide.label}
              </span>
            </div>
            <ul className="space-y-1.5">
              {guide.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={`text-[10px] mt-[3px] flex-shrink-0 font-bold ${
                      tip.good === true
                        ? 'text-[#00C471]'
                        : tip.good === false
                        ? 'text-[#F04452]'
                        : 'text-[#D1D6DB]'
                    }`}
                  >
                    {tip.good === true ? 'O' : tip.good === false ? 'X' : '—'}
                  </span>
                  <span
                    className={`text-[11px] leading-relaxed ${
                      tip.good === true
                        ? 'text-[#00C471]'
                        : tip.good === false
                        ? 'text-[#F04452]/80'
                        : 'text-[#8B95A1]'
                    }`}
                  >
                    {tip.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ===== 메인 컴포넌트 =====
export default function Step1ProductInfo() {
  const { state, dispatch } = useDetailPage();
  const { productInfo, productPhotos } = state;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [activeGuide, setActiveGuide] = useState<GuideKey | null>(null);

  // 경쟁사 분석 섹션
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

  // ===== 제품 사진 =====
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processImageFiles(e.dataTransfer.files);
  };

  const handleRemovePhoto = (id: string) => {
    dispatch({ type: 'REMOVE_PRODUCT_PHOTO', payload: id });
  };

  // ===== 기본 정보 =====
  const handleChange = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { [field]: value } });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleCategorySelect = (key: CategoryKey) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { category: key } });
    if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
    setActiveGuide('category');
  };

  // ===== 경쟁사 분석 =====
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

  const handleAnalyzeUrl = async () => {
    if (!analyzeUrl.trim()) return;
    setIsAnalyzing(true);
    setAnalyzeError('');
    setAnalyzeResult(null);
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
    setAnalyzeError('');
    setAnalyzeResult(null);
  };

  const handleAnalyzeImage = async () => {
    if (!compImageFile) return;
    setIsAnalyzing(true);
    setAnalyzeError('');
    setAnalyzeResult(null);
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

  // ===== 유효성 검사 & 다음 단계 =====
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (productPhotos.length === 0) newErrors.photos = '제품 사진을 1장 이상 업로드해주세요.';
    if (!productInfo.name.trim()) newErrors.name = '상품명을 입력해주세요.';
    if (!productInfo.category) newErrors.category = '카테고리를 선택해주세요.';
    if (!productInfo.shortDescription.trim()) newErrors.shortDescription = '간단한 설명을 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-[1080px] mx-auto"
    >
      <div className="md:grid md:grid-cols-[1fr_300px] md:gap-8 md:items-start">

        {/* ===== 왼쪽: 입력 폼 ===== */}
        <div className="bg-white rounded-xl border border-[#E5E8EB] shadow-card p-8 md:p-12 relative overflow-hidden">

          <header className="mb-10 relative">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#191F28] mb-2">제품 등록</h1>
            <p className="text-[#8B95A1]">제품 사진과 기본 정보를 입력해주세요.</p>
          </header>

          <div className="space-y-8 relative">

            {/* ===== 제품 사진 ===== */}
            <div onFocus={() => setActiveGuide('photos')} onClick={() => setActiveGuide('photos')}>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm text-[#8B95A1] font-medium">
                  제품 사진 * <span className="text-[#D1D6DB] ml-1">{productPhotos.length}/{MAX_PHOTOS}장</span>
                </label>
              </div>

              {productPhotos.length < MAX_PHOTOS && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => photoInputRef.current?.click()}
                  className={`w-full py-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? 'border-[#3182F6]/60 bg-[#3182F6]/5'
                      : 'border-[#E5E8EB] hover:border-[#3182F6]/40 hover:bg-[#F4F5F7]'
                  }`}
                >
                  <Upload className="w-7 h-7 text-[#D1D6DB] mx-auto mb-3 transition-colors" />
                  <p className="text-sm text-[#8B95A1]">사진을 드래그하거나 클릭하여 업로드</p>
                  <p className="text-xs text-[#D1D6DB] mt-1">최대 {MAX_PHOTOS}장 · JPG, PNG, WEBP</p>
                </div>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoInputChange}
                className="hidden"
              />

              {productPhotos.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-3">
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
                          <span className="absolute top-1 left-1 z-10 text-[9px] bg-[#3182F6] text-white px-1 py-0.5 rounded font-bold leading-tight">대표</span>
                        )}
                        <img
                          src={photo.dataUrl}
                          alt={photo.name}
                          className="w-full h-full object-cover rounded-lg border border-[#E5E8EB]"
                        />
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

              {/* 모바일 힌트 */}
              <p className="md:hidden mt-2 text-[11px] text-[#D1D6DB]">다양한 각도로 최소 3장 이상, 밝고 깨끗한 배경 권장</p>
            </div>

            {/* ===== 상품명 ===== */}
            <div onFocus={() => setActiveGuide('name')}>
              <Input
                label="상품명 *"
                placeholder="예: 리비에르 페이스 리프트 마스크 10매"
                value={productInfo.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
              />
              <p className="md:hidden mt-1.5 text-[11px] text-[#D1D6DB]">브랜드명 + 제품 종류 + 핵심 키워드</p>
            </div>

            {/* ===== 카테고리 ===== */}
            <div>
              <label className="block text-sm text-[#8B95A1] mb-4 ml-1 font-medium">카테고리 *</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {(Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][]).map(([key, cat]) => {
                  const isSelected = productInfo.category === key;
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleCategorySelect(key)}
                      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#EBF4FF] border-2 border-[#3182F6]'
                          : 'bg-[#F4F5F7] border border-[#E5E8EB] hover:border-[#3182F6]/50 hover:bg-white'
                      }`}
                    >
                      <span className={`text-[11px] font-medium leading-tight text-center ${isSelected ? 'text-[#3182F6]' : 'text-[#4E5968]'}`}>{cat.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              {errors.category && <p className="mt-2 text-sm text-[#F04452]">{errors.category}</p>}
              <p className="md:hidden mt-2 text-[11px] text-[#D1D6DB]">카테고리에 따라 AI 질문과 레이아웃이 달라집니다</p>
            </div>

            {/* ===== 타겟 고객 ===== */}
            <div onFocus={() => setActiveGuide('description')}>
              <Input
                label="타겟 고객"
                placeholder="예: 라이프스타일에 가치를 두는 30~40대 전문직"
                value={productInfo.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
              />
            </div>

            {/* ===== 간단 설명 ===== */}
            <div onFocus={() => setActiveGuide('description')}>
              <TextArea
                label="상품 간단 설명 *"
                placeholder="제품의 핵심 특징과 차별점을 간결하게 설명해주세요..."
                value={productInfo.shortDescription}
                onChange={(e) => handleChange('shortDescription', e.target.value)}
                error={errors.shortDescription}
                rows={3}
              />
              <p className="md:hidden mt-1.5 text-[11px] text-[#D1D6DB]">경쟁사 대비 차별점 중심으로 3~5개, 구체적인 수치 포함 권장</p>
            </div>

            {/* ===== 경쟁사/자사 분석 (선택) ===== */}
            <div className="border border-[#E5E8EB] rounded-xl overflow-hidden">
              <button
                onClick={() => {
                  const next = !showAnalysis;
                  setShowAnalysis(next);
                  if (next) setActiveGuide('competitor');
                }}
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
                        <button onClick={() => compFileInputRef.current?.click()} className="w-full py-5 border border-dashed border-[#E5E8EB] rounded-lg text-center hover:border-[#3182F6]/40 transition-all group bg-white">
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

            {/* ===== 다음 버튼 ===== */}
            <div className="pt-4">
              <Button size="lg" fullWidth onClick={handleNext}>
                다음: AI 인터뷰
              </Button>
            </div>
          </div>
        </div>

        {/* ===== 오른쪽: 가이드 패널 (데스크탑 전용) ===== */}
        <aside className="hidden md:block sticky top-6">
          <GuidePanel activeGuide={activeGuide} />
        </aside>

      </div>
    </motion.div>
  );
}
