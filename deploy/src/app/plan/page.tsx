'use client';

import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { DetailPageContext, detailPageReducer, initialState } from '@/hooks/useDetailPage';
import Step1ProductInfo from '@/components/steps/Step1ProductInfo';
import Step2AIInterview from '@/components/steps/Step2AIInterview';
import Step3Manuscript from '@/components/steps/Step3Manuscript';
import VerticalStepper from '@/components/steps/VerticalStepper';
import LivePreview from '@/components/steps/LivePreview';
import { PLAN_STEP_LABELS } from '@/lib/constants';
import { ChevronLeft } from 'lucide-react';

const PLAN_STATE_KEY = 'dm_plan_state';

export default function PlanPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(detailPageReducer, initialState);

  const handleGoMain = useCallback(() => {
    if (window.confirm('메인으로 돌아가시겠습니까? 저장하지 않은 변경사항이 사라질 수 있습니다.')) {
      window.location.href = '/';
    }
  }, []);

  // Visual step mapping: 3 functional steps → 4 visual steps
  // Step 1 → Visual 1 (제품 등록)
  // Step 2 (interview) → Visual 2 (타겟 분석)
  // Step 2 (USP done) → Visual 3 (USP 추출)
  // Step 3 → Visual 4 (원고 생성)
  const visualStep = useMemo(() => {
    if (state.currentStep === 1) return 1;
    if (state.currentStep === 2) {
      return state.interviewCompleted ? 3 : 2;
    }
    if (state.currentStep === 3) return 4;
    return 1;
  }, [state.currentStep, state.interviewCompleted]);

  // When step reaches 4 (plan complete), save state and navigate to design
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
      <div className="flex flex-col bg-[#F8F9FA] fixed inset-0 z-50">
        {/* Top Bar */}
        <div className="flex items-center px-6 py-3 bg-white border-b border-[#E5E8EB] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoMain}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F4F5F7] transition-all text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              메인으로
            </button>
            <div className="w-px h-5 bg-[#E5E8EB]" />
            <h1 className="text-sm font-bold text-[#191F28]">AI 기획</h1>
          </div>
        </div>

        {/* 3-column layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Vertical Stepper */}
          <aside className="hidden lg:flex w-[220px] flex-shrink-0 bg-white border-r border-[#E5E8EB] p-6 pt-8">
            <VerticalStepper steps={PLAN_STEP_LABELS} currentStep={visualStep} />
          </aside>

          {/* Center: Step Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8">
              <AnimatePresence mode="wait">
                <div key={state.currentStep}>
                  {renderStep()}
                </div>
              </AnimatePresence>
            </div>
          </main>

          {/* Right: Live Preview */}
          <aside className="hidden xl:block w-[280px] flex-shrink-0 bg-white border-l border-[#E5E8EB] p-5 overflow-y-auto">
            <LivePreview />
          </aside>
        </div>
      </div>
    </DetailPageContext.Provider>
  );
}
