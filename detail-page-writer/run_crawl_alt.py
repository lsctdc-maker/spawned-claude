"""대안 크롤링 — 실제 보안금고/내화금고 상세페이지 레퍼런스 수집"""
import json
import sys
import io
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

# 보안금고/내화금고 관련 상세페이지가 있을 수 있는 사이트
target_urls = [
    "https://www.coupang.com/np/search?component=&q=%EB%B3%B4%EC%95%88%EA%B8%88%EA%B3%A0",
    "https://search.shopping.naver.com/search/all?query=%EB%B3%B4%EC%95%88%EA%B8%88%EA%B3%A0+%EB%82%B4%ED%99%94%EA%B8%88%EA%B3%A0",
]

results = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    page = context.new_page()

    # 네이버 쇼핑 검색
    print("네이버 쇼핑 크롤링 중...")
    try:
        page.goto("https://search.shopping.naver.com/search/all?query=보안금고 내화금고", timeout=20000)
        page.wait_for_timeout(3000)

        # 상품 카드 텍스트 수집
        items = page.query_selector_all(".product_item__MDtDF, .basicList_item__0T9JD, [class*='product_item'], [class*='basicList']")
        if not items:
            items = page.query_selector_all("li[class*='item']")

        print(f"  상품 {len(items)}개 발견")
        for item in items[:10]:
            text = item.inner_text()
            if text.strip() and len(text.strip()) > 20:
                results.append({
                    "source": "naver_shopping",
                    "text": text.strip()[:500]
                })
    except Exception as e:
        print(f"  네이버 실패: {e}")

    # Google 이미지 검색 (상세페이지 디자인 레퍼런스)
    print("\nGoogle 검색 크롤링 중...")
    try:
        page.goto("https://www.google.com/search?q=보안금고+상세페이지+디자인+카피라이팅", timeout=20000)
        page.wait_for_timeout(2000)

        # 검색 결과 텍스트 수집
        search_results = page.query_selector_all("div.g, div[data-hveid]")
        print(f"  결과 {len(search_results)}개 발견")
        for sr in search_results[:10]:
            text = sr.inner_text()
            if text.strip() and len(text.strip()) > 30:
                results.append({
                    "source": "google_search",
                    "text": text.strip()[:500]
                })
    except Exception as e:
        print(f"  Google 실패: {e}")

    browser.close()

print(f"\n총 {len(results)}개 레퍼런스 수집")

# 저장
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "step2_crawl.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"저장 완료: {output_path}")

# 미리보기
for i, r in enumerate(results[:8]):
    preview = r['text'][:120].replace('\n', ' ')
    print(f"\n[{i+1}] ({r['source']})")
    print(f"    {preview}...")
