"""STEP 3: 구조 분석 — Claude CLI subprocess 방식"""
import json
import os
from utils import call_claude, parse_json_response


def analyze_structure(ctx):
    print("▶ STEP 3: 구조 분석 중...")

    ref_text = "\n".join(ctx.reference_pages[:5]) if ctx.reference_pages else "(레퍼런스 없음 — 일반적인 상세페이지 구조 패턴 사용)"

    prompt = f"""{ctx.to_prompt_context()}

[수집된 레퍼런스 페이지 텍스트]
{ref_text}

위 상품 정보와 레퍼런스를 바탕으로, 이 상품의 상세페이지에 적합한 구조 패턴을 분석해서 JSON으로 반환해줘.

반환 형식:
{{
  "sections": [
    {{"order": 1, "name": "섹션명", "role": "역할", "copy_pattern": "카피 패턴"}},
    ...
  ],
  "hook_style": "후킹 방식",
  "cta_style": "CTA 방식"
}}

JSON만 반환해줘. 다른 설명 없이."""

    response = call_claude(prompt)
    ctx.structure_pattern = parse_json_response(response)

    # 결과 저장
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output")
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, "step3_structure.json"), "w", encoding="utf-8") as f:
        json.dump(ctx.structure_pattern, f, ensure_ascii=False, indent=2)

    print(f"   완료: {len(ctx.structure_pattern['sections'])}개 섹션 구조 도출")
    return ctx
