'use client';

import { useReducer } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DetailPageContext, detailPageReducer, initialState } from '@/hooks/useDetailPage';
import Header from '@/components/layout/Header';
import ProgressBar from '@/components/ui/ProgressBar';
import Step1ProductInfo from '@/components/steps/Step1ProductInfo';
import Step2AIInterview from '@/components/steps/Step2AIInterview';
import Step3Manuscript from '@/components/steps/Step3Manuscript';
import Step4ImageEditor from '@/components/steps/Step4ImageEditor';
import Step5Export from '@/components/steps/Step5Export';

export default function CreatePage() {
  const [state, dispatch] = useReducer(detailPageReducer, initialState);

  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return <Step1ProductInfo />;
      case 2: return <Step2AIInterview />;
      case 3: return <Step3Manuscript />;
      case 4: return <Step4ImageEditor />;
      case 5: return <Step5Export />;
      default: return <Step1ProductInfo />;
    }
  };

  return (
    <DetailPageContext.Provider value={{ state, dispatch }}>
      {/* h-screen flex-col: 페이지 전체 스크롤 없애고 내부 스크롤로 처리 */}
      <div className="h-screen flex flex-col bg-[#131313]">
        <Header />

        {/* 스텝 진행바 — flex 아이템으로 항상 표시 (sticky 불필요) */}
        <div className="bg-[#131313]/80 backdrop-blur-xl border-b border-[#e5e2e1]/10 flex-shrink-0 z-40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
            <ProgressBar currentStep={state.currentStep} totalSteps={5} />
          </div>
        </div>

        {/* 콘텐츠 영역 — 이 안에서만 스크롤 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <AnimatePresence mode="wait">
              <div key={state.currentStep}>
                {renderStep()}
              </div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </DetailPageContext.Provider>
  );
}
