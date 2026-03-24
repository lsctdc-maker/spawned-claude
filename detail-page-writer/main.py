"""
상세페이지 원고 자동화 파이프라인 — Claude CLI subprocess 방식

실행: python main.py
필요: claude CLI (Claude Code 구독), playwright (pip install playwright)
API 키: 불필요

파이프라인:
  STEP 1: 원고 분석 → output/step1_analysis.json
  STEP 2: 레퍼런스 크롤링 → output/step2_crawl.json
  STEP 3: 구조 분석 → output/step3_structure.json
  STEP 4: 원고 작성 + 검토 루프 → output/draft_v*.txt, output/review_v*.json
  최종 원고 → output_manuscript.txt
"""
import sys
import io
import os

# Windows cp949 인코딩 문제 해결
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# 프로젝트 루트를 sys.path에 추가 (steps/ 에서 utils 임포트 가능하도록)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pipeline import run

manuscript = """
[상품명]
보안금고 SB 시리즈 (SECURITY SAFE, SB Series)

[인증]
ECB·S EN14450 보안등급 S2 인증

[내화 단열]
- 스티로나이트 F (STYRONITE F) 내화 단열재 적용
- 60분 내화 보호 (NT FIRE 017 60Paper 기준)

[부속품]
- 선반 제공
- 넓은 내부 수납공간으로 효율적이고 대용량 수납 가능
- A4 파일 폴더 보관 가능 사이즈

[잠금 볼트]
- 내구성 볼트워크 (측면/상단, ∅22)
- 고정식 데드볼트 장착

[도장 및 방청 처리]
- 최고급 우레탄 방청 프라이머 코팅
- 내구성 아크릴 우레탄 가죽톤 마감으로 표면이 매끄럽고 밝으며 스크래치 및 마모 방지
- 최고급 아연도금 강판 사용으로 녹 방지
- 도장 전 모든 금고 표면 이물질 제거 세척 공정

[치수 (도면)]
- 문 90도 오픈 시 전체 깊이: 832mm
- 문 180도 오픈 시 전체 폭: 824mm

[보험]
- 독일 민간 부문 권장 보험 금액 적용

[방범 인증]
- ECB·S 방범 테스트 통과
- European Certification Board · Security System
- EN14450 Security Level S2
"""

if __name__ == "__main__":
    print("=" * 50)
    print("상세페이지 원고 자동화 파이프라인 시작")
    print("=" * 50)

    result = run(manuscript)

    print("\n" + "=" * 50)
    print("최종 완성 원고")
    print("=" * 50)
    print(result)

    # 파일 저장
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output_manuscript.txt")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)

    print(f"\n📄 {output_path} 저장 완료")
