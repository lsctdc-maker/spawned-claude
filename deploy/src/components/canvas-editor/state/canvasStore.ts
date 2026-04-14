'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { ManuscriptSectionType } from '@/lib/types';

// Safe localStorage wrapper: silently swallows quota/access errors so UI never crashes
const safeStorage: StateStorage = {
  getItem: (name) => {
    try { return typeof window !== 'undefined' ? window.localStorage.getItem(name) : null; }
    catch { return null; }
  },
  setItem: (name, value) => {
    try { if (typeof window !== 'undefined') window.localStorage.setItem(name, value); }
    catch (e) { console.warn('localStorage write skipped:', (e as Error).message); }
  },
  removeItem: (name) => {
    try { if (typeof window !== 'undefined') window.localStorage.removeItem(name); }
    catch {}
  },
};

// ===== Types =====

export interface CanvasSectionState {
  canvasJSON: string;
  canvasHeight: number;
  imageUrl: string | null;
  isPlaceholder: boolean;
  thumbnail: string | null;
  dirty: boolean;
  figmaTemplateId: string | null;
}

interface HistoryEntry {
  json: string;
  timestamp: number;
}

export type PipelineStatus =
  | 'idle'          // 초기 상태 (파이프라인 안 돌아감)
  | 'loading'       // DB에서 기존 디자인 로드 중
  | 'generating'    // Gemini 이미지 생성 중
  | 'composing'     // 섹션 합성 중
  | 'saving'        // DB 저장 중
  | 'ready'         // 편집 가능
  | 'error';        // 실패

export interface PipelineProgress {
  imaged: number;    // Gemini 완료 수
  composed: number;  // compose 완료 수
  total: number;     // 전체 섹션 수
  errorMessage?: string;
}

interface CanvasEditorStore {
  // ===== Pipeline state (Phase 5-6 추가) =====
  status: PipelineStatus;
  progress: PipelineProgress;
  setStatus: (status: PipelineStatus, errorMessage?: string) => void;
  setProgress: (progress: Partial<PipelineProgress>) => void;
  bulkLoad: (designs: Array<{
    sectionId: string;
    canvasJSON: string;
    canvasHeight: number;
    imageUrl?: string | null;
    thumbnail?: string | null;
  }>) => void;

  // Per-section canvas data
  sections: Record<string, CanvasSectionState>;

  // Active section
  activeSectionId: string;
  setActiveSectionId: (id: string) => void;

  // Image generation state
  generating: Record<string, boolean>;
  generateError: Record<string, boolean>;
  setGenerating: (sectionId: string, val: boolean) => void;
  setGenerateError: (sectionId: string, val: boolean) => void;
  isAnyGenerating: () => boolean;

  // History per section
  history: Record<string, { past: HistoryEntry[]; future: HistoryEntry[] }>;
  pushHistory: (sectionId: string, json: string) => void;
  undo: (sectionId: string) => HistoryEntry | null;
  redo: (sectionId: string) => HistoryEntry | null;
  canUndo: (sectionId: string) => boolean;
  canRedo: (sectionId: string) => boolean;

  // Canvas state CRUD
  saveCanvasState: (sectionId: string, json: string, height: number) => void;
  getCanvasState: (sectionId: string) => CanvasSectionState | null;
  setImage: (sectionId: string, url: string, isPlaceholder?: boolean) => void;
  hasImage: (sectionId: string) => boolean;
  setThumbnail: (sectionId: string, dataUrl: string) => void;

  // Figma template
  setFigmaTemplate: (sectionId: string, templateId: string | null) => void;
  getFigmaTemplateId: (sectionId: string) => string | null;

  // Selection
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;

  // Settings
  resolution: 1 | 2;
  setResolution: (r: 1 | 2) => void;
  snapEnabled: boolean;
  toggleSnap: () => void;

  // Reset
  reset: () => void;
}

// ===== Store =====

const MAX_HISTORY = 50;

