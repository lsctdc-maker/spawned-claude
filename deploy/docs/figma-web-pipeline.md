# Figma -> Web 변환 파이프라인

> Figma 디자인을 웹에서 사용 가능한 형태로 변환하는 기술 스펙

---

## 1. 변환 전략: "배경 PNG + 편집 가능 슬롯"

### 아키텍처

```
Figma 프레임
    │
    ├── (1) 배경 레이어 전체 → 2x PNG export
    │       대각선, 마스크, 그라디언트, 장식 → 하나의 이미지
    │
    ├── (2) 텍스트 슬롯 [slot:*] → 위치/크기/스타일 JSON 추출
    │       [slot:title] → { left: 60, top: 120, width: 420, fontSize: 42, ... }
    │
    └── (3) 이미지 슬롯 [slot:*] → 위치/크기 JSON 추출
            [slot:product] → { left: 520, top: 60, maxWidth: 300, maxHeight: 420 }

             ↓ Supabase에 저장 (1회성)

웹 canvas (fabric.js)
    │
    ├── Layer 0: PNG 배경 이미지 (selectable: false, evented: false)
    │            Figma의 모든 복잡한 디자인이 그대로 보존됨
    │
    ├── Layer 1: 이미지 슬롯 (selectable: true)
    │            제품 사진, AI 생성 이미지 삽입
    │
    └── Layer 2: 텍스트 슬롯 (selectable: true, editable)
                 원고 텍스트로 교체, 사용자가 편집 가능
```

### 왜 이 방식인가?

| 대안 | 장점 | 단점 | 판단 |
|------|------|------|------|
| Figma → fabric.js 객체 변환 | 모든 요소 편집 가능 | 변환 복잡, 렌더링 차이 발생 | X |
| Figma → SVG → fabric.js | SVG 편집 가능 | SVG 파싱 불완전, 폰트 문제 | X |
| Figma → PNG 배경 + 슬롯 | 비주얼 100% 보존, 구현 단순 | 배경 자체는 편집 불가 | **O (채택)** |
| Figma API 실시간 호출 | 항상 최신 | 느림 (200-500ms/call), rate limit | X |

---

## 2. Figma REST API 활용

### 필요한 API 호출

#### (1) 프레임 내 레이어 트리 읽기

```
GET https://api.figma.com/v1/files/{fileKey}/nodes?ids={nodeId}
Headers: X-Figma-Token: {FIGMA_API_TOKEN}
```

응답에서 추출할 정보:
- 프레임 크기: `document.absoluteBoundingBox` → width, height
- 각 자식 레이어의 이름, 타입, 위치, 크기
- `[slot:*]` 네이밍 패턴 매칭으로 슬롯 식별

#### (2) 프레임 PNG export

```
GET https://api.figma.com/v1/images/{fileKey}?ids={nodeId}&format=png&scale=2
Headers: X-Figma-Token: {FIGMA_API_TOKEN}
```

- `scale=2`: Retina 대응 (860px → 1720px 실제 해상도)
- `format=png`: 투명도 지원
- 응답: S3 URL (임시, 다운로드 후 Supabase Storage에 영구 저장)

#### (3) 프레임 Description 읽기 (메타데이터)

프레임 노드의 `description` 필드에서 JSON 메타데이터 파싱.

### API 사용 타이밍

```
                    Figma API
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    [등록 시점]     [업데이트 시]    [런타임]
    1회성 호출      변경 시 호출     호출 없음
         │              │              │
    슬롯 추출       재동기화        Supabase만
    PNG export      재export       CDN 캐시
    DB 저장         DB 갱신         <50ms
```

---

## 3. 동기화 스크립트 설계

### `/api/figma-sync` 엔드포인트

관리자가 호출하여 Figma 템플릿을 Supabase로 동기화.

```typescript
// deploy/src/app/api/figma-sync/route.ts

interface SyncRequest {
  fileKey: string;
  nodeIds?: string[];    // 특정 프레임만 동기화 (없으면 전체)
  forceUpdate?: boolean; // 기존 데이터 강제 갱신
}

interface SyncResult {
  synced: number;
  errors: { nodeId: string; error: string }[];
}
```

### 동기화 프로세스 (단계별)

