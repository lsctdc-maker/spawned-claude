# 템플릿 추천 + 콘텐츠 교체 설계

> 원고에 맞는 템플릿을 자동 추천하고, 콘텐츠를 교체하는 로직 설계

---

## 1. 추천 시스템 개요

### 목표

원고가 생성되면, 각 섹션(hooking, features, social_proof 등)에 대해 **가장 적합한 템플릿 2-3개를 자동 추천**.

### 추천 입력 & 출력

```
입력:
  - ManuscriptSection (섹션 타입, 제목, 본문, 이미지 가이드)
  - ProductInfo (카테고리, 타겟, 키워드)
  - ColorPalette (AI 생성 색상 팔레트)
  - ToneKey (trust | emotional | impact)

출력:
  - FigmaTemplate[] (2-3개, 점수 + 매칭 이유 포함)
```

---

## 2. 추천 알고리즘

### 스코어링 공식

```
총점 (0-100) = 카테고리 매칭 (30) + 톤 매칭 (20) + 색상 호환성 (25) + 품질 (15) + 사용 실적 (10)
```

### 각 항목 상세

#### (1) 카테고리 매칭 (30점)

```typescript
function categoryScore(template: FigmaTemplate, category: string): number {
  if (template.categoryTags.includes(category)) return 30;  // 정확히 일치
  // 유사 카테고리 그룹
  const groups = {
    wellness: ['health', 'cosmetics', 'sports'],
    home: ['living', 'interior', 'electronics'],
    consumable: ['food', 'beverages'],
  };
  for (const group of Object.values(groups)) {
    if (group.includes(category) && template.categoryTags.some(t => group.includes(t))) {
      return 15; // 같은 그룹
    }
  }
  return 5; // 범용 (category_tags가 비어있으면)
}
```

#### (2) 톤 매칭 (20점)

```typescript
function toneScore(template: FigmaTemplate, tone: ToneKey): number {
  // 직접 매칭
  if (template.toneTags.includes(tone)) return 20;
  // 톤 호환성
  const compatible: Record<ToneKey, string[]> = {
    trust: ['premium', 'minimal', 'cool'],
    emotional: ['warm', 'bold'],
    impact: ['bold', 'premium'],
  };
  if (template.toneTags.some(t => compatible[tone]?.includes(t))) return 10;
  return 0;
}
```

#### (3) 색상 호환성 (25점)

```typescript
function colorScore(template: FigmaTemplate, palette: ColorPalette): number {
  // 템플릿의 colorScheme과 팔레트의 밝기 매칭
  const paletteBrightness = getAverageBrightness(palette.colors.map(c => c.hex));

  if (template.colorScheme === 'dark' && paletteBrightness < 128) return 25;
  if (template.colorScheme === 'light' && paletteBrightness >= 128) return 25;
  if (template.colorScheme === 'accent') return 15; // 악센트는 범용

  return 5; // 불일치지만 사용 가능 (색상은 교체됨)
}
```

#### (4) 품질 점수 (15점)

```typescript
function qualityScore(template: FigmaTemplate): number {
  return (template.qualityScore / 10) * 15;
  // quality_score 10 → 15점, 5 → 7.5점
}
```

#### (5) 사용 실적 (10점)

```typescript
function usageScore(template: FigmaTemplate): number {
  // 로그 스케일: 10회 사용 → 5점, 100회 → 10점
  return Math.min(Math.log10(Math.max(template.usageCount, 1)) * 5, 10);
}
```

### 다양성 보장

같은 layout 스타일이 중복되지 않도록 필터:

```typescript
function diverseTopN(
  scored: ScoredTemplate[],
  limit: number
): ScoredTemplate[] {
  const result: ScoredTemplate[] = [];
  const usedStyles = new Set<string>();

  // 점수 내림차순 정렬
  scored.sort((a, b) => b.score - a.score);

  for (const t of scored) {
    // styleTags 중 첫 번째를 대표 스타일로 사용
    const mainStyle = t.styleTags[0] || t.variantId;
    if (usedStyles.has(mainStyle) && result.length > 0) continue;

    result.push(t);
    usedStyles.add(mainStyle);

    if (result.length >= limit) break;
  }

  return result;
}
```

