"""크롤링 v3 — Google 검색 + 개별 상세페이지 방문"""
import json
import sys
import io
import os
import urllib.parse

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

    # Google 검색으로 보안금고 상세페이지 URL 수집
    print("Google에서 보안금고 상세페이지 검색 중...")
    try:
        page.goto("https://www.google.com/search?q=보안금고+SB+시리즈+상세페이지&hl=ko", timeout=20000)
        page.wait_for_timeout(3000)

        # 모든 링크 수집
        links = page.eval_on_selector_all("a[href]", """
            els => els.map(el => ({
                href: el.href,
                text: el.innerText.trim()
            })).filter(l => l.text.length > 10 && !l.href.includes('google'))
        """)
        print(f"  링크 {len(links)}개 발견")

        # body 텍스트도 수집
        body = page.inner_text("body")
        lines = [l.strip() for l in body.split("\n") if len(l.strip()) > 20 and "google" not in l.lower()]
        for line in lines[:20]:
            results.append({"source": "google_search", "text": line[:400]})
        print(f"  텍스트 {len(lines)}줄 수집")

    except Exception as e:
        print(f"  Google 실패: {e}")

    # 11번가 검색
    print("\n11번가에서 보안금고 검색 중...")
    try:
        page.goto("https://search.11st.co.kr/Search.tmall?kwd=보안금고", timeout=20000)
        page.wait_for_timeout(4000)
        body = page.inner_text("body")
        lines = [l.strip() for l in body.split("\n") if len(l.strip()) > 15]
        for line in lines[:15]:
            results.append({"source": "11st", "text": line[:400]})
        print(f"  텍스트 {len(lines)}줄 수집")
    except Exception as e:
        print(f"  11번가 실패: {e}")

    # G마켓 검색
    print("\nG마켓에서 보안금고 검색 중...")
    try:
        page.goto("https://browse.gmarket.co.kr/search?keyword=보안금고+내화금고", timeout=20000)
        page.wait_for_timeout(4000)
        body = page.inner_text("body")
        lines = [l.strip() for l in body.split("\n") if len(l.strip()) > 15]
        for line in lines[:15]:
            results.append({"source": "gmarket", "text": line[:400]})
        print(f"  텍스트 {len(lines)}줄 수집")
    except Exception as e:
        print(f"  G마켓 실패: {e}")

    browser.close()

# 중복 제거 및 의미없는 텍스트 필터링
noise_words = ["로그인", "회원가입", "장바구니", "고객센터", "Copyright", "쿠키", "개인정보", "이용약관", "카테고리", "추천"]
filtered = []
seen = set()
for r in results:
    text = r["text"]
    if text not in seen and not any(nw in text for nw in noise_words):
        filtered.append(r)
        seen.add(text)

print(f"\n필터링 후 {len(filtered)}개 레퍼런스")

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "step2_crawl.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(filtered, f, ensure_ascii=False, indent=2)
print(f"저장: {output_path}")

for i, r in enumerate(filtered[:10]):
    print(f"\n[{i+1}] ({r['source']}) {r['text'][:100]}")