```
Step 1: Figma 파일 구조 읽기
    GET /v1/files/{fileKey}
    → 모든 페이지와 프레임 목록 획득
    → [섹션타입-변형ID] 네이밍 패턴의 프레임만 필터

Step 2: 각 프레임별 슬롯 추출
    GET /v1/files/{fileKey}/nodes?ids={nodeId}
    → 자식 레이어 순회
    → [slot:*] 패턴 레이어의 위치/크기/스타일 추출
    → text_slots[], image_slots[] JSON 생성

Step 3: 배경 PNG export
    GET /v1/images/{fileKey}?ids={nodeId}&format=png&scale=2
    → 임시 URL 다운로드
    → Supabase Storage에 업로드
    → 영구 URL 획득

Step 4: DB 저장
    UPSERT INTO figma_templates
    → figma_node_id 기준 upsert (신규: insert, 기존: update)
```

### 슬롯 추출 알고리즘

```typescript
interface ExtractedSlot {
  binding: string;       // 'title' | 'body' | 'product' | ...
  type: 'text' | 'image';
  left: number;
  top: number;
  width: number;
  height: number;
  // 텍스트 전용
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  fill?: string;
  textAlign?: string;
  lineHeight?: number;
  letterSpacing?: number;
}

function extractSlots(node: FigmaNode, parentBounds: BoundingBox): ExtractedSlot[] {
  const slots: ExtractedSlot[] = [];

  for (const child of node.children || []) {
    const name = child.name || '';

    // [slot:타입] 패턴 매칭
    const slotMatch = name.match(/^\[slot:(\w+(?::\w+)?)\]/);
    if (!slotMatch) continue;

    const binding = slotMatch[1]; // 'title', 'body', 'product', 'custom:Point 01'
    const bounds = child.absoluteBoundingBox;

    // 프레임 기준 상대 좌표 계산
    const left = Math.round(bounds.x - parentBounds.x);
    const top = Math.round(bounds.y - parentBounds.y);
    const width = Math.round(bounds.width);
    const height = Math.round(bounds.height);

    if (child.type === 'TEXT') {
      slots.push({
        binding,
        type: 'text',
        left, top, width, height,
        fontSize: child.style?.fontSize,
        fontWeight: figmaWeightToNumber(child.style?.fontWeight),
        fontFamily: mapFontFamily(child.style?.fontFamily),
        fill: figmaColorToHex(child.fills?.[0]?.color),
        textAlign: child.style?.textAlignHorizontal?.toLowerCase(),
        lineHeight: child.style?.lineHeightPercentFontSize
          ? child.style.lineHeightPercentFontSize / 100
          : undefined,
        letterSpacing: child.style?.letterSpacing,
      });
    } else {
      // IMAGE 슬롯 (Rectangle, Frame, 등)
      slots.push({
        binding,
        type: 'image',
        left, top, width, height,
      });
    }
  }

  return slots;
}
```

### 유틸리티 함수

```typescript
// Figma fontWeight 문자열 → 숫자
function figmaWeightToNumber(weight?: string): number {
  const map: Record<string, number> = {
    'Thin': 100, 'ExtraLight': 200, 'Light': 300,
    'Regular': 400, 'Medium': 500, 'SemiBold': 600,
    'Bold': 700, 'ExtraBold': 800, 'Black': 900,
  };
  return map[weight || 'Regular'] || 400;
}

// Figma RGBA → hex
function figmaColorToHex(color?: { r: number; g: number; b: number; a: number }): string {
  if (!color) return '#000000';
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Figma 폰트 → 웹 폰트 매핑
function mapFontFamily(figmaFont?: string): 'headline' | 'body' {
  // Figma에서 Serif 계열 → headline, Sans 계열 → body
  const serifFonts = ['Noto Serif KR', 'Nanum Myeongjo', 'Batang'];
  if (figmaFont && serifFonts.some(f => figmaFont.includes(f))) return 'headline';
  return 'body';
}
```

---

## 4. 데이터 스키마

### Supabase 테이블: `figma_templates`

