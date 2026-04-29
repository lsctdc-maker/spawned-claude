'use client';

import { useReducer, useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DetailPageContext, detailPageReducer, initialState } from '@/hooks/useDetailPage';
import { DetailPageState } from '@/lib/types';
import Header from '@/components/layout/Header';
import ProgressBar from '@/components/ui/ProgressBar';
import dynamic from 'next/dynamic';
const DetailEditor = dynamic(() => import('@/components/detail-editor/DetailEditor'), { ssr: false });
import Step5Export from '@/components/steps/Step5Export';
import { DESIGN_STEP_LABELS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/auth/LoginModal';

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
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) setShowLogin(true);
    });
  }, []);

  const handleLoginClose = useCallback(() => {
    setShowLogin(false);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) window.location.href = '/';
    });
  }, []);

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
      case 4: return <DetailEditor />;
      case 5: return <Step5Export />;
      default: return <DetailEditor />;
    }
  };

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-[#8B95A1] text-sm">불러오는 중...</div>
      </div>
    );
  }

  // Step 4 (Canvas Editor) uses its own full-screen layout
  if (state.currentStep === 4) {
    return (
      <DetailPageContext.Provider value={{ state, dispatch }}>
        {renderStep()}
        <LoginModal open={showLogin} onClose={handleLoginClose} />
      </DetailPageContext.Provider>
    );
  }

  return (
    <DetailPageContext.Provider value={{ state, dispatch }}>
      <div className="h-screen flex flex-col bg-white">
        <Header />
        <div className="bg-white/95 backdrop-blur-xl border-b border-[#E5E8EB] flex-shrink-0 z-40">
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
      <LoginModal open={showLogin} onClose={handleLoginClose} />
    </DetailPageContext.Provider>
  );
}