---

## 3. 추천 API 엔드포인트

### `POST /api/recommend-templates`

```typescript
// deploy/src/app/api/recommend-templates/route.ts

interface RecommendRequest {
  sectionType: ManuscriptSectionType;
  category: string;
  tone: ToneKey;
  colorPalette?: ColorPalette;
  limit?: number;  // default: 3
}

interface RecommendResponse {
  templates: {
    id: string;
    name: string;
    variantId: string;
    bgImageUrl: string;        // 미리보기용
    bgImageHeight: number;
    score: number;
    matchReasons: string[];    // ["카테고리 일치 (food)", "프리미엄 톤"]
  }[];
}
```

### 구현

```typescript
export async function POST(request: NextRequest) {
  const { sectionType, category, tone, colorPalette, limit = 3 } = await request.json();

  // Supabase에서 해당 섹션 타입의 활성 템플릿 조회
  const { data: templates } = await supabase
    .from('figma_templates')
    .select('*')
    .eq('section_type', sectionType)
    .eq('is_active', true);

  if (!templates?.length) {
    return NextResponse.json({ templates: [] });
  }

  // 스코어링
  const scored = templates.map(t => ({
    ...t,
    score: categoryScore(t, category) + toneScore(t, tone)
      + (colorPalette ? colorScore(t, colorPalette) : 15)
      + qualityScore(t) + usageScore(t),
    matchReasons: buildMatchReasons(t, category, tone),
  }));

  // 다양성 보장 + 상위 N개
  const recommended = diverseTopN(scored, limit);

  return NextResponse.json({
    templates: recommended.map(t => ({
      id: t.id,
      name: t.name,
      variantId: t.variant_id,
      bgImageUrl: t.bg_image_url,
      bgImageHeight: t.bg_image_height,
      score: t.score,
      matchReasons: t.matchReasons,
    })),
  });
}
```

---

## 4. 콘텐츠 교체 로직

### `applyFigmaTemplate()` 함수

기존 `composeSectionCanvas()`와 병렬로 동작하는 새 함수:

```typescript
// deploy/src/components/canvas-editor/templates/index.ts에 추가

export async function applyFigmaTemplate(
  canvas: any,
  fabricModule: any,
  template: FigmaTemplate,
  section: ManuscriptSection,
  colors: CanvasColors,
  fonts: CanvasFonts,
  productPhotoUrl: string | null,
): Promise<void> {
  // 캔버스 크기 설정
  canvas.clear();
  canvas.setDimensions({ width: 860, height: template.bgImageHeight });

  // ═══════════════════════════════════════════
  // Layer 0: 배경 PNG (Figma export)
  // ═══════════════════════════════════════════
  try {
    const bgImg = await loadImage(fabricModule, template.bgImageUrl);
    // 2x scale PNG → 캔버스 크기에 맞춤
    const scale = Math.min(860 / bgImg.width!, template.bgImageHeight / bgImg.height!);
    bgImg.set({
      left: 0,
      top: 0,
      scaleX: scale,
      scaleY: scale,
      selectable: false,
      evented: false,
      name: '디자인 배경',
    });
    canvas.add(bgImg);
  } catch (e) {
    console.warn('배경 이미지 로드 실패, 솔리드 배경 사용:', e);
    canvas.backgroundColor = colors.bg;
  }

  // ═══════════════════════════════════════════
  // Layer 1: 이미지 슬롯
  // ═══════════════════════════════════════════
  for (const slot of template.imageSlots) {
    if (slot.binding === 'product' && productPhotoUrl) {
      try {
        const prodImg = await loadImage(fabricModule, productPhotoUrl);
        const scale = Math.min(
          slot.maxWidth / prodImg.width!,
          slot.maxHeight / prodImg.height!,
        );
        prodImg.set({
          left: slot.left,
          top: slot.top,
          scaleX: scale,
          scaleY: scale,
          name: '제품 이미지',
          shadow: new fabricModule.Shadow({
            color: 'rgba(0,0,0,0.18)',
            offsetX: 0,
            offsetY: 8,
            blur: 24,
          }),
        });
        canvas.add(prodImg);
      } catch (e) {
        console.warn('제품 이미지 로드 실패:', e);
      }
    }
    // bg-image 슬롯: 기존 이미지 생성 파이프라인과 연동
    // (useImageGeneration.ts에서 생성된 이미지가 여기에 들어감)
  }

  // ═══════════════════════════════════════════
  // Layer 2: 텍스트 슬롯
  // ═══════════════════════════════════════════
  for (const slot of template.textSlots) {
    const text = resolveText(slot.binding, section, slot.customText);
    const fontFamily = slot.useHeadline
      ? `${fonts.headline}, Noto Sans KR, sans-serif`
      : `${fonts.body}, Noto Sans KR, sans-serif`;

    const textObj = new fabricModule.Textbox(text, {
      left: slot.left,
      top: slot.top,
      width: slot.width,
      fontSize: slot.fontSize,
      fontWeight: slot.fontWeight,
      fontFamily,
      fill: slot.fill || colors.text,
      textAlign: slot.textAlign || 'left',
      lineHeight: slot.lineHeight || 1.4,
      charSpacing: (slot.letterSpacing || 0) * 10,
      opacity: slot.opacity ?? 1,
      name: slot.name,
      splitByGrapheme: true,
      // 그림자
      ...(slot.shadow ? {
        shadow: new fabricModule.Shadow(slot.shadow),
      } : {}),
      // 외곽선
      ...(slot.stroke ? {
        stroke: slot.stroke,
        strokeWidth: slot.strokeWidth || 0,
        paintFirst: 'stroke',
      } : {}),
    });

    canvas.add(textObj);
  }

  canvas.renderAll();
}
```

