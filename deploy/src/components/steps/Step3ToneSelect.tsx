'use client';

import { motion } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import { TONE_STYLES } from '@/lib/constants';
import { ToneKey } from '@/lib/types';
import { generateSections } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ShieldCheck, Heart, Zap } from 'lucide-react';

const toneIcons: Record<ToneKey, React.ReactNode> = {
  trust: <ShieldCheck className="w-8 h-8" />,
  emotional: <Heart className="w-8 h-8" />,
  impact: <Zap className="w-8 h-8" />,
};

const toneExamples: Record<ToneKey, { headline: string; body: string }> = {
  trust: {
    headline: '3,000명의 전문가가 선택한 이유',
    body: '국내 최고 수준의 원료와 까다로운 품질 검사를 거쳤습니다. 식약처 인증, 임상시험 완료, 98.7%의 고객 만족도가 이를 증명합니다.',
  },
  emotional: {
    headline: '오늘도 수고한 당신을 위한 작은 선물',
    body: '하루의 끝, 지친 몸과 마음에 특별한 위로를 선물하세요. 당신만의 시간을 더 가치 있게 만들어줄 거예요.',
  },
  impact: {
    headline: '72시간 한정! 역대급 혜택',
    body: '지금 놓치면 다시 오지 않습니다. 첫 구매 고객 한정 60% 할인 + 무료 배송. 이미 2,847명이 선택했습니다.',
  },
};

export default function Step3ToneSelect() {
  const { state, dispatch } = useDetailPage();
  const { selectedTone, isGenerating, productInfo, extractedUSPs } = state;

  const handleSelectTone = (tone: ToneKey) => {
    dispatch({ type: 'SET_TONE', payload: tone });
  };

  const handleGenerate = async () => {
    if (!selectedTone) return;

    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await generateSections(productInfo, extractedUSPs, selectedTone);
      if (result.success && result.data) {
        dispatch({ type: 'SET_SECTIONS', payload: result.data.sections });
        dispatch({ type: 'NEXT_STEP' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || '생성에 실패했습니다.' });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: '예기치 않은 오류가 발생했습니다.' });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#191F28] mb-2">톤앤매너 설계</h2>
        <p className="text-[#8B95A1]">브랜드 아이덴티티에 맞는 카피 스타일을 선택합니다.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.entries(TONE_STYLES) as [ToneKey, typeof TONE_STYLES[ToneKey]][]).map(
          ([key, tone]) => (
            <Card key={key} variant="interactive" padding="lg" selected={selectedTone === key} onClick={() => handleSelectTone(key)} className="text-center">
              <div className="flex justify-center mb-3 text-[#3182F6]">{toneIcons[key]}</div>
              <h3 className="text-lg font-bold text-[#191F28] mb-2">{tone.label}</h3>
              <p className="text-sm text-[#8B95A1] leading-relaxed">{tone.desc}</p>
            </Card>
          )
        )}
      </div>

      {selectedTone && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="text-xs font-medium text-[#8B95A1] ml-1">카피 미리보기</h3>
          <Card variant="elevated" padding="lg">
            <div className="rounded-xl p-6 bg-[#F4F5F7]">
              <h4 className="text-xl font-bold text-[#191F28] mb-3">{toneExamples[selectedTone].headline}</h4>
              <p className="text-sm text-[#4E5968] leading-relaxed">{toneExamples[selectedTone].body}</p>
            </div>
          </Card>
        </motion.div>
      )}

      {state.error && (
        <div className="p-4 rounded-xl bg-[#F04452]/10 border border-[#F04452]/20 text-[#F04452] text-sm">{state.error}</div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>이전</Button>
        <Button size="lg" onClick={handleGenerate} disabled={!selectedTone || isGenerating} loading={isGenerating}>
          {isGenerating ? '상세페이지 생성 중...' : '상세페이지 생성하기'}
        </Button>
      </div>
    </motion.div>
  );
}
