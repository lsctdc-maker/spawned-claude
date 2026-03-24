"""STEP 4: 원고 작성 + 자동 검토 루프 — Claude CLI subprocess 방식"""
import json
import os
from utils import call_claude, parse_json_response


def write_and_review(ctx, max_attempts=5):
    print("▶ STEP 4: 원고 작성 + 자동 검토 루프 시작")

    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output")
    os.makedirs(output_dir, exist_ok=True)

    for attempt in range(1, max_attempts + 1):
        print(f"\n   [{attempt}차 시도]")

        # 원고 작성
        ctx.draft = _write_draft(ctx)

        # 원고 저장
        with open(os.path.join(output_dir, f"draft_v{attempt}.txt"), "w", encoding="utf-8") as f:
            f.write(ctx.draft)

        # 검토 점수
        score, reason, suggestions = _review_draft(ctx)
        print(f"   점수: {score}/10 — {reason}")

        # 검토 결과 저장
        review_data = {
            "score": score,
            "reason": reason,
            "suggestions": suggestions,
            "result": f"{'✅' if score >= 8 else '❌'} {score}점 — {'통과' if score >= 8 else '미달'}",
        }
        with open(os.path.join(output_dir, f"review_v{attempt}.json"), "w", encoding="utf-8") as f:
            json.dump(review_data, f, ensure_ascii=False, indent=2)

        if score >= 8:
            print(f"   ✅ {score}점 통과! 원고 확정")
            ctx.final_manuscript = ctx.draft
            return ctx

        # 실패 이력 누적 (다음 시도에 반영됨)
        ctx.review_history.append({
            "round": attempt,
            "score": score,
            "reason": reason,
            "suggestions": suggestions,
        })
        print(f"   ❌ 8점 미달 — 재작성 (이유: {reason})")

    print("   ⚠️ 최대 시도 횟수 도달 — 마지막 버전으로 저장")
    ctx.final_manuscript = ctx.draft
    return ctx


def _write_draft(ctx):
    """원고 작성 — 전체 맥락 포함"""
    prompt = f"""{ctx.to_prompt_context()}

위 맥락을 바탕으로 상세페이지 원고를 한국어로 작성해줘.

구조는 반드시 아래 패턴을 따를 것:
{json.dumps(ctx.structure_pattern, ensure_ascii=False, indent=2)}

요구사항:
- 타겟: {ctx.product_info.get('target')}
- 톤: {ctx.product_info.get('tone')}
- 각 섹션별 헤드카피 + 서브카피 + 본문 포함
- 이전 검토에서 지적된 문제점 반드시 수정할 것
- 반드시 한국어로 작성할 것

원고만 출력할 것 (설명 없이)"""

    return call_claude(prompt)


def _review_draft(ctx):
    """원고 검토 — 점수 + 이유 + 개선 제안 반환"""
    prompt = f"""{ctx.to_prompt_context()}

[검토할 원고]
{ctx.draft}

이 원고를 아래 기준으로 10점 만점 채점해줘.

채점 기준:
- 후킹력 (첫 문장에서 멈추게 하는가): 3점
- 구조 완성도 (섹션 흐름이 자연스러운가): 3점
- 타겟 적합성 (타겟 고객에게 와닿는가): 2점
- CTA 명확성 (구매 유도가 명확한가): 2점

반드시 JSON으로만 반환:
{{
  "score": 점수,
  "reason": "낮은 이유 한 줄 요약",
  "suggestions": ["개선점1", "개선점2"]
}}

JSON만 반환해줘. 다른 설명 없이."""

    response = call_claude(prompt)
    result = parse_json_response(response)
    return result["score"], result["reason"], result["suggestions"]
