"""STEP 2: 레퍼런스 크롤링 — Playwright (API 불필요)"""
import json
import os
from playwright.sync_api import sync_playwright


def crawl_references(ctx):
    print("▶ STEP 2: 레퍼런스 크롤링 중...")

    keywords = ctx.product_info.get("keywords", ["보안금고"])
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="ko-KR",
        )
        page = context.new_page()

        # 11번가 검색
        print("   11번가 검색 중...")
        try:
            query = " ".join(keywords[:2])
            page.goto(f"https://search.11st.co.kr/Search.tmall?kwd={query}", timeout=20000)
            page.wait_for_timeout(4000)
            body = page.inner_text("body")
            lines = [l.strip() for l in body.split("\n") if len(l.strip()) > 15]
            for line in lines[:15]:
                results.append({"source": "11st", "text": line[:400]})
            print(f"   11번가: {len(lines)}줄 수집")
        except Exception as e:
            print(f"   11번가 실패: {e}")

        # Google 검색
        print("   Google 검색 중...")
        try:
            search_q = " ".join(keywords[:2]) + " 상세페이지 디자인"
            page.goto(f"https://www.google.com/search?q={search_q}&hl=ko", timeout=20000)
            page.wait_for_timeout(3000)
            body = page.inner_text("body")
            lines = [l.strip() for l in body.split("\n") if len(l.strip()) > 20 and "google" not in l.lower()]
            for line in lines[:15]:
                results.append({"source": "google", "text": line[:400]})
            print(f"   Google: {len(lines)}줄 수집")
        except Exception as e:
            print(f"   Google 실패: {e}")

        browser.close()

    # 노이즈 필터링
    noise = ["로그인", "회원가입", "장바구니", "고객센터", "Copyright", "쿠키", "개인정보", "이용약관"]
    filtered = []
    seen = set()
    for r in results:
        text = r["text"]
        if text not in seen and not any(nw in text for nw in noise):
            filtered.append(r)
            seen.add(text)

    ctx.reference_pages = [r["text"] for r in filtered]

    # 결과 저장
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output")
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, "step2_crawl.json"), "w", encoding="utf-8") as f:
        json.dump(filtered, f, ensure_ascii=False, indent=2)

    print(f"   완료: {len(filtered)}개 레퍼런스 수집")
    return ctx
