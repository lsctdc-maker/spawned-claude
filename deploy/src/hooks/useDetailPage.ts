'use client';

import { createContext, useContext, Dispatch, ReactNode } from 'react';
import { DetailPageState, DetailPageAction, ProductInfo } from '@/lib/types';

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
  productPhotos: [],
  interviewMessages: [],
  interviewCompleted: false,
  extractedUSPs: [],
  selectedTone: '',
  generatedSections: [],
  manuscriptSections: [],
  colorPalette: null,
  fontRecommendation: null,
  layoutRationale: null,
  referenceGuide: null,
  isGenerating: false,
  error: null,
  images: {},
  imageGenerating: {},
  priceInfo: null,
  packageItems: [],
};

export function detailPageReducer(
  state: DetailPageState,
  action: DetailPageAction
): DetailPageState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 4) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case 'UPDATE_PRODUCT':
      return { ...state, productInfo: { ...state.productInfo, ...action.payload } };
    case 'SET_PRODUCT_PHOTOS':
      return { ...state, productPhotos: action.payload };
    case 'ADD_PRODUCT_PHOTO':
      return { ...state, productPhotos: [...state.productPhotos, action.payload] };
    case 'REMOVE_PRODUCT_PHOTO':
      return { ...state, productPhotos: state.productPhotos.filter((p) => p.id !== action.payload) };
    case 'ADD_INTERVIEW_MESSAGE':
      return { ...state, interviewMessages: [...state.interviewMessages, action.payload] };
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
      return { ...state, extractedUSPs: state.extractedUSPs.filter((usp) => usp.id !== action.payload) };
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
    case 'SET_MANUSCRIPT':
      return { ...state, manuscriptSections: action.payload };
    case 'UPDATE_MANUSCRIPT_SECTION':
      return {
        ...state,
        manuscriptSections: state.manuscriptSections.map((sec) =>
          sec.id === action.payload.id ? { ...sec, ...action.payload.data } : sec
        ),
      };
    case 'REORDER_MANUSCRIPT':
      return { ...state, manuscriptSections: action.payload };
    case 'TOGGLE_MANUSCRIPT_VISIBILITY':
      return {
        ...state,
        manuscriptSections: state.manuscriptSections.map((sec) =>
          sec.id === action.payload ? { ...sec, visible: !sec.visible } : sec
        ),
      };
    case 'ADD_MANUSCRIPT_SECTION':
      return { ...state, manuscriptSections: [...state.manuscriptSections, action.payload] };
    case 'REMOVE_MANUSCRIPT_SECTION':
      return { ...state, manuscriptSections: state.manuscriptSections.filter((sec) => sec.id !== action.payload) };
    case 'SET_COLOR_PALETTE':
      return { ...state, colorPalette: action.payload };
    case 'SET_FONT_RECOMMENDATION':
      return { ...state, fontRecommendation: action.payload };
    case 'SET_LAYOUT_RATIONALE':
      return { ...state, layoutRationale: action.payload };
    case 'SET_REFERENCE_GUIDE':
      return { ...state, referenceGuide: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_IMAGE':
      return { ...state, images: { ...state.images, [action.payload.key]: action.payload.url } };
    case 'SET_IMAGE_GENERATING':
      return { ...state, imageGenerating: { ...state.imageGenerating, [action.payload.key]: action.payload.generating } };
    case 'SET_PRICE_INFO':
      return { ...state, priceInfo: action.payload };
    case 'SET_PACKAGE_ITEMS':
      return { ...state, packageItems: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface DetailPageContextType {
  state: DetailPageState;
  dispatch: Dispatch<DetailPageAction>;
}

export const DetailPageContext = createContext<DetailPageContextType | null>(null);

export function useDetailPage() {
  const context = useContext(DetailPageContext);
  if (!context) {
    throw new Error('useDetailPage must be used within DetailPageProvider');
  }
  return context;
}

export interface DetailPageProviderProps {
  children: ReactNode;
}
