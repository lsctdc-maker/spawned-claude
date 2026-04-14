# 상세페이지 디자인 시스템

32개 실제 NAS 상세페이지 분석 기반 (`src/data/design-knowledge.json`).

## 글로벌 규칙

1. 섹션 구분: 구분선 없음, 배경색 변화로만 구분
2. 배경색: 밝은/어두운 톤 교차 반복
3. 이미지: 실제 제품 사진 중심 (스톡이미지 아닌 실촬영)
4. 특징 섹션: 아이콘 + 텍스트 격자 자주 사용
5. 인증/수상 마크 반드시 포함
6. CTA 버튼: 페이지 마지막에 1회만
7. 헤드라인: 섹션 상단 중앙정렬 기본
8. 넘버링 패턴: Point 01/02/03 (56%에서 사용)
9. 수치 데이터 강조: %, 배 증가, 만족도 점수
10. 영문 스크립트 폰트: 프리미엄/인테리어 헤드라인
11. 문제-해결 구조: Problem -> Solution -> Features (기기/장비)
12. 창업자/브랜드 스토리: 식품/전통주에서 효과적
13. 채팅 버블 리뷰: 최신 트렌드 (카카오톡 스타일)

## 레이아웃 캔버스

- 폭: 860px (네이버 스마트스토어 기준)
- 평균 총 높이: 12,800px
- 평균 섹션 수: 9개 (범위: 6-20)

## 레이아웃 분포

| 레이아웃 | 비율 |
|---------|------|
| center-text | 28% |
| icon-grid | 17% |
| numbered-points | 15% |
| left-text-right-image | 14% |
| full-width-image | 10% |
| product-lineup | 9% |
| right-text-left-image | 7% |

## 섹션 순서 패턴

hero -> features -> detail -> social_proof -> process -> specs -> guarantee -> cta

## 카테고리별 색상 팔레트

### food (식품)
- Primary: #3B2F2F, #1A237E, #5D4037
- Accent: #D32F2F, #FF6F00, #1B5E20
- 배경 교차: white -> warm -> dark -> white
- 특수: 제조공정 사진, 제품 라인업 좌우 교차

### cosmetics (화장품)
- Primary: #1B5E20, #8D6E63, #5D4037, #FF6D00
- Accent: #C8A96E, #F9A825, #4CAF50
- 배경 교차: white -> cream -> deep -> white -> tint
- 특수: 비건 인증 뱃지, 수치 데이터 강조, Point 1/2/3/4 넘버링

### interior (인테리어)
- Primary: #5D4037, #3E2723, #4E342E
- Accent: #8D6E63, #A1887F
- 배경 교차: dark-wood -> white -> alternating
- 특수: 영문 스크립트 폰트, 컬러 옵션 스와치

### electronics (전자기기)
- Primary: #1565C0, #212121
- Accent: #2196F3, #00BCD4
- 배경 교차: dark-hero -> white-alternating
- 특수: 실사 사용 장면, POINT 1/2/3 넘버링, 기술 스펙 상세 표

### industrial (산업재)
- Primary: #D32F2F, #424242
- Accent: #FF6F00, #FFC107
- 배경 교차: dark-dramatic -> white
- 특수: 안전 통계 수치 강조, 인증서/시험성적서

### traditional_alcohol (전통주)
- Primary: #5D4037, #4E342E
- Accent: #C8A96E, #D4AF37
- 배경 교차: cream -> white -> warm
- 특수: 크래프트 종이 텍스처, 한자 브랜드명, 패키지 세트 가격 그리드

## 섹션 타입별 패턴

### hero (100% 출현)
- 높이: ~520px
- 40%: 중앙 브랜드+제품 이미지
- 20%: 좌측 텍스트 + 우측 제품
- 15%: 풀와이드 영문 브랜딩
- 15%: 강렬한 그라데이션 (산업재)
- 10%: 모델 + 제품 오버레이 (화장품)

### features (100% 출현)
- 높이: ~480px
- 35%: 3열 아이콘+텍스트 그리드
- 20%: 중앙 텍스트 리스트
- 15%: 4열 아이콘 그리드
- 15%: 좌정렬 넘버링 리스트
- 15%: Point 1/2/3 넘버링

### social_proof (80% 출현)
- 높이: ~440px
- 45%: 후기 카드 (인용구 + 사용자명)
- 30%: 인증마크/수상 뱃지 그리드
- 15%: 텍스트 리뷰 (별점 포함)
- 10%: 수치 데이터 강조

### cta (80% 출현)
- 높이: ~300px
- 55%: 중앙 CTA 텍스트 + 버튼
- 25%: 브랜드 로고 + 채널 링크
- 20%: 라이프스타일 사진 + CTA
