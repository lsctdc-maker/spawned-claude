'use client';

import { motion } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import { TONE_STYLES } from '@/lib/constants';
import { ToneKey } from '@/lib/types';
import { generateSections } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">톤앤매너 선택</h2>
        <p className="text-gray-500">상세페이지의 전체 분위기를 결정합니다.</p>
      </div>

      {/* 톤 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.entries(TONE_STYLES) as [ToneKey, typeof TONE_STYLES[ToneKey]][]).map(
          ([key, tone]) => (
            <Card
              key={key}
              variant="interactive"
              padding="lg"
              selected={selectedTone === key}
              onClick={() => handleSelectTone(key)}
              className="text-center"
            >
              <div className="text-4xl mb-3">{tone.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{tone.label}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{tone.desc}</p>
            </Card>
          )
        )}
      </div>

      {/* 미리보기 */}
      {selectedTone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            카피 미리보기
          </h3>
          <Card variant="elevated" padding="lg">
            <div
              className="rounded-xl p-6"
              style={{
                background:
                  selectedTone === 'trust'
                    ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)'
                    : selectedTone === 'emotional'
                    ? 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)'
                    : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              }}
            >
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {toneExamples[selectedTone].headline}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {toneExamples[selectedTone].body}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* 에러 */}
      {state.error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* 버튼 */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
          이전
        </Button>
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={!selectedTone || isGenerating}
          loading={isGenerating}
        >
          {isGenerating ? '상세페이지 생성 중...' : '상세페이지 생성하기'}
        </Button>
      </div>
    </motion.div>
  );
}
