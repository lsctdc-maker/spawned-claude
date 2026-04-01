# TODOS

## From /plan-eng-review (2026-03-27)

### Architecture (Week 1-3)
- [ ] **Photo storage migration**: Move product photos from base64-in-localStorage to Supabase Storage. State stores URLs only. Fixes localStorage overflow, performance (JSON.stringify), and API request size issues.
  - **Why**: 사진 3-4장만 올려도 localStorage(5MB)가 터짐. 매 state 변경마다 50MB stringify. API call에 base64 전송으로 10-30초 응답.
  - **Depends on**: Supabase Storage bucket 설정

- [x] **API route auth + rate limiting**: Add Supabase Auth verification to all /api/* routes + per-user rate limiting (e.g., 10 calls/hour).
  - **Why**: 모든 API route가 인증 없이 열려있음. Claude/OpenAI API 비용 남용 위험.
  - **Depends on**: Supabase Auth가 /plan, /design에서도 필수화
  - **Fixed by**: /cso (auth on all 8 routes) + /qa ISSUE-006 (image route auth enforcement), 2026-03-30

- [ ] **Retry logic**: Add exponential backoff (3 retries: 100ms, 400ms, 1600ms) with Anthropic SDK built-in retry to all Claude API calls.
  - **Why**: 현재 모든 API route가 single-attempt. API 장애 시 바로 fallback으로 빠짐.

### Code Quality (Week 1-3)
- [ ] **DRY cleanup**: Extract common utilities:
  - `lib/claude.ts` — Claude client singleton + JSON parsing (code block stripping)
  - `lib/fallbacks.ts` — All fallback data (USP, manuscript sections, interview questions)
  - Unify all API routes to use @anthropic-ai/sdk (currently mixed with raw fetch)
  - **Why**: Fallback USP 함수가 api.ts:195와 usp/route.ts:86에 동일하게 복사. JSON 코드블록 제거 로직이 3곳 이상 반복.

- [ ] **Error response standardization**: All API routes use proper HTTP status codes (4xx/5xx for errors). Add `isFallback: true` flag when returning fallback content with 200.
  - **Why**: 모니터링 도구가 에러를 못 잡음 (200으로 에러 반환).

### Payment (Week 4-5)
- [ ] **Payment gate**: Implement at Step 3→4 transition. Check `projects.payment_status` + user project count for free tier gating.
  - **Depends on**: 토스페이먼츠 PG 계약, Supabase schema migration

- [ ] **Webhook + polling dual verification**: 토스페이먼츠 webhook for primary confirmation. Client-side polling fallback (조회 API) if payment_status not updated within 3 minutes.
  - **Why**: 돈은 났는데 서비스 못 쓰는 상황 = 고객 이탈.

- [ ] **Refund policy**: "결제 후 24시간 이내 전액 환불". Previous policy was contradictory (refund before manuscript, but payment is after manuscript).

### Testing (Week 1-3)
- [x] **Install Vitest + React Testing Library** **Completed:** v0.1.1.0 (2026-04-01)
- [ ] **Priority 1 tests**:
  - API route unit tests: interview, manuscript, usp (happy path + fallback + error)
  - Reducer unit tests: all 30+ action types in useDetailPage.ts
  - Payment flow tests: free tier gate, paid gate, webhook handling

### From /plan-design-review (2026-03-27)

- [ ] **DESIGN.md 생성 (/design-consultation 실행)**: Week 1 시작 전에 실행. AI 슬랍 제거 (보라색 교체, Inter 교체, 글래스모피즘 축소) + 전체 디자인 시스템 문서화.
  - **Why**: 코드베이스에 디자인 언어가 존재하지만 문서화 없음. 현재 보라색+Inter 조합이 AI 생성 사이트처럼 보여 신뢰 저하. 엔지니어가 새 화면 만들 때 코드를 뒤져야 함.
  - **Depends on**: 없음 (첫 번째로 실행)

- [ ] **모바일 차단 UI 구현**: Step 1 진입 시 viewport < 1280px이면 "데스크톱에서 이용해주세요" 풀스크린 모달 + "PC 링크 이메일 전송" 옵션. 결제 라우트(/payment)도 모바일 차단.
  - **Why**: 모바일 사용자가 회원가입/결제 후 "데스크톱 전용"을 보면 환불 요청 발생. 결제 전에 차단해야 함.
  - **Depends on**: 없음

### From Outside Voice
- [ ] **Landing redesign timing**: 랜딩 리디자인을 결제 검증 후(Week 4-5)로 이동 검토. 핵심 기능 품질 먼저 증명, 그 다음 랜딩 리디자인.
  - **Why**: Outside voice — "핀을 받기 전에 문을 꼼미는 격"

- [ ] **URL onboarding**: Step 1 온보딩에 'URL 붙여넣기'를 메인 CTA로 배치 검토. 기존 /api/analyze-page가 이미 URL에서 제품 정보 자동 추출 기능 보유. 이걸 "스마트스토어 URL 붙여넣기 → 자동 채우기"로 프로모션하면 온보딩 마찰 대폭 감소.
  - **Why**: Outside voice — "Step 1이 여전히 사용자에게 많은 입력을 요구함. 병목을 옮겼을 뿐 제거하지 않았다."

### From /plan-design-review #2 (2026-03-30)

- [x] **[CRITICAL] Step 2 USP 내비게이션 버그 수정**: 내비게이션 버튼을 `extractedUSPs.length > 0` 조건문 바깥으로 이동. USP 0개일 때 빈 상태 UI("직접 추가" + "다시 시도" 버튼) 추가.
  - **Why**: USP 추출 실패 시 사용자가 다음 단계로 진행 불가 (완전 차단)
  - **Depends on**: 없음
  - **Fixed by**: /qa ISSUE-001 (commit 8dddc22), 2026-03-30

- [ ] **Step 전환 개선 3건**: (1) Step 3 진입 시 원고 자동 생성 + 로딩 애니메이션, (2) Step 3→4 캔버스 에디터 온보딩 오버레이 (패널 3개 설명, 1회만), (3) Step 1-3에 클릭 가능한 스텝 인디케이터 추가 (완료 스텝 직접 이동).
  - **Why**: Step 2→3 dead zone (또 버튼 눌러야 함) + Step 3→4 context shock (완전히 다른 앱처럼 보임) + 이전 스텝 직접 이동 불가
  - **Depends on**: USP 버그 수정 (자동 생성이 USP 필요)

- [ ] **상태 UI 일괄 추가 (5건)**: (1) Step 2 사일런트 폴백 시 토스트 알림, ~~(2) 캔버스 이미지 생성 실패 시 에러 UI + 재시도 버튼~~ (DONE: /qa ISSUE-005, commit 2cbb60b), (3) Step 1 다중 사진 업로드 로딩 상태, (4) Step 3 에러 배너 내 인라인 재시도 버튼, (5) 캔버스 전체 PNG 내보내기 전 확인 다이얼로그 + 자동저장, (6) Step 2 채팅 높이 반응형(뷰포트 기반) + 진행률 표시기.
  - **Why**: 모든 상호작용의 loading/empty/error/success 상태가 미정의. 사용자가 무슨 일이 일어나고 있는지 모름.
  - **Depends on**: 없음

- [ ] **랜딩 AI 슬랍 리디자인**: 보라색 그라데이션 배경, 아이콘+타이틀+설명 카드 그리드, 중앙 정렬 모든 것, 제네릭 타임라인 패턴 교체.
  - **Why**: 랜딩이 AI 생성 사이트처럼 보여 브랜드 신뢰 저하
  - **Depends on**: /design-consultation (DESIGN.md 재생성 후 진행)

### From /qa (2026-03-30)

- [x] **ISSUE-001 (CRITICAL)**: Step 2 USP 내비게이션 트랩 수정 → commit `8dddc22`
- [x] **ISSUE-002 (HIGH)**: /design 빈 상태에 내비게이션 추가 → commit `a0e2d71`
- [x] **ISSUE-003 (HIGH)**: Footer 데드 링크 → 실제 경로로 교체 → commit `7f1bd0c`
- [x] **ISSUE-004 (MEDIUM)**: Button type="button" 기본값 추가 → commit `836a64c`
- [x] **ISSUE-005 (MEDIUM)**: 이미지 생성 에러 UI 추가 → commit `2cbb60b`
- [x] **ISSUE-006 (MEDIUM)**: /api/image 인증 강제 적용 → commit `2de9e90`
- [ ] **ISSUE-007 (LOW)**: /api/export route에 미사용 `tone` 파라미터 제거
  - **Why**: 코드 정리. 사용자 영향 없음.
