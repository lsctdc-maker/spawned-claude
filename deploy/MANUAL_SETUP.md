# DetailMaker 수동 설정 가이드

## 1. .env.local 생성 (필수)

`deploy/.env.local` 파일을 `.env.local.example` 참고해서 생성:

```bash
# 필수
ANTHROPIC_API_KEY=sk-ant-xxx          # AI 인터뷰/원고 생성
OPENAI_API_KEY=sk-xxx                  # DALL-E 이미지 생성
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Figma (로컬 동기화용)
FIGMA_API_TOKEN=figd_xxx               # developers.figma.com에서 발급
FIGMA_FILE_KEY=xxx                     # Figma 파일 URL에서 추출
```

## 2. Supabase 테이블 생성 (SQL 실행)

Supabase 대시보드 > SQL Editor에서 아래 파일 순서대로 실행:

1. `supabase/migrations/003_figma_templates.sql` — Figma 템플릿 테이블
2. `supabase/migrations/004_template_analysis.sql` — 분석 결과 + 디자인 패턴 테이블

## 3. Supabase Storage 버킷 생성

Supabase 대시보드 > Storage에서:
- `template-backgrounds` 버킷 생성 (Public)

## 4. Figma MCP 연결 (선택)

Claude Desktop 또는 MCP 클라이언트에서 Figma MCP Server 연결:
- URL: `https://mcp.figma.com/mcp`
- Figma Full 시트 필요 (Dev 시트 불가)

## 5. Supabase MCP 연결 (선택)

Supabase MCP Server 연결하면 SQL 실행을 Claude가 직접 수행 가능:
- Claude Code Settings > MCP Servers에서 추가
