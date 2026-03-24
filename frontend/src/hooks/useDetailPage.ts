'use client';

import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import {
  DetailPageState,
  DetailPageAction,
  ProductInfo,
} from '@/lib/types';

// ===== 초기 상태 =====
const initialProductInfo: ProductInfo = {
  name: '',
  category: '',
  price: '',
  targetAudience: '',
  shortDescription: '',
  keywords: [],
  imageUrl: '',
};

export const initialState: DetailPageState = {
  currentStep: 1,
  productInfo: initialProductInfo,
  interviewMessages: [],
  interviewCompleted: false,
  extractedUSPs: [],
  selectedTone: '',
  generatedSections: [],
  isGenerating: false,
  error: null,
};

// ===== 리듀서 =====
export function detailPageReducer(
  state: DetailPageState,
  action: DetailPageAction
): DetailPageState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 5) };

    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        productInfo: { ...state.productInfo, ...action.payload },
      };

    case 'ADD_INTERVIEW_MESSAGE':
      return {
        ...state,
        interviewMessages: [...state.interviewMessages, action.payload],
      };

    case 'SET_INTERVIEW_COMPLETED':
      return { ...state, interviewCompleted: action.payload };

    case 'SET_USPS':
      return { ...state, extractedUSPs: action.payload };

    case 'ADD_USP':
      return { ...state, extractedUSPs: [...state.extractedUSPs, action.payload] };

    case 'UPDATE_USP':
      return {
        ...state,
        extractedUSPs: state.extractedUSPs.map((usp) =>
          usp.id === action.payload.id ? { ...usp, ...action.payload.data } : usp
        ),
      };

    case 'REMOVE_USP':
      return {
        ...state,
        extractedUSPs: state.extractedUSPs.filter((usp) => usp.id !== action.payload),
      };

    case 'SET_TONE':
      return { ...state, selectedTone: action.payload };

    case 'SET_SECTIONS':
      return { ...state, generatedSections: action.payload };

    case 'UPDATE_SECTION':
      return {
        ...state,
        generatedSections: state.generatedSections.map((sec) =>
          sec.id === action.payload.id ? { ...sec, ...action.payload.data } : sec
        ),
      };

    case 'REORDER_SECTIONS':
      return { ...state, generatedSections: action.payload };

    case 'TOGGLE_SECTION_VISIBILITY':
      return {
        ...state,
        generatedSections: state.generatedSections.map((sec) =>
          sec.id === action.payload ? { ...sec, visible: !sec.visible } : sec
        ),
      };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ===== Context =====
interface DetailPageContextType {
  state: DetailPageState;
  dispatch: Dispatch<DetailPageAction>;
}

export const DetailPageContext = createContext<DetailPageContextType | null>(null);

// ===== Hook =====
export function useDetailPage() {
  const context = useContext(DetailPageContext);
  if (!context) {
    throw new Error('useDetailPage must be used within DetailPageProvider');
  }
  return context;
}

// ===== Provider props 타입 =====
export interface DetailPageProviderProps {
  children: ReactNode;
}
