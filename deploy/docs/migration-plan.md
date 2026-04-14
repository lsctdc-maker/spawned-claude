# 마이그레이션 계획

> 현재 코드 기반 시스템에서 Figma 템플릿 기반 시스템으로의 전환 계획

---

## 1. 전체 일정

```
Phase 1: Figma 템플릿 제작       ← 디자이너 작업 (1-2주)
Phase 2: 파이프라인 구축           ← 개발 (1주)
Phase 3: 추천 + UI 통합           ← 개발 (1주)
Phase 4: 안정화 + 기존 시스템 제거 ← 개발 (1주)
```

**총 예상: 3-4주** (디자이너 작업과 개발 병렬 진행 가능)

---

## 2. Phase 1: Figma 템플릿 제작 (디자이너)

### 목표

NAS 26개 디자인 파일 기반으로 Figma 템플릿 라이브러리 구축

### 작업 상세

| 단계 | 작업 | 산출물 |
|------|------|--------|
| 1-1 | NAS 디자인 파일 수집 및 분류 | 카테고리별 정리된 이미지 |
| 1-2 | Figma 파일 생성 + 페이지 구조 세팅 | 빈 Figma 파일 (섹션 타입별 페이지) |
| 1-3 | 각 NAS 디자인에서 섹션 단위 추출 | ~234개 섹션 이미지 |
| 1-4 | 핵심 섹션 Figma 프레임으로 재구성 | ~50-80개 프레임 |
| 1-5 | `[slot:*]` 레이어 네이밍 적용 | 슬롯이 표시된 프레임 |
| 1-6 | 프레임 Description에 메타데이터 JSON 기록 | 분류된 프레임 |
| 1-7 | 품질 검수 + quality_score 부여 | 최종 템플릿 라이브러리 |

### 우선순위 (섹션 타입별)

```
1순위 (출현 빈도 100%): hooking, features, cta
2순위 (출현 빈도 80%+): social_proof, specs, guarantee
3순위 (출현 빈도 50-70%): problem, solution, howto
4순위 (출현 빈도 <50%): event_banner
```

### 최소 템플릿 수

| 섹션 타입 | 최소 변형 수 | 권장 변형 수 |
|-----------|-------------|-------------|
| hooking | 3 | 5 |
| features | 3 | 5 |
| cta | 2 | 3 |
| social_proof | 2 | 4 |
| specs | 2 | 3 |
| guarantee | 2 | 3 |
| problem | 2 | 3 |
| solution | 2 | 3 |
| howto | 2 | 3 |
| event_banner | 1 | 2 |
| **총계** | **21** | **34** |

### 참고 데이터

`design-knowledge.json`의 분석 결과를 참고:
- 카테고리별 색상 팔레트 경향
- 섹션별 레이아웃 빈도 분포
- 특수 요소 패턴 (넘버링, 뱃지, 아이콘 그리드 등)

---

## 3. Phase 2: 파이프라인 구축 (개발)

### 목표

Figma → Supabase 동기화 파이프라인 + `applyFigmaTemplate()` 함수

### 작업 상세

| 단계 | 작업 | 파일 |
|------|------|------|
| 2-1 | Supabase 마이그레이션 (figma_templates 테이블) | `supabase/migrations/003_figma_templates.sql` |
| 2-2 | Supabase Storage 버킷 생성 (template-backgrounds) | Supabase Dashboard |
| 2-3 | FigmaTemplate 타입 정의 | `src/lib/figma-templates.ts` |
| 2-4 | Figma API 동기화 스크립트 | `src/app/api/figma-sync/route.ts` |
| 2-5 | 슬롯 추출 로직 | `src/lib/figma-sync-utils.ts` |
| 2-6 | `applyFigmaTemplate()` 함수 | `src/components/canvas-editor/templates/index.ts` |
| 2-7 | 첫 번째 동기화 실행 + 검증 | 수동 API 호출 |

### 마이그레이션 SQL

