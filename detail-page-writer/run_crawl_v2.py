"""크롤링 v2 — body 텍스트 전체 추출 방식"""
import json
import sys
import io
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

results = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        locale="ko-KR"
    )
    page = context.new_page()

    # 1. 네이버 쇼핑
    print("1. 네이버 쇼핑 크롤링...")
    try:
        page.goto("https://search.shopping.naver.com/search/all?query=%EB%B3%B4%EC%95%88%EA%B8%88%EA%B3%A0", timeout=20000)
        page.wait_for_timeout(4000)
        body = page.inner_text("body")
        lines = [l.strip() for l in body.split("\n") if len(l.strip()) > 15]
        for line in lines[:15]:
            results.append({"source": "naver_shopping", "text": line[:300]})
        print(f"   {len(lines)}줄 수집 (상위 15개 저장)")
    except Exception as e:
        print(f"   실패: {e}")

    # 2. 쿠팡 검색
    print("2. 쿠팡 검색 크롤링...")
    try:
        page.goto("https://www.coupang.com/np/search?component=&q=%EB%B3%B4%EC%95%88%EA%B8%88%EA%B3%A0", timeout=20000)
        page.wait_for_timeout(4000)
        body = page.inner_text("body")
        lines = [l.strip() for l in body.split("\n") if len(l.strip()) > 15]
        for line in lines[:15]:
            results.append({"source": "coupang", "text": line[:300]})
        print(f"   {len(lines)}줄 수집 (상위 15개 저장)")
    except Exception as e:
        print(f"   실패: {e}")

    browser.close()

print(f"\n총 {len(results)}개 레퍼런스 수집")

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "step2_crawl.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"저장 완료: {output_path}")

for i, r in enumerate(results[:10]):
    print(f"[{i+1}] ({r['source']}) {r['text'][:80]}")
