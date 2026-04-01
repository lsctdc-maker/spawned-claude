'use client';

import { useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { DetailPageContext, detailPageReducer, initialState } from '@/hooks/useDetailPage';
import ProgressBar from '@/components/ui/ProgressBar';
import Step1ProductInfo from '@/components/steps/Step1ProductInfo';
import Step2AIInterview from '@/components/steps/Step2AIInterview';
import Step3Manuscript from '@/components/steps/Step3Manuscript';
import { PLAN_STEP_LABELS } from '@/lib/constants';

const PLAN_STATE_KEY = 'dm_plan_state';

export default function PlanPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(detailPageReducer, initialState);

  // When step reaches 4 (user clicked "다음" in Step3), save state and navigate to design
  useEffect(() => {
    if (state.currentStep === 4) {
      try {
        localStorage.setItem(PLAN_STATE_KEY, JSON.stringify(state));
      } catch {
        // ignore storage errors
      }
      router.push('/design');
    }
  }, [state.currentStep, router]);

  // Save state to localStorage on every change (for recovery)
  useEffect(() => {
    if (state.currentStep >= 1 && state.currentStep <= 3) {
      try {
        localStorage.setItem(PLAN_STATE_KEY, JSON.stringify(state));
      } catch {
        // ignore
      }
    }
  }, [state]);

  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return <Step1ProductInfo />;
      case 2: return <Step2AIInterview />;
      case 3: return <Step3Manuscript />;
      default: return <Step1ProductInfo />;
    }
  };

  return (
    <DetailPageContext.Provider value={{ state, dispatch }}>
      <div className="h-screen flex flex-col bg-white">
        {/* Minimal header with just logo */}
        <div className="flex-shrink-0 border-b border-[#E5E8EB] py-4">
          <div className="text-center">
            <span className="text-lg font-bold text-[#191F28]">DetailMaker</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="flex-shrink-0 z-40">
          <div className="max-w-3xl mx-auto px-6 pt-4">
            <ProgressBar
              currentStep={state.currentStep}
              labels={PLAN_STEP_LABELS}
            />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