```sql
CREATE TABLE figma_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  name TEXT NOT NULL,                       -- "hooking-A-대각선배경"
  section_type TEXT NOT NULL,               -- 'hooking' | 'features' | ...
  variant_id TEXT NOT NULL,                 -- 'A' | 'B' | 'C' | ...

  -- Figma 원본 참조
  figma_file_key TEXT NOT NULL,
  figma_node_id TEXT NOT NULL,
  figma_last_synced TIMESTAMPTZ DEFAULT now(),

  -- 배경 이미지
  bg_image_url TEXT NOT NULL,               -- Supabase Storage URL (CDN)
  bg_image_width INT DEFAULT 860,
  bg_image_height INT NOT NULL,

  -- 슬롯 정의
  text_slots JSONB NOT NULL DEFAULT '[]',   -- TextSlotDef[]
  image_slots JSONB NOT NULL DEFAULT '[]',  -- ImageSlotDef[]

  -- 분류 태그
  category_tags TEXT[] DEFAULT '{}',
  tone_tags TEXT[] DEFAULT '{}',
  style_tags TEXT[] DEFAULT '{}',
  color_scheme TEXT DEFAULT 'dark',         -- 'dark' | 'light' | 'accent'

  -- 관리
  quality_score INT DEFAULT 5 CHECK (quality_score BETWEEN 1 AND 10),
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_ft_section_active ON figma_templates(section_type) WHERE is_active = true;
CREATE INDEX idx_ft_category ON figma_templates USING GIN(category_tags);
CREATE INDEX idx_ft_quality ON figma_templates(quality_score DESC) WHERE is_active = true;

-- RLS
ALTER TABLE figma_templates ENABLE ROW LEVEL SECURITY;

-- 모든 인증 사용자가 읽기 가능
CREATE POLICY "read_templates" ON figma_templates
  FOR SELECT TO authenticated USING (is_active = true);

-- 관리자만 쓰기 가능 (figma-sync API가 service_role key 사용)
```

### Supabase Storage: `template-backgrounds`

```
bucket: template-backgrounds
├── hooking/
│   ├── hooking-A.png     (1720×1080, 2x scale)
│   ├── hooking-B.png
│   └── ...
├── features/
│   ├── features-A.png
│   └── ...
└── ...
```

### TypeScript 타입

```typescript
// deploy/src/lib/figma-templates.ts

import { ManuscriptSectionType } from '@/lib/types';
import { TextObjectDef } from '@/components/canvas-editor/templates/types';

export interface ImageSlotDef {
  binding: 'product' | 'bg-image';
  left: number;
  top: number;
  maxWidth: number;
  maxHeight: number;
  zIndex?: number;  // 레이어 순서 (음수: 배경 뒤)
}

export interface FigmaTemplate {
  id: string;
  name: string;
  sectionType: ManuscriptSectionType;
  variantId: string;

  // 배경 이미지
  bgImageUrl: string;
  bgImageWidth: number;
  bgImageHeight: number;

  // 슬롯 (기존 TextObjectDef와 호환)
  textSlots: TextObjectDef[];
  imageSlots: ImageSlotDef[];

  // 분류
  categoryTags: string[];
  toneTags: string[];
  styleTags: string[];
  colorScheme: 'dark' | 'light' | 'accent';

  // 메타
  qualityScore: number;
  usageCount: number;
}
```

---

## 5. 환경 변수

```bash
# .env.local에 추가

# Figma API (동기화 스크립트에서만 사용, 런타임 불필요)
FIGMA_API_TOKEN=figd_xxxxxxxxxxxx           # Personal Access Token
FIGMA_FILE_KEY=xxxxxxxxxxxxxxx              # 템플릿 파일 ID

# Supabase Storage (기존 사용 중)
# NEXT_PUBLIC_SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 6. 캐싱 전략

### 3단계 캐시

```
Level 1: Supabase CDN (배경 PNG)
  → Cache-Control: public, max-age=31536000 (1년)
  → 파일명에 버전 해시 포함: hooking-A-v3.png
  → <50ms (CDN edge 히트)

Level 2: In-memory 캐시 (템플릿 목록)
  → Map<sectionType, FigmaTemplate[]>
  → TTL: 5분 (300초)
  → 추천 API 호출 시 사용

Level 3: IndexedDB (클라이언트)
  → 최근 사용한 템플릿 10개 캐시
  → 오프라인에서도 마지막 사용 템플릿 표시 가능
```

### 성능 목표

| 작업 | 목표 | 방법 |
|------|------|------|
| 템플릿 목록 로드 | <100ms | Supabase 쿼리 + 서버 캐시 |
| 배경 PNG 로드 | <200ms | CDN 캐시, 2x scale |
| 템플릿 전환 | <500ms | PNG preload + 텍스트 재배치 |
| 콘텐츠 교체 | <100ms | fabric.js 텍스트 set() |

---

## 7. 에러 처리

### 동기화 실패 시

```typescript
// 개별 프레임 실패 → 스킵, 나머지 계속
// 전체 API 실패 → 에러 반환, 재시도 안내
// PNG export 실패 → 플레이스홀더 이미지 사용
```

### 런타임 로드 실패 시

```typescript
// CDN 배경 PNG 로드 실패 → 솔리드 배경 폴백
// 슬롯 데이터 없음 → 기존 하드코딩 템플릿 사용 (sections.ts)
// Supabase 연결 실패 → 로컬 캐시 (IndexedDB) 사용
```
