# 웹 에디터 개선 스펙

> canvas editor가 Figma 템플릿을 지원하기 위한 수정사항

---

## 1. 변경 개요

### 기존 동작

```
composeSectionCanvas()
  → getTemplate(sectionType, order, category)  ← sections.ts 하드코딩
  → 배경 렌더 (solid/photo/htmlDesign)
  → 오버레이
  → 도형 배치
  → 제품 이미지
  → 텍스트 배치
```

### 변경 후

```
composeSectionCanvas()
  → getFigmaTemplate(sectionType, category)    ← Supabase DB 조회 (신규)
  → if (figmaTemplate) {
      applyFigmaTemplate()                      ← 배경 PNG + 슬롯 (신규)
    } else {
      기존 compose 로직                          ← 폴백 (변경 없음)
    }
```

---

## 2. 수정 파일 목록

| 파일 | 변경 | 설명 |
|------|------|------|
| `templates/index.ts` | 수정 | `applyFigmaTemplate()` 추가, compose 분기 |
| `CanvasEditor.tsx` | 수정 | TemplateSelector 패널 추가 |
| `CanvasWorkspace.tsx` | 수정 | Figma 템플릿 로드 분기 |
| `state/canvasStore.ts` | 수정 | `selectedTemplateId` 필드 추가 |
| `panels/TemplateSelector.tsx` | **신규** | 추천 템플릿 UI |
| `lib/figma-templates.ts` | **신규** | Supabase 템플릿 fetch + 캐시 |
| `app/api/recommend-templates/route.ts` | **신규** | 추천 API |
| `app/api/figma-sync/route.ts` | **신규** | 동기화 API |

---

## 3. 파일별 상세 변경

### 3-1. `templates/index.ts` 수정

**추가 내용:**

```typescript
import { FigmaTemplate, getFigmaTemplate } from '@/lib/figma-templates';

// 기존 composeSectionCanvas() 시그니처는 동일하게 유지
export async function composeSectionCanvas(
  canvas: any,
  fabricModule: any,
  section: ManuscriptSection,
  bgImageUrl: string | null,
  colors: CanvasColors,
  fonts: CanvasFonts,
  productPhotoUrl: string | null,
  category?: string,
  figmaTemplateId?: string,   // 신규: 특정 Figma 템플릿 지정
): Promise<void> {

  // Figma 템플릿 우선 시도
  const figmaTemplate = figmaTemplateId
    ? await getFigmaTemplateById(figmaTemplateId)
    : await getFigmaTemplate(section.sectionType, category);

  if (figmaTemplate) {
    await applyFigmaTemplate(canvas, fabricModule, figmaTemplate, section, colors, fonts, productPhotoUrl);
    return;
  }

  // 폴백: 기존 하드코딩 템플릿
  const template = getTemplate(section.sectionType, section.order, category);
  // ... (기존 compose 로직 그대로)
}
```

### 3-2. `CanvasEditor.tsx` 수정

**추가 UI: 템플릿 추천 패널**

위치: 좌측 레이어 패널 하단 또는 별도 탭

```tsx
// 기존 import에 추가
import { TemplateSelector } from './panels/TemplateSelector';

// state 추가
const [showTemplates, setShowTemplates] = useState(false);
const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

// JSX에 추가 (좌측 패널 영역)
{showTemplates && (
  <TemplateSelector
    sectionType={activeSection.sectionType}
    category={productInfo.category}
    tone={selectedTone}
    colorPalette={colorPalette}
    selectedId={selectedTemplateId}
    onSelect={async (templateId) => {
      setSelectedTemplateId(templateId);
      // 템플릿 전환 트리거
      await recomposeWithTemplate(templateId);
    }}
  />
)}

// 상단 바에 토글 버튼 추가
<button onClick={() => setShowTemplates(!showTemplates)}>
  {showTemplates ? '템플릿 닫기' : '템플릿 변경'}
</button>
```

