# DetailMaker — AI 상세페이지 자동 생성 서비스

## 현재 아키텍처 (2026-04-29)

- **Framework**: Next.js 14.2.35 (App Router)
- **에디터**: detail-editor (다크테마, 프로토타입 기반) — 구축 중
- **State**: useDetailPage (useReducer + Context)
- **Auth**: Supabase Auth + RLS
- **Deploy**: Vercel
- **AI**: Anthropic Claude (카피) + Google Gemini (이미지)

## 페이지 구조

```
/ — 메인 랜딩 (다크테마)
/plan — AI 기획 (Step 1-3: 제품정보 → 인터뷰 → 원고)
/design — 상세페이지 에디터 (다크테마 4-column)
/dashboard — 프로젝트 관리
/seed — 테스트용 샘플 데이터
```

## 디렉토리

```
src/
  app/
    api/
      ai-copy/         — 경쟁사 데이터 기반 AI 카피
      competitor-research/ — 네이버 쇼핑 검색
      generate-gemini/  — Gemini 이미지 생성
      copywriting/      — 원고 생성
      interview/        — AI 인터뷰
      manuscript/       — 원고 관리
      image/            — 스톡 이미지
      usp/              — USP 추출
      export/           — PNG 내보내기
    plan/              — Step 1-3
    design/            — 에디터
  components/
    detail-editor/     — 새 다크테마 에디터 (구축 중)
    konva-editor/      — Konva.js 에디터 (교체 예정)
    page-editor/       — SectionList만 활성 (나머지 정리됨)
    steps/             — Step1~3 + Step5Export
    auth/              — AuthProvider + LoginModal
    layout/            — Header + Footer + ClientProviders
    ui/                — Button, Input, Card 등
  lib/
    types.ts           — 타입 정의
    constants.ts       — 상수
    auth-server.ts     — 서버 인증
    auth-fetch.ts      — 클라이언트 인증 fetch
    supabase.ts        — Supabase 클라이언트
    api.ts             — API 호출 래퍼
    db.ts              — DB 함수
    prompts.ts         — AI 프롬프트
    gemini-prompts.ts  — Gemini 이미지 프롬프트
    design-knowledge.ts — 디자인 지식
  data/
    design-knowledge.json — 32개 NAS 상세페이지 분석
  context/             — AI 컨텍스트 파일
```

## 코딩 규칙

- UI 텍스트: 한국어
- Auth: authFetch() (클라이언트), requireAuth() (서버)
- 다크 테마: #111115 기반, #18181c 카드, #222 입력필드
- 에디터 폭: 860px (네이버 스마트스토어)

## 환경변수

```
ANTHROPIC_API_KEY     — Claude API (카피/인터뷰)
GEMINI_API_KEY        — Gemini (이미지)
NAVER_CLIENT_ID       — 네이버 쇼핑 검색
NAVER_CLIENT_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
