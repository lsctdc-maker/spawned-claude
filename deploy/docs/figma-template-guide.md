# Figma 템플릿 설계 가이드

> DetailMaker 상세페이지 자동 생성 시스템을 위한 Figma 템플릿 설계 규칙

---

## 1. 개요

### 왜 Figma를 쓰는가?

현재 코드 기반 템플릿(`sections.ts`)의 한계:
- 사각형, 원, 선, 그라디언트만 가능
- 대각선 배경, 이미지 마스킹, 복잡한 합성 불가
- 실제 한국형 상세페이지 퀄리티에 미달

Figma를 디자인 도구로 활용하면:
- 모든 복잡한 비주얼 표현 가능 (대각선, 클리핑 마스크, 그림자 합성 등)
- 디자이너가 익숙한 도구로 빠르게 템플릿 제작
- Figma REST API로 레이어 정보 자동 추출 가능
- 배경 전체를 PNG로 export → 웹에서 그대로 사용

### 핵심 원칙

1. **1 프레임 = 1 섹션 템플릿** (860px 폭, 가변 높이)
2. **슬롯(slot) 시스템**: 텍스트/이미지 교체 영역을 레이어 이름으로 표시
3. **배경 분리**: 복잡한 비주얼은 배경 레이어 → PNG export → 편집 불가
4. **슬롯은 편집 가능**: 텍스트/이미지만 웹에서 교체 + 편집

---

## 2. Figma 파일 구조

### 프로젝트 구성

```
📁 DetailMaker Templates (Figma Project)
│
├── 📄 [FILE] Template Library
│   │
│   ├── 📄 [PAGE] Cover & Guide
│   │   └── 사용법, 네이밍 규칙, 슬롯 설명, 색상 가이드
│   │
│   ├── 📄 [PAGE] Hooking (히어로)
│   │   ├── [hooking-A] 좌텍스트 + 우제품 + 대각선 배경
│   │   ├── [hooking-B] 중앙 타이틀 + 풀이미지 오버레이
│   │   ├── [hooking-C] 제품 중심 + 하단 카피
│   │   ├── [hooking-D] 분할 배경 (좌 이미지 / 우 컬러)
│   │   └── [hooking-E] 그라디언트 메시 + 큰 타이틀
│   │
│   ├── 📄 [PAGE] Problem (문제 제기)
│   │   ├── [problem-A] 좌측 악센트 바 + 강조 텍스트
│   │   ├── [problem-B] 어두운 배경 + 질문형 타이틀
│   │   └── [problem-C] 이미지 분할 + 대비 텍스트
│   │
│   ├── 📄 [PAGE] Solution (해결책)
│   │   ├── [solution-A] 밝은 배경 + 제품 중심
│   │   ├── [solution-B] 전/후 비교 레이아웃
│   │   └── [solution-C] 제품 클로즈업 + 오버레이 텍스트
│   │
│   ├── 📄 [PAGE] Features (특징)
│   │   ├── [features-A] 아이콘 그리드 3열
│   │   ├── [features-B] 넘버링 포인트 (Point 01/02/03)
│   │   ├── [features-C] 카드 레이아웃
│   │   ├── [features-D] 좌우 교차 (지그재그)
│   │   └── [features-E] 수치 데이터 강조
│   │
│   ├── 📄 [PAGE] How-to (사용법)
│   │   ├── [howto-A] 스텝 아이콘 + 번호
│   │   └── [howto-B] 사진 그리드 + 설명
│   │
│   ├── 📄 [PAGE] Social Proof (사회적 증거)
│   │   ├── [social_proof-A] 리뷰 카드 그리드
│   │   ├── [social_proof-B] 인증/수상 마크
│   │   └── [social_proof-C] 데이터 증거 (수치 강조)
│   │
│   ├── 📄 [PAGE] Specs (상세 스펙)
│   │   ├── [specs-A] 좌정렬 테이블
│   │   └── [specs-B] 카드 형태 스펙
│   │
│   ├── 📄 [PAGE] Guarantee (보증/안심)
│   │   ├── [guarantee-A] 아이콘 + 보증 항목
│   │   └── [guarantee-B] 인증서 이미지 + 설명
│   │
│   ├── 📄 [PAGE] Event Banner (이벤트)
│   │   ├── [event_banner-A] 할인율 강조
│   │   └── [event_banner-B] 기간 한정 + 카운트다운
│   │
│   ├── 📄 [PAGE] CTA (구매 유도)
│   │   ├── [cta-A] 풀와이드 배경 + 큰 CTA
│   │   └── [cta-B] 미니멀 + 핵심 카피
│   │
│   └── 📄 [PAGE] Components (공유 컴포넌트)
│       ├── Badge / 뱃지 세트
│       ├── Icon / 아이콘 세트
│       ├── Divider / 구분선
│       ├── Color Styles / 색상 스타일
│       └── Text Styles / 텍스트 스타일
│
└── 📄 [FILE] Category Variants (선택)
    ├── 📄 [PAGE] Food (식품)
    ├── 📄 [PAGE] Cosmetics (화장품)
    └── 📄 [PAGE] Electronics (전자기기)
```

