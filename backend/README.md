# 한국형 상세페이지 자동 생성 서비스 - Backend

AI 기반으로 한국 이커머스 상세페이지를 자동 생성하는 백엔드 서비스입니다.

## 주요 기능

- **AI 기획 인터뷰**: 카테고리별 맞춤 질문으로 상품 정보를 체계적으로 수집
- **USP 자동 추출**: Claude API를 활용하여 고유 판매 포인트를 자동 분석
- **카피라이팅 생성**: 톤앤매너(신뢰감/감성/임팩트)에 맞는 섹션별 카피 생성
- **이미지 처리**: 누끼 추출, 리사이즈, 합성, 히어로 배너 자동 생성
- **상세페이지 빌드**: 860px 최적화된 인라인 스타일 HTML 상세페이지 생성

## 지원 카테고리

| 카테고리 | 설명 |
|---------|------|
| food | 식품 |
| cosmetics | 화장품 |
| health | 건강기능식품 |
| electronics | 가전/전자 |
| fashion | 패션 |
| living | 생활용품 |

## 설치 및 실행

### 1. 환경 설정

```bash
cp .env.example .env
# .env 파일에 API 키 입력
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 서버 실행

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Docker로 실행

```bash
docker build -t detailpage-backend .
docker run -p 8000:8000 --env-file .env detailpage-backend
```

## API 문서

서버 실행 후 아래 URL에서 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 엔드포인트 요약

### 상품 관리 (`/api/v1/products`)
- `POST /register` - 상품 등록
- `GET /{product_id}` - 상품 조회
- `GET /` - 전체 상품 목록
- `DELETE /{product_id}` - 상품 삭제
- `POST /{product_id}/analyze` - 상품 분석

### AI 인터뷰 (`/api/v1/interview`)
- `GET /{product_id}/questions` - 인터뷰 질문 조회
- `POST /{product_id}/submit` - 답변 제출
- `POST /{product_id}/extract-usp` - USP 추출
- `GET /{product_id}/session` - 세션 상태 조회

### 카피라이팅 (`/api/v1/copywriting`)
- `POST /{product_id}/generate` - 전체 카피 생성
- `POST /{product_id}/generate-section` - 단일 섹션 카피 생성
- `POST /{product_id}/regenerate` - 카피 재생성
- `GET /tones/list` - 톤 목록

### 이미지 처리 (`/api/v1/images`)
- `POST /remove-bg` - 배경 제거
- `POST /resize` - 리사이즈
- `POST /crop` - 크롭
- `POST /composite` - 이미지 합성
- `POST /hero-banner` - 히어로 배너 생성
- `POST /add-shadow` - 그림자 효과

### 내보내기 (`/api/v1/export`)
- `POST /{product_id}/build` - 상세페이지 빌드
- `GET /{page_id}/preview` - 미리보기
- `GET /{page_id}/download` - HTML 다운로드
- `GET /{page_id}/sections` - 섹션별 HTML 조회
- `GET /{page_id}/copywriting` - 카피라이팅 결과 조회

## 환경변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `ANTHROPIC_API_KEY` | Claude API 키 | (필수) |
| `OPENAI_API_KEY` | OpenAI API 키 | (선택) |
| `DATABASE_URL` | 데이터베이스 URL | sqlite:///./detailpage.db |
| `REDIS_URL` | Redis URL | redis://localhost:6379 |
| `CLAUDE_MODEL` | Claude 모델명 | claude-sonnet-4-20250514 |
| `ALLOWED_ORIGINS` | CORS 허용 도메인 | http://localhost:3000 |

## 기술 스택

- **Framework**: FastAPI
- **AI**: Anthropic Claude API
- **Image**: Pillow, rembg
- **Template**: Jinja2
- **Validation**: Pydantic v2
