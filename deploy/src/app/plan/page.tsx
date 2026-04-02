'use client';

import { useReducer, useEffect, useCallback, useMemo, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { DetailPageContext, detailPageReducer, initialState } from '@/hooks/useDetailPage';
import Step1ProductInfo from '@/components/steps/Step1ProductInfo';
import Step2AIInterview from '@/components/steps/Step2AIInterview';
import Step3Manuscript from '@/components/steps/Step3Manuscript';
import VerticalStepper from '@/components/steps/VerticalStepper';
import LivePreview from '@/components/steps/LivePreview';
import { PLAN_STEP_LABELS } from '@/lib/constants';
import { saveProject, updateProject, loadProject, ProjectData } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { DetailPageState } from '@/lib/types';
import { ChevronLeft, Save, Check, Loader2 } from 'lucide-react';

const PLAN_STATE_KEY = 'dm_plan_state';
const AUTOSAVE_DELAY = 5000;

type SaveStatus = 'idle' | 'saving' | 'saved' | 'unsaved' | 'error';

function stateToProjectData(state: DetailPageState): Omit<ProjectData, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: state.productInfo.name || '새 프로젝트',
    status: state.currentStep >= 3 ? 'designing' : 'planning',
    product_info: state.productInfo,
    interview_data: {
      messages: state.interviewMessages,
      extractedUSPs: state.extractedUSPs,
      completed: state.interviewCompleted,
    },
    manuscript_sections: state.manuscriptSections.length > 0 ? state.manuscriptSections : null,
    color_palette: state.colorPalette,
    font_recommendation: state.fontRecommendation,
    keywords: state.productInfo.keywords || null,
    tone: state.selectedTone || null,
    current_step: state.currentStep,
  };
}

function projectDataToState(project: ProjectData): Partial<DetailPageState> {
  return {
    currentStep: project.current_step || 1,
    productInfo: project.product_info || initialState.productInfo,
    interviewMessages: project.interview_data?.messages || [],
    extractedUSPs: project.interview_data?.extractedUSPs || [],
    interviewCompleted: project.interview_data?.completed || false,
    manuscriptSections: project.manuscript_sections || [],
    colorPalette: project.color_palette || null,
    fontRecommendation: project.font_recommendation || null,
    selectedTone: (project.tone as any) || '',
  };
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-white"><span className="text-sm text-[#8B95A1]">로딩 중...</span></div>}>
      <PlanPageInner />
    </Suspense>
  );
}

function PlanPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(detailPageReducer, initialState);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  // Check auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  // Load project from URL param or localStorage
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      loadProject(id).then(({ data, error }) => {
        if (data && !error) {
          setProjectId(id);
          const restored = projectDataToState(data);
          // Apply restored fields one by one
          if (restored.productInfo) dispatch({ type: 'UPDATE_PRODUCT', payload: restored.productInfo });
          if (restored.currentStep) dispatch({ type: 'SET_STEP', payload: restored.currentStep });
          if (restored.interviewMessages) {
            for (const msg of restored.interviewMessages) {
              dispatch({ type: 'ADD_INTERVIEW_MESSAGE', payload: msg });
            }
          }
          if (restored.interviewCompleted) dispatch({ type: 'SET_INTERVIEW_COMPLETED', payload: true });
          if (restored.extractedUSPs && restored.extractedUSPs.length > 0) {
            dispatch({ type: 'SET_USPS', payload: restored.extractedUSPs });
          }
          if (restored.manuscriptSections && restored.manuscriptSections.length > 0) {
            dispatch({ type: 'SET_MANUSCRIPT', payload: restored.manuscriptSections });
          }
          if (restored.colorPalette) dispatch({ type: 'SET_COLOR_PALETTE', payload: restored.colorPalette });
          if (restored.fontRecommendation) dispatch({ type: 'SET_FONT_RECOMMENDATION', payload: restored.fontRecommendation });
          if (restored.selectedTone) dispatch({ type: 'SET_TONE', payload: restored.selectedTone as any });
          setSaveStatus('saved');
          lastSavedRef.current = JSON.stringify(stateToProjectData({ ...initialState, ...restored }));
        }
        setLoaded(true);
      });
    } else {
      // Try localStorage recovery
      try {
        const saved = localStorage.getItem(PLAN_STATE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as DetailPageState;
          if (parsed.productInfo) dispatch({ type: 'UPDATE_PRODUCT', payload: parsed.productInfo });
          if (parsed.currentStep > 1) dispatch({ type: 'SET_STEP', payload: parsed.currentStep });
          if (parsed.interviewCompleted) dispatch({ type: 'SET_INTERVIEW_COMPLETED', payload: true });
          if (parsed.extractedUSPs?.length > 0) dispatch({ type: 'SET_USPS', payload: parsed.extractedUSPs });
          if (parsed.manuscriptSections?.length > 0) dispatch({ type: 'SET_MANUSCRIPT', payload: parsed.manuscriptSections });
          if (parsed.selectedTone) dispatch({ type: 'SET_TONE', payload: parsed.selectedTone as any });
        }
      } catch { /* ignore */ }
      setLoaded(true);
    }
  }, [searchParams]);

  // Visual step mapping
  const visualStep = useMemo(() => {
    if (state.currentStep === 1) return 1;
    if (state.currentStep === 2) return state.interviewCompleted ? 3 : 2;
    if (state.currentStep === 3) return 4;
    return 1;
  }, [state.currentStep, state.interviewCompleted]);

  // Navigate to /design when plan complete
  useEffect(() => {
    if (state.currentStep === 4) {
      localStorage.setItem(PLAN_STATE_KEY, JSON.stringify(state));
      // Save to DB before navigating
      if (projectId && isLoggedIn) {
        updateProject(projectId, stateToProjectData(state));
      }
      router.push('/design');
    }
  }, [state.currentStep, router, projectId, isLoggedIn]);

  // localStorage backup on every change
  useEffect(() => {
    if (loaded && state.currentStep >= 1 && state.currentStep <= 3) {
      try { localStorage.setItem(PLAN_STATE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
    }
  }, [state, loaded]);

  // Autosave to DB (debounced)
  useEffect(() => {
    if (!loaded || !isLoggedIn) return;

    const currentData = JSON.stringify(stateToProjectData(state));
    if (currentData === lastSavedRef.current) return;

    setSaveStatus('unsaved');

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      await handleSave();
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [state, loaded, isLoggedIn]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!isLoggedIn) return;

    setSaveStatus('saving');
    const data = stateToProjectData(state);

    try {
      if (projectId) {
        const { error } = await updateProject(projectId, data);
        if (error) { setSaveStatus('error'); return; }
      } else {
        const { data: newProject, error } = await saveProject(data);
        if (error || !newProject) { setSaveStatus('error'); return; }
        setProjectId(newProject.id!);
        // Update URL without full navigation
        window.history.replaceState(null, '', `/plan?id=${newProject.id}`);
      }
      lastSavedRef.current = JSON.stringify(data);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [state, projectId, isLoggedIn]);

  // Go to main with save check
  const handleGoMain = useCallback(async () => {
    if (saveStatus === 'unsaved' && isLoggedIn) {
      const choice = window.confirm('저장하고 나가시겠습니까?\n\n확인: 저장 후 나가기\n취소: 저장하지 않고 나가기');
      if (choice) {
        await handleSave();
      }
    }
    window.location.href = '/';
  }, [saveStatus, isLoggedIn, handleSave]);

  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return <Step1ProductInfo />;
      case 2: return <Step2AIInterview />;
      case 3: return <Step3Manuscript />;
      default: return <Step1ProductInfo />;
    }
  };

  const saveStatusLabel = useMemo(() => {
    if (!isLoggedIn) return null;
    switch (saveStatus) {
      case 'saving': return { text: '저장 중...', icon: Loader2, className: 'text-[#8B95A1] animate-spin' };
      case 'saved': return { text: '저장됨', icon: Check, className: 'text-[#00C471]' };
      case 'unsaved': return { text: '변경사항 있음', icon: Save, className: 'text-[#FF9F00]' };
      case 'error': return { text: '저장 실패', icon: Save, className: 'text-[#F04452]' };
      default: return null;
    }
  }, [saveStatus, isLoggedIn]);

  return (
    <DetailPageContext.Provider value={{ state, dispatch }}>
      <div className="flex flex-col bg-[#F8F9FA] fixed inset-0 z-50">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#E5E8EB] flex-shrink-0">
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

          {/* Save area */}
          <div className="flex items-center gap-3">
            {saveStatusLabel && (
              <div className="flex items-center gap-1.5">
                <saveStatusLabel.icon className={`w-3.5 h-3.5 ${saveStatusLabel.className}`} />
                <span className={`text-xs ${saveStatusLabel.className.replace('animate-spin', '')}`}>
                  {saveStatusLabel.text}
                </span>
              </div>
            )}
            {isLoggedIn && (
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3182F6] text-white text-xs font-medium hover:bg-[#2B71DD] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                저장
              </button>
            )}
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