### 3-3. `state/canvasStore.ts` 수정

```typescript
// CanvasSectionState에 필드 추가
export interface CanvasSectionState {
  canvasJSON: string;
  canvasHeight: number;
  imageUrl: string | null;
  isPlaceholder: boolean;
  thumbnail: string | null;
  dirty: boolean;
  figmaTemplateId: string | null;    // 신규: 사용 중인 Figma 템플릿 ID
}

// 액션 추가
setFigmaTemplate: (sectionId: string, templateId: string | null) => void;
```

### 3-4. `panels/TemplateSelector.tsx` (신규)

```tsx
// deploy/src/components/canvas-editor/panels/TemplateSelector.tsx

'use client';

import { useState, useEffect } from 'react';
import { ManuscriptSectionType } from '@/lib/types';
import { ToneKey, ColorPalette } from '@/lib/types';

interface TemplateOption {
  id: string;
  name: string;
  variantId: string;
  bgImageUrl: string;
  bgImageHeight: number;
  score: number;
  matchReasons: string[];
}

interface TemplateSelectorProps {
  sectionType: ManuscriptSectionType;
  category: string;
  tone: ToneKey;
  colorPalette: ColorPalette | null;
  selectedId: string | null;
  onSelect: (templateId: string) => void;
}

export function TemplateSelector({
  sectionType, category, tone, colorPalette, selectedId, onSelect
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [sectionType, category, tone]);

  async function fetchRecommendations() {
    setLoading(true);
    try {
      const res = await fetch('/api/recommend-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType, category, tone, colorPalette, limit: 3 }),
      });
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>추천 로딩 중...</div>;
  if (!templates.length) return <div>사용 가능한 템플릿이 없습니다</div>;

  return (
    <div>
      <h3>추천 템플릿</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              border: selectedId === t.id ? '2px solid #007AFF' : '1px solid #ddd',
              borderRadius: 8,
              padding: 4,
              cursor: 'pointer',
            }}
          >
            <img
              src={t.bgImageUrl}
              alt={t.name}
              style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 4 }}
            />
            <div style={{ fontSize: 11, marginTop: 4 }}>{t.name}</div>
            <div style={{ fontSize: 10, color: '#888' }}>
              {t.matchReasons[0]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 3-5. `lib/figma-templates.ts` (신규)

```typescript
// deploy/src/lib/figma-templates.ts

import { createClient } from '@supabase/supabase-js';
import { ManuscriptSectionType } from '@/lib/types';
import { TextObjectDef } from '@/components/canvas-editor/templates/types';

// ─── 타입 ───

export interface ImageSlotDef {
  binding: 'product' | 'bg-image';
  left: number;
  top: number;
  maxWidth: number;
  maxHeight: number;
  zIndex?: number;
}

export interface FigmaTemplate {
  id: string;
  name: string;
  sectionType: ManuscriptSectionType;
  variantId: string;
  bgImageUrl: string;
  bgImageWidth: number;
  bgImageHeight: number;
  textSlots: TextObjectDef[];
  imageSlots: ImageSlotDef[];
  categoryTags: string[];
  toneTags: string[];
  styleTags: string[];
  colorScheme: 'dark' | 'light' | 'accent';
  qualityScore: number;
  usageCount: number;
}

// ─── 캐시 ───