```sql
-- 003_figma_templates.sql

CREATE TABLE IF NOT EXISTS figma_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section_type TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  figma_file_key TEXT NOT NULL,
  figma_node_id TEXT NOT NULL,
  figma_last_synced TIMESTAMPTZ DEFAULT now(),
  bg_image_url TEXT NOT NULL,
  bg_image_width INT DEFAULT 860,
  bg_image_height INT NOT NULL,
  text_slots JSONB NOT NULL DEFAULT '[]',
  image_slots JSONB NOT NULL DEFAULT '[]',
  category_tags TEXT[] DEFAULT '{}',
  tone_tags TEXT[] DEFAULT '{}',
  style_tags TEXT[] DEFAULT '{}',
  color_scheme TEXT DEFAULT 'dark',
  quality_score INT DEFAULT 5 CHECK (quality_score BETWEEN 1 AND 10),
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(figma_file_key, figma_node_id)
);

CREATE INDEX IF NOT EXISTS idx_ft_section_active
  ON figma_templates(section_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ft_category
  ON figma_templates USING GIN(category_tags);
CREATE INDEX IF NOT EXISTS idx_ft_quality
  ON figma_templates(quality_score DESC) WHERE is_active = true;

ALTER TABLE figma_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_active_templates" ON figma_templates
  FOR SELECT TO authenticated USING (is_active = true);
```

### 환경 변수 추가

```bash
# .env.local
FIGMA_API_TOKEN=figd_xxxxxxxxxxxx
FIGMA_FILE_KEY=xxxxxxxxxxxxxxx
```

### 검증 기준

- [ ] 테스트 Figma 프레임 3개 → 동기화 → DB 저장 확인
- [ ] 배경 PNG 2x export → Storage 업로드 → CDN URL 확인
- [ ] 슬롯 추출 정확도: 위치 오차 <2px, 폰트 크기 정확
- [ ] `applyFigmaTemplate()` → 캔버스 렌더링 → 원본과 비교

---

## 4. Phase 3: 추천 + UI 통합 (개발)

### 목표

에디터에 템플릿 추천 패널 추가 + 기존 compose 분기 연동

### 작업 상세

| 단계 | 작업 | 파일 |
|------|------|------|
| 3-1 | 추천 API 엔드포인트 | `src/app/api/recommend-templates/route.ts` |
| 3-2 | TemplateSelector 패널 UI | `src/components/canvas-editor/panels/TemplateSelector.tsx` |
| 3-3 | CanvasEditor에 패널 통합 | `src/components/canvas-editor/CanvasEditor.tsx` |
| 3-4 | canvasStore에 figmaTemplateId 추가 | `src/components/canvas-editor/state/canvasStore.ts` |
| 3-5 | CanvasWorkspace compose 분기 | `src/components/canvas-editor/CanvasWorkspace.tsx` |
| 3-6 | 템플릿 전환 시 텍스트 보존 로직 | `templates/index.ts` |
| 3-7 | 사용 횟수 트래킹 | 추천 API 내 |

### 검증 기준

- [ ] 추천 API: 요청 → 2-3개 추천 반환 (<200ms)
- [ ] 추천 패널: 섹션 변경 시 추천 갱신
- [ ] 템플릿 클릭: 배경 교체 + 텍스트 보존
- [ ] 이미지 생성: Figma 템플릿에서도 정상 동작
- [ ] Undo/Redo: 템플릿 전환도 히스토리에 포함

---

## 5. Phase 4: 안정화 + 제거 (개발)

### 목표

기존 하드코딩 템플릿을 점진적으로 제거하고 Figma 기반으로 완전 전환

### 전략: 점진적 전환

```
Week 1: Figma 템플릿 = 기본, sections.ts = 폴백
  → 모든 섹션 타입에 Figma 템플릿이 1개 이상 있는지 확인
  → 없는 섹션 타입은 sections.ts 폴백 사용

Week 2: Figma 커버리지 100% 달성
  → 모든 섹션 타입에 최소 2개 변형 확보
  → sections.ts 폴백 발동 횟수 = 0 확인

Week 3: sections.ts deprecated
  → sections.ts에 @deprecated 주석
  → htmlDesignTemplates.ts에 @deprecated 주석
  → 새 프로젝트에서는 Figma 템플릿만 사용
```