### 필수 규칙

| 규칙 | 설명 |
|------|------|
| 프레임 폭 | **860px** 고정 (네이버 스마트스토어 표준) |
| 프레임 높이 | 가변 (400-800px, 섹션 내용에 따라) |
| 배경색 | 실제 색상 대신 **대표색** 사용 (나중에 원고 팔레트로 교체됨) |
| 텍스트 | **플레이스홀더** 사용 (실제 원고 텍스트가 교체됨) |
| 이미지 | **더미 이미지** 사용 (AI 생성/업로드 이미지가 교체됨) |

---

## 3. 슬롯(Slot) 시스템

### 슬롯이란?

슬롯은 **웹에서 교체/편집할 수 있는 영역**입니다.
Figma 레이어 이름에 `[slot:타입]` 접두어를 붙여서 표시합니다.

**슬롯이 아닌 레이어**: 배경 전체와 함께 PNG로 export됨 (편집 불가)
**슬롯인 레이어**: 위치/크기/스타일 정보만 추출, 웹에서 편집 가능한 요소로 생성됨

### 레이어 네이밍 규칙

```
프레임: [hooking-A] (860×540)
│
├── 🎨 bg-layer                    ← PNG export 대상 (전체 배경)
│   ├── 대각선 마스크               ← export에 포함
│   ├── 배경 그라디언트             ← export에 포함
│   ├── 장식 도형들                 ← export에 포함
│   └── 오버레이                    ← export에 포함
│
├── 📝 [slot:title]                 ← 텍스트 슬롯: ManuscriptSection.title
├── 📝 [slot:body]                  ← 텍스트 슬롯: ManuscriptSection.body
├── 📝 [slot:bodyPreview]           ← 텍스트 슬롯: body 앞 2줄
├── 📝 [slot:label] BRAND STORY     ← 텍스트 슬롯: 고정 라벨
├── 📝 [slot:cta] 자세히 보기        ← 텍스트 슬롯: CTA 텍스트
│
├── 🖼️ [slot:product]               ← 이미지 슬롯: 제품 사진 (누끼)
├── 🖼️ [slot:bg-image]              ← 이미지 슬롯: AI 배경 이미지
│
└── 🎯 장식요소                      ← export에 포함 (편집 불가)
```

### 슬롯 타입 정의

#### 텍스트 슬롯

| 슬롯 이름 | 교체 대상 | 설명 | 예시 플레이스홀더 |
|-----------|-----------|------|-------------------|
| `[slot:title]` | `ManuscriptSection.title` | 메인 타이틀 | "핵심 제목이 들어갑니다" |
| `[slot:body]` | `ManuscriptSection.body` | 전체 본문 | "본문 내용이 여기에 들어갑니다. 여러 줄의 설명 텍스트..." |
| `[slot:bodyPreview]` | body 앞 2줄 | 짧은 미리보기 | "본문의 첫 두 줄이 표시됩니다" |
| `[slot:label]` | 고정 텍스트 | 카테고리/브랜드 라벨 | "BRAND STORY" |
| `[slot:cta]` | 고정 텍스트 | 행동 유도 | "자세히 보기" |
| `[slot:custom:텍스트]` | 고정 텍스트 | 커스텀 고정 텍스트 | "Point 01" |

#### 이미지 슬롯

| 슬롯 이름 | 교체 대상 | 설명 |
|-----------|-----------|------|
| `[slot:product]` | 제품 사진 | 누끼 제품 이미지 (사용자 업로드) |
| `[slot:bg-image]` | AI 생성/업로드 이미지 | 섹션 배경 이미지 |

### 슬롯 레이어 스타일 요구사항

슬롯 레이어의 Figma 스타일은 그대로 웹에 적용됩니다:

**텍스트 슬롯에서 추출하는 속성:**
- Position: X, Y (프레임 기준 좌표)
- Size: Width (높이는 텍스트 양에 따라 자동)
- Font: Family, Size, Weight, Line Height, Letter Spacing
- Color: Fill color
- Alignment: Text align (left / center / right)

**이미지 슬롯에서 추출하는 속성:**
- Position: X, Y
- Size: Width, Height (최대 영역)

---

## 4. 프레임 속성 (메타데이터)

각 프레임의 Figma Description(설명) 필드에 JSON 메타데이터를 기록합니다:

```json
{
  "sectionType": "hooking",
  "variantId": "A",
  "categoryTags": ["food", "cosmetics", "health"],
  "toneTags": ["premium", "trust"],
  "styleTags": ["diagonal-bg", "product-overlay", "dark-theme"],
  "colorScheme": "dark",
  "hasProductImage": true,
  "hasBgImage": true
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `sectionType` | string | O | 섹션 타입 (hooking, problem, solution, features, howto, social_proof, specs, guarantee, event_banner, cta) |
| `variantId` | string | O | 변형 ID (A, B, C, ...) |
| `categoryTags` | string[] | O | 적합한 카테고리 (food, cosmetics, electronics, fashion, living, pets, kids, sports, interior, ...) |
| `toneTags` | string[] | O | 적합한 톤앤매너 (trust, emotional, impact, premium, minimal, bold, warm, cool) |
| `styleTags` | string[] | X | 디자인 스타일 태그 (diagonal-bg, split-layout, icon-grid, numbered-points, ...) |
| `colorScheme` | string | O | 배경 밝기 (dark, light, accent) |
| `hasProductImage` | boolean | O | 제품 이미지 슬롯 포함 여부 |
| `hasBgImage` | boolean | O | 배경 이미지 슬롯 포함 여부 |

---

## 5. 디자인 가이드라인

### 860px 캔버스 규칙

```
┌──────────────────────────────────────┐
│              860px                    │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 안전 영역 (좌우 패딩 40-80px) │   │
│  │                              │   │
│  │  텍스트는 이 안에 배치        │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                      │
│  배경은 프레임 전체를 채움            │
└──────────────────────────────────────┘
```

### 색상 규칙

템플릿은 **대표색**으로 디자인합니다. 실제 사용 시 원고의 색상 팔레트로 교체됩니다.

**다크 테마 템플릿 (colorScheme: "dark")**
- 배경: 어두운 색 (#1a1a1a ~ #333333)
- 텍스트: 밝은 색 (#FFFFFF, rgba(255,255,255,0.8))
- 악센트: 밝은 포인트색

**라이트 테마 템플릿 (colorScheme: "light")**
- 배경: 밝은 색 (#FFFFFF, #F5F5F5, #FFF8E1)
- 텍스트: 어두운 색 (#1a1a1a, #333333)
- 악센트: 진한 포인트색

### 타이포그래피 규칙

| 용도 | 폰트 | 크기 범위 | 굵기 | 행간 |
|------|------|-----------|------|------|
| 섹션 라벨 | Headline 폰트 | 11-14px | 600-700 | 1.4 |
| 메인 타이틀 | Headline 폰트 | 32-50px | 800-900 | 1.1-1.3 |
| 서브 타이틀 | Headline 폰트 | 20-28px | 600-700 | 1.3-1.4 |
| 본문 | Body 폰트 | 14-16px | 400 | 1.6-1.8 |
| CTA | Headline 폰트 | 16-20px | 700 | 1.4 |

**참고:** 실제 폰트 패밀리는 원고의 fontRecommendation으로 교체됩니다.
디자인 시에는 `Noto Sans KR` (본문) / `Noto Serif KR` (헤드라인) 사용을 권장합니다.

### 텍스트 그림자 가이드

**사진 배경 위 텍스트 (가독성 필수):**
```
타이틀: Shadow(0, 2, 8, rgba(0,0,0,0.5))
본문:   Shadow(0, 1, 4, rgba(0,0,0,0.25))
라벨:   Shadow(0, 1, 3, rgba(0,0,0,0.3))
```

**솔리드 배경 위 텍스트 (은은한 깊이감):**
```
타이틀: Shadow(0, 1, 3, rgba(0,0,0,0.08))
본문:   없음
```

---

## 6. 작업 체크리스트

### 새 템플릿 생성 시

- [ ] 프레임 폭 860px 확인
- [ ] 프레임 이름 `[섹션타입-변형ID]` 형식 (`[hooking-A]`)
- [ ] 슬롯 레이어 이름 `[slot:타입]` 형식 적용
- [ ] 프레임 Description에 JSON 메타데이터 기록
- [ ] 텍스트 플레이스홀더 입력 (실제 교체될 내용)
- [ ] 이미지 슬롯에 더미 이미지 배치
- [ ] 다크/라이트 테마 적절히 적용
- [ ] 텍스트 가독성 확인 (그림자, 오버레이)

### 품질 체크

- [ ] 860px 폭에서 텍스트가 잘리지 않는지 확인
- [ ] 모든 슬롯 레이어가 올바르게 네이밍되었는지 확인
- [ ] 배경 레이어와 슬롯 레이어가 명확히 분리되었는지 확인
- [ ] 실제 NAS 디자인 파일과 품질 비교

---

## 7. 참고: 현재 섹션 타입별 분석 데이터

`design-knowledge.json` 기반, 26개 실제 상세페이지 분석 결과:

| 섹션 타입 | 출현 빈도 | 주요 레이아웃 | 평균 높이 |
|-----------|-----------|--------------|-----------|
| hooking (hero) | 100% | center-brand-product (40%), left-text-right-product (20%) | ~520px |
| features | 100% | icon-grid-3col (35%), numbered-points (15%) | ~600px |
| social_proof | 85% | review-cards (45%), certification-grid (30%) | ~500px |
| problem | 65% | problem-empathy | ~400px |
| solution | 65% | center-product | ~500px |
| specs | 80% | left-aligned-table (50%), center-card (30%) | ~450px |
| howto | 50% | numbered-steps (25%), step-icons (15%) | ~500px |
| guarantee | 70% | shield-icons + text | ~400px |
| cta | 90% | full-width + big text | ~300px |
| event_banner | 30% | discount-highlight | ~350px |

**권장 템플릿 수:** 섹션 타입별 최소 3개, 총 **30-50개** 템플릿