export const useCanvasEditorStore = create<CanvasEditorStore>()(
  persist(
    (set, get) => ({
      status: 'idle' as PipelineStatus,
      progress: { imaged: 0, composed: 0, total: 0 } as PipelineProgress,
      setStatus: (status, errorMessage) => set({
        status,
        progress: { ...get().progress, errorMessage },
      }),
      setProgress: (partial) => set({
        progress: { ...get().progress, ...partial },
      }),
      bulkLoad: (designs) => {
        const sections = { ...get().sections };
        designs.forEach(d => {
          sections[d.sectionId] = {
            canvasJSON: d.canvasJSON,
            canvasHeight: d.canvasHeight,
            imageUrl: d.imageUrl ?? null,
            isPlaceholder: false,
            thumbnail: d.thumbnail ?? null,
            dirty: true,
            figmaTemplateId: null,
          };
        });
        set({ sections });
      },

      sections: {},
      activeSectionId: '',
      generating: {},
      generateError: {},
      history: {},
      selectedObjectId: null,
      resolution: 2,
      snapEnabled: true,

      setActiveSectionId: (id) => set({ activeSectionId: id, selectedObjectId: null }),

      setGenerating: (sectionId, val) =>
        set({ generating: { ...get().generating, [sectionId]: val } }),

      setGenerateError: (sectionId, val) =>
        set({ generateError: { ...get().generateError, [sectionId]: val } }),

      isAnyGenerating: () => Object.values(get().generating).some(v => v),

      pushHistory: (sectionId, json) => {
        const current = get().history[sectionId] || { past: [], future: [] };
        const past = [...current.past, { json, timestamp: Date.now() }];
        if (past.length > MAX_HISTORY) past.shift();
        set({
          history: {
            ...get().history,
            [sectionId]: { past, future: [] },
          },
        });
      },

      undo: (sectionId) => {
        const current = get().history[sectionId];
        if (!current || current.past.length <= 1) return null;
        const past = [...current.past];
        const entry = past.pop()!;
        set({
          history: {
            ...get().history,
            [sectionId]: { past, future: [entry, ...current.future] },
          },
        });
        return past[past.length - 1] || null;
      },

      redo: (sectionId) => {
        const current = get().history[sectionId];
        if (!current || current.future.length === 0) return null;
        const future = [...current.future];
        const entry = future.shift()!;
        set({
          history: {
            ...get().history,
            [sectionId]: { past: [...current.past, entry], future },
          },
        });
        return entry;
      },

      canUndo: (sectionId) => {
        const h = get().history[sectionId];
        return !!h && h.past.length > 1;
      },

      canRedo: (sectionId) => {
        const h = get().history[sectionId];
        return !!h && h.future.length > 0;
      },

      saveCanvasState: (sectionId, json, height) =>
        set({
          sections: {
            ...get().sections,
            [sectionId]: {
              ...get().sections[sectionId],
              canvasJSON: json,
              canvasHeight: height,
              dirty: true,
              imageUrl: get().sections[sectionId]?.imageUrl || null,
              isPlaceholder: get().sections[sectionId]?.isPlaceholder || false,
              thumbnail: get().sections[sectionId]?.thumbnail || null,
              figmaTemplateId: get().sections[sectionId]?.figmaTemplateId || null,
            },
          },
        }),

      getCanvasState: (sectionId) => get().sections[sectionId] || null,

      setImage: (sectionId, url, isPlaceholder = false) => {
        const existing = get().sections[sectionId];
        set({
          sections: {
            ...get().sections,
            [sectionId]: {
              ...(existing || {
                canvasJSON: '',
                canvasHeight: 520,
                thumbnail: null,
                dirty: false,
                figmaTemplateId: null,
              }),
              imageUrl: url,
              isPlaceholder,
            },
          },
        });
      },

      hasImage: (sectionId) => {
        const s = get().sections[sectionId];
        return !!s?.imageUrl && !s.isPlaceholder;
      },

      setThumbnail: (sectionId, dataUrl) => {
        const s = get().sections[sectionId];
        if (!s) return;
        set({
          sections: {
            ...get().sections,
            [sectionId]: { ...s, thumbnail: dataUrl },
          },
        });
      },

      setFigmaTemplate: (sectionId, templateId) => {
        const s = get().sections[sectionId];
        if (!s) return;
        set({
          sections: {
            ...get().sections,
            [sectionId]: { ...s, figmaTemplateId: templateId, dirty: true },
          },
        });
      },

      getFigmaTemplateId: (sectionId) => {
        return get().sections[sectionId]?.figmaTemplateId ?? null;
      },

      setSelectedObjectId: (id) => set({ selectedObjectId: id }),
      setResolution: (r) => set({ resolution: r }),
      toggleSnap: () => set({ snapEnabled: !get().snapEnabled }),

      reset: () => set({
        sections: {},
        activeSectionId: '',
        generating: {},
        generateError: {},
        history: {},
        selectedObjectId: null,
        status: 'idle',
        progress: { imaged: 0, composed: 0, total: 0 },
      }),
    }),
    {
      name: 'dm_canvas_editor',
      storage: createJSONStorage(() => safeStorage),
      version: 3, // v3: sections 비저장 (Gemini data URL이 localStorage 5MB 한도 초과)
      migrate: (_persistedState: any, version: number) => {
        if (version < 3) {
          return { resolution: 2, snapEnabled: true };
        }
        return _persistedState;
      },
      // sections/history는 메모리 전용 — data URL 용량 때문에 localStorage 초과 위험
      partialize: (state) => ({
        resolution: state.resolution,
        snapEnabled: state.snapEnabled,
      }),
    }
  )
);

// ===== Section type → DALL-E image type mapping =====

export const SECTION_IMAGE_MAP: Record<ManuscriptSectionType, 'hero' | 'background' | 'lifestyle' | 'feature'> = {
  hooking: 'hero',
  hero: 'hero',
  problem: 'background',
  solution: 'lifestyle',
  features: 'feature',
  detail: 'feature',
  howto: 'lifestyle',
  social_proof: 'background',
  trust: 'background',
  specs: 'background',
  guarantee: 'background',
  event_banner: 'background',
  cta: 'hero',
};

export const SECTION_LABEL_MAP: Record<ManuscriptSectionType, string> = {
  hooking: '후킹',
  problem: '문제 공감',
  solution: '솔루션 제시',
  features: '핵심 특장점',
  howto: '사용 방법',
  social_proof: '사회적 증거',
  specs: '스펙/상세',
  guarantee: '보증/신뢰',
  event_banner: '이벤트 배너',
  cta: '구매 유도',
  hero: '히어로',
  detail: '상세 설명',
  trust: '신뢰 요소',
};
