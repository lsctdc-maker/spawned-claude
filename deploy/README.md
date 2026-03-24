# 디테일메이커 (DetailMaker)

AI 기반 한국형 쇼핑몰 상세페이지 자동 생성 서비스

## 소개

상품 정보만 입력하면 AI가 쿠팡, 네이버 스마트스토어 등 한국 온라인 쇼핑몰에 최적화된 전문가 수준의 상세페이지를 5분 만에 자동으로 생성합니다.

## 주요 기능

- **AI 기획 인터뷰**: 카테고리별 맞춤 질문으로 상품의 핵심 USP를 자동 추출
- **톤앤매너 선택**: 신뢰형 / 감성형 / 임팩트형 3가지 스타일 중 선택
- **실시간 미리보기 & 편집**: 드래그앤드롭 섹션 정렬, 인라인 편집
- **HTML & 이미지 내보내기**: 860px 한국형 레이아웃의 HTML/PNG 다운로드
- **Anthropic Claude AI 연동**: API 키 없이도 템플릿 기반으로 동작

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **스타일링**: Tailwind CSS
- **애니메이션**: Framer Motion
- **AI**: Anthropic Claude API (선택사항)
- **배포**: Vercel

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (선택)
cp .env.local.example .env.local
# .env.local 파일에서 ANTHROPIC_API_KEY 설정

# 3. 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## Vercel 배포

1. GitHub에 코드를 푸시합니다.
2. [Vercel](https://vercel.com)에서 새 프로젝트를 생성합니다.
3. GitHub 저장소를 연결합니다.
4. 환경변수에 `ANTHROPIC_API_KEY`를 설정합니다 (선택사항).
5. 배포합니다.

### 환경변수

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | 선택 | Anthropic Claude API 키. 없으면 템플릿 기반으로 동작 |

## 프로젝트 구조

```
deploy/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 랜딩 페이지
│   │   ├── create/page.tsx     # 상세페이지 생성
│   │   └── api/                # API Routes
│   │       ├── interview/      # AI 인터뷰 질문
│   │       ├── usp/            # USP 추출
│   │       ├── copywriting/    # 카피 생성
│   │       └── export/         # HTML 내보내기
│   ├── components/             # UI 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   ├── lib/                    # 유틸리티
│   └── styles/                 # 스타일
├── public/                     # 정적 파일
├── package.json
├── next.config.js
├── tailwind.config.js
└── vercel.json
```

## 라이선스

MIT