### 텍스트 바인딩 교체 (기존 로직 재활용)

```typescript
// 이미 templates/index.ts에 존재하는 resolveText() 그대로 사용
function resolveText(
  binding: TextObjectDef['binding'],
  section: ManuscriptSection,
  customText?: string
): string {
  switch (binding) {
    case 'title': return section.title || '제목을 입력하세요';
    case 'body': return section.body || '내용을 입력하세요';
    case 'bodyPreview': return getBodyPreview(section.body) || '내용 미리보기';
    case 'label': return customText || '';
    case 'cta': return customText || '구매하기';
    case 'custom': return customText || '';
    default: return '';
  }
}
```

---

## 5. 템플릿 전환 UX

### 시나리오: 사용자가 다른 템플릿 선택

```
1. 사용자가 추천 패널에서 다른 템플릿 클릭
2. 현재 캔버스에서 텍스트 내용 추출 (사용자 수정 보존)
3. 새 템플릿으로 applyFigmaTemplate() 호출
   → 텍스트 내용은 추출한 값 사용 (원고 원본이 아님)
4. canvas.renderAll()
```

### 텍스트 보존 로직

```typescript
async function switchTemplate(
  canvas: any,
  fabricModule: any,
  newTemplate: FigmaTemplate,
  section: ManuscriptSection,
  colors: CanvasColors,
  fonts: CanvasFonts,
  productPhotoUrl: string | null,
): Promise<void> {
  // 1. 현재 텍스트 내용 추출 (사용자 수정 반영)
  const currentTexts: Record<string, string> = {};
  canvas.getObjects().forEach((obj: any) => {
    if (obj.type === 'textbox' && obj.name) {
      currentTexts[obj.name] = obj.text;
    }
  });

  // 2. 새 템플릿 적용
  await applyFigmaTemplate(canvas, fabricModule, newTemplate, section, colors, fonts, productPhotoUrl);

  // 3. 사용자가 수정한 텍스트 복원
  canvas.getObjects().forEach((obj: any) => {
    if (obj.type === 'textbox' && obj.name && currentTexts[obj.name]) {
      obj.set('text', currentTexts[obj.name]);
    }
  });

  canvas.renderAll();
}
```

---

## 6. 사용 횟수 트래킹

템플릿 선택 시 usage_count 증가 (추천 품질 개선):

```typescript
async function trackTemplateUsage(templateId: string): Promise<void> {
  await supabase
    .from('figma_templates')
    .update({ usage_count: supabase.raw('usage_count + 1') })
    .eq('id', templateId);
}
```
