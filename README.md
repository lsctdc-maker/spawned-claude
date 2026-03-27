# DetailMaker — AI 상세페이지 자동 생성 서비스

## 서비스 소개
상품 정보와 사진만 입력하면, AI가 기획자처럼 인터뷰하고 한국형 쇼핑몰 상세페이지를 자동으로 설계해주는 서비스입니다.

## 배포 URL
- Production: https://spawned-claude.vercel.app
- GitHub: https://github.com/lsctdc-maker/spawned-claude

## 기술 스택
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI**: Claude API (Anthropic), DALL-E 3 (OpenAI)
- **Database**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel
- **이미지 처리**: html2canvas, @imgly/background-removal

## 프로젝트 구조
deploy/ 폴더가 메인 프로젝트입니다.
```
deploy/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 랜딩페이지
│   │   ├── plan/             # AI 기획 서비스
│   │   ├── design/           # 이미지 제작 서비스
│   │   ├── dashboard/        # 내 프로젝트 목록
│   │   ├── admin/            # 관리자 페이지
│   │   └── api/              # API 라우트
│   │       ├── analyze-page/   # 경쟁사 이미지 분석
│   │       ├── interview/      # AI 인터뷰
│   │       ├── manuscript/     # 원고 생성
│   │       ├── image/          # DALL-E 이미지 생성
│   │       ├── usp/            # USP 추출
│   │       ├── copywriting/    # AI 카피라이팅
│   │       └── export/         # 내보내기
│   ├── components/
│   │   ├── steps/            # Step별 컴포넌트
│   │   ├── auth/             # 인증 관련
│   │   └── ui/               # 공통 UI
│   ├── hooks/                # 커스텀 훅
│   └── lib/                  # 유틸리티
│       ├── supabase.ts       # Supabase 클라이언트
│       ├── api.ts            # API 호출
│       ├── types.ts          # 타입 정의
│       └── constants.ts      # 상수
├── package.json
└── next.config.js
```

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `ANTHROPIC_API_KEY` — Claude API
- `OPENAI_API_KEY` — DALL-E 3 이미지 생성

## 서비스 플로우

### 서비스 1: AI 기획 (/plan)
1. 제품 등록 — 사진 업로드(최대 10장) + 기본 정보 + 경쟁사 이미지 분석
2. AI 인터뷰 — 카테고리 맞춤 질문, 동적 확장, Vision API 활용
3. 원고 확인/수정 — 한국형 9단계 구조, 톤앤매너 선택, 색상/폰트 추천

### 서비스 2: 이미지 제작 (/design)
4. 이미지 에디터 — 860px 캔버스, 섹션별 렌더링, 폰트/색상 변경, 배경 제거
5. 내보내기 — 텍스트/JSON + 섹션별 PNG + 전체 1장 이미지

## 한국형 9단계 상세페이지 구조
1. 후킹 — 강렬한 첫 화면
2. 문제 공감 — 고객 고민 짚기
3. 솔루션 제시 — 제품 소개
4. 핵심 특장점 — 차별점 상세
5. 사용 방법 — 활용법
6. 사회적 증거 — 리뷰/인증 (없으면 자동 대체)
7. 스펙/상세 정보 — 표 형태
8. 보증/신뢰 — 교환/환불/배송
9. CTA — 구매 유도