const templateCache = new Map<string, { data: FigmaTemplate[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

// ─── 조회 ───

export async function getFigmaTemplate(
  sectionType: ManuscriptSectionType,
  category?: string,
): Promise<FigmaTemplate | null> {
  const templates = await getTemplatesBySection(sectionType);
  if (!templates.length) return null;

  // 카테고리 매칭 우선, 없으면 quality 순
  if (category) {
    const matched = templates.find(t => t.categoryTags.includes(category));
    if (matched) return matched;
  }

  return templates[0]; // quality_score DESC 정렬됨
}

export async function getFigmaTemplateById(id: string): Promise<FigmaTemplate | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase
    .from('figma_templates')
    .select('*')
    .eq('id', id)
    .single();

  return data ? mapDbToTemplate(data) : null;
}

async function getTemplatesBySection(sectionType: ManuscriptSectionType): Promise<FigmaTemplate[]> {
  // 캐시 확인
  const cached = templateCache.get(sectionType);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase
    .from('figma_templates')
    .select('*')
    .eq('section_type', sectionType)
    .eq('is_active', true)
    .order('quality_score', { ascending: false });

  const templates = (data || []).map(mapDbToTemplate);

  // 캐시 저장
  templateCache.set(sectionType, { data: templates, timestamp: Date.now() });

  return templates;
}

// ─── DB 매핑 ───

function mapDbToTemplate(row: any): FigmaTemplate {
  return {
    id: row.id,
    name: row.name,
    sectionType: row.section_type,
    variantId: row.variant_id,
    bgImageUrl: row.bg_image_url,
    bgImageWidth: row.bg_image_width,
    bgImageHeight: row.bg_image_height,
    textSlots: row.text_slots || [],
    imageSlots: row.image_slots || [],
    categoryTags: row.category_tags || [],
    toneTags: row.tone_tags || [],
    styleTags: row.style_tags || [],
    colorScheme: row.color_scheme || 'dark',
    qualityScore: row.quality_score || 5,
    usageCount: row.usage_count || 0,
  };
}
```

---

## 4. CanvasWorkspace.tsx 수정 포인트

### compose 함수 호출 시 figmaTemplateId 전달

```typescript
// 기존
await composeSectionCanvas(canvas, fabricModule, section, bgImageUrl, colors, fonts, productPhoto, category);

// 변경
const figmaTemplateId = store.sections[sectionId]?.figmaTemplateId || undefined;
await composeSectionCanvas(canvas, fabricModule, section, bgImageUrl, colors, fonts, productPhoto, category, figmaTemplateId);
```

---

## 5. 템플릿 전환 시 상태 관리

### 흐름

```
1. 사용자가 TemplateSelector에서 다른 템플릿 클릭
2. CanvasEditor.onSelect(templateId) 호출
3. canvasStore.setFigmaTemplate(sectionId, templateId)
4. CanvasWorkspace에서 recompose 트리거
5. composeSectionCanvas()에 figmaTemplateId 전달
6. applyFigmaTemplate() 실행
7. 텍스트 보존 (이전 값 추출 → 새 슬롯에 복원)
```

### Zustand Store 변경

```typescript
// canvasStore.ts의 actions에 추가
setFigmaTemplate: (sectionId, templateId) =>
  set((state) => ({
    sections: {
      ...state.sections,
      [sectionId]: {
        ...state.sections[sectionId],
        figmaTemplateId: templateId,
        dirty: true,
      },
    },
  })),
```

---

## 6. 추가 고려사항

### 배경 이미지 프리로드

추천 패널에서 템플릿 미리보기를 보여줄 때, 배경 PNG를 미리 로드:

```typescript
// TemplateSelector에서 추천 목록 받았을 때
templates.forEach(t => {
  const img = new Image();
  img.src = t.bgImageUrl;  // 브라우저가 캐시
});
```

### 기존 이미지 생성과의 호환

Figma 템플릿 사용 시에도 AI 이미지 생성은 동일하게 동작:
- `[slot:bg-image]`가 있는 템플릿 → 기존 useImageGeneration.ts로 이미지 생성
- 생성된 이미지 URL → image slot에 삽입
- `[slot:product]` → 사용자 업로드 제품 사진 사용

### Undo/Redo 호환

템플릿 전환도 히스토리에 포함:
- 전환 전 canvas JSON → history.past에 push
- 전환 후 canvas JSON → 현재 상태
- Ctrl+Z로 이전 템플릿 상태로 복원 가능