### 제거 대상 파일

```
Phase 4 완료 후 deprecated:
  ├── templates/sections.ts         ← 29개 하드코딩 템플릿
  ├── templates/htmlDesignTemplates.ts ← HTML/CSS 디자인 프레임
  ├── templates/htmlRenderer.ts     ← html-to-image 렌더러
  └── templates/iconRenderer.ts     ← SVG 아이콘 렌더러

유지:
  ├── templates/index.ts            ← compose 분기 + applyFigmaTemplate
  └── templates/types.ts            ← TextObjectDef, ShapeObjectDef (호환)
```

**주의:** 즉시 삭제하지 않고 deprecated 처리. 모니터링 기간 후 제거.

### 검증 기준

- [ ] E2E 테스트: 인터뷰 → 원고 → 추천 → 선택 → 편집 → 내보내기
- [ ] 폴백 발동 0회 (모든 섹션에 Figma 템플릿 매칭)
- [ ] 성능: 에디터 진입 → 첫 캔버스 렌더 <2초
- [ ] 출력 품질: 실제 NAS 디자인과 비교 (디자이너 검수)

---

## 6. 롤백 계획

### 즉시 롤백

Figma 시스템에 문제 발생 시, 기존 시스템으로 즉시 복구 가능:

```typescript
// .env.local
DISABLE_FIGMA_TEMPLATES=true  // 이 환경 변수로 비활성화

// templates/index.ts
export async function composeSectionCanvas(...) {
  if (process.env.DISABLE_FIGMA_TEMPLATES !== 'true') {
    const figmaTemplate = await getFigmaTemplate(section.sectionType, category);
    if (figmaTemplate) {
      await applyFigmaTemplate(...);
      return;
    }
  }

  // 기존 로직 (항상 동작)
  const template = getTemplate(section.sectionType, section.order, category);
  // ...
}
```

### 자동 폴백

Figma 템플릿 로드 실패 시 자동으로 기존 시스템 사용:
- CDN 배경 PNG 로드 실패 → 솔리드 배경 폴백
- Supabase 연결 실패 → 로컬 캐시 → sections.ts 폴백
- 슬롯 데이터 파싱 실패 → sections.ts 폴백

---

## 7. 리스크 & 대응

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| Figma API rate limit | 낮음 | 동기화 지연 | 배치 처리, 캐싱 강화 |
| 배경 PNG 용량 과대 | 중간 | 로딩 느림 | tinypng 압축, WebP 변환 |
| 슬롯 위치 정확도 | 중간 | 텍스트 겹침 | 동기화 후 수동 검증 |
| Figma 파일 구조 변경 | 낮음 | 동기화 실패 | 네이밍 규칙 문서화, 검증 스크립트 |
| 디자이너 Figma 학습 곡선 | 낮음 | 템플릿 제작 지연 | 가이드 문서 + 템플릿 샘플 |

---

## 8. 성공 기준

### 정량 지표

| 지표 | 현재 | 목표 |
|------|------|------|
| 템플릿 수 | 29개 (코드) | 50+개 (Figma) |
| 레이아웃 다양성 | 3 변형/섹션 | 3-5 변형/섹션 |
| 에디터 진입 → 렌더 | ~3초 | <2초 |
| 템플릿 전환 | 불가 (코드 변경 필요) | <500ms (클릭 전환) |
| 디자인 퀄리티 | 단순 레이아웃 | NAS 실제 디자인 수준 |

### 정성 지표

- 사용자가 "상세페이지처럼 보인다"고 느낌
- 대각선 배경, 이미지 합성 등 복잡한 비주얼 표현 가능
- 디자이너가 새 템플릿을 독립적으로 추가 가능 (개발자 없이)
- 사용자가 추천 템플릿 중 선택 → 즉시 적용 → 편집 → 출력 가능
