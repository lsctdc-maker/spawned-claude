"""핀터레스트 크롤링 단독 실행 스크립트"""
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

search_queries = [
    "보안금고 상세페이지",
    "내화금고 상세페이지",
    "security safe detail page design",
]

results = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    for query in search_queries:
        print(f"검색 중: {query}")
        try:
            url = f"https://www.pinterest.com/search/pins/?q={query}"
            page.goto(url, timeout=20000)
            page.wait_for_timeout(4000)

            # 여러 셀렉터 시도
            selectors = [
                "[data-test-id='pin']",
                "[data-test-id='pinWrapper']",
                "div[role='listitem']",
                ".pinWrapper",
            ]

            for selector in selectors:
                pins = page.query_selector_all(selector)
                if pins:
                    print(f"  셀렉터 '{selector}'로 {len(pins)}개 발견")
                    for pin in pins[:5]:
                        text = pin.inner_text()
                        if text.strip() and len(text.strip()) > 5:
                            results.append({
                                "query": query,
                                "text": text.strip()[:500]
                            })
                    break

            if not any(page.query_selector_all(s) for s in selectors):
                # 전체 페이지 텍스트에서 추출
                body_text = page.inner_text("body")
                if body_text.strip():
                    chunks = [c.strip() for c in body_text.split("\n") if len(c.strip()) > 10]
                    for chunk in chunks[:5]:
                        results.append({
                            "query": query,
                            "text": chunk[:500]
                        })
                    print(f"  본문 텍스트에서 {min(5, len(chunks))}개 추출")

        except Exception as e:
            print(f"  실패: {e}")

    browser.close()

print(f"\n총 {len(results)}개 레퍼런스 수집")

# 저장
import os
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "step2_crawl.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"저장 완료: {output_path}")

# 결과 미리보기
for i, r in enumerate(results[:5]):
    print(f"\n[{i+1}] ({r['query']})")
    print(f"    {r['text'][:100]}...")
