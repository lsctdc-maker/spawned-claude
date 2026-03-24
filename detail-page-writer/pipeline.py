"""파이프라인 오케스트레이터 — Claude CLI subprocess 방식"""
from context import ProjectContext
from steps.analyze import analyze_manuscript
from steps.crawl import crawl_references
from steps.structure import analyze_structure
from steps.write import write_and_review


def run(manuscript_text: str) -> str:
    # 맥락 객체 생성 — 여기가 Spawned 방식의 핵심
    ctx = ProjectContext(manuscript_text)

    ctx = analyze_manuscript(ctx)    # STEP 1: 원고 분석 (Claude CLI)
    ctx = crawl_references(ctx)      # STEP 2: 크롤링 (Playwright)
    ctx = analyze_structure(ctx)     # STEP 3: 구조 분석 (Claude CLI)
    ctx = write_and_review(ctx)      # STEP 4: 작성 + 검토 루프 (Claude CLI)

    return ctx.final_manuscript
