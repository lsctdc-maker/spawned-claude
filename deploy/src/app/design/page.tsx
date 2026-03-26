'use client';

import { useReducer, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DetailPageContext, detailPageReducer, initialState } from '@/hooks/useDetailPage';
import { DetailPageState } from '@/lib/types';
import Header from '@/components/layout/Header';
import ProgressBar from '@/components/ui/ProgressBar';
import Step4ImageEditor from '@/components/steps/Step4ImageEditor';
import Step5Export from '@/components/steps/Step5Export';
import { DESIGN_STEP_LABELS } from '@/lib/constants';

const PLAN_STATE_KEY = 'dm_plan_state';

function loadDesignInitialState(): DetailPageState {
  if (typeof window === 'undefined') return { ...initialState, currentStep: 4 };
  try {
    const saved = localStorage.getItem(PLAN_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as DetailPageState;
      return { ...parsed, currentStep: 4 };
    }
  } catch {
    // ignore
  }
  return { ...initialState, currentStep: 4 };
}

export default function DesignPage() {
  const [ready, setReady] = useState(false);
  const [designInitState] = useState<DetailPageState>(() => {
    // Runs only on client
    if (typeof window !== 'undefined') return loadDesignInitialState();
    return { ...initialState, currentStep: 4 };
  });

  const [state, dispatch] = useReducer(detailPageReducer, designInitState);

  useEffect(() => {
    setReady(true);
  }, []);

  const renderStep = () => {
    switch (state.currentStep) {
      case 4: return <Step4ImageEditor />;
      case 5: return <Step5Export />;
      default: return <Step4ImageEditor />;
    }
  };

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#131313]">
        <div className="text-[#e5e2e1]/40 text-sm">불러오는 중...</div>
      </div>
    );
  }

  return (
    <DetailPageContext.Provider value={{ state, dispatch }}>
      <div className="h-screen flex flex-col bg-[#131313]">
        <Header />
        <div className="bg-[#131313]/80 backdrop-blur-xl border-b border-[#e5e2e1]/10 flex-shrink-0 z-40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
            <ProgressBar
              currentStep={state.currentStep}
              labels={DESIGN_STEP_LABELS}
            />
          </div>
        </div>
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
