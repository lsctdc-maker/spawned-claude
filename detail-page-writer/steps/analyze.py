"""STEP 1: 원고 분석 — Claude CLI subprocess 방식"""
import json
import os
from utils import call_claude, parse_json_response


def analyze_manuscript(ctx):
    print("▶ STEP 1: 원고 분석 중...")

    prompt = f"""다음 상품 원고를 분석해서 JSON으로 반환해줘.

{ctx.raw_manuscript}

반환 형식:
{{
  "product_name": "상품명",
  "category": "카테고리",
  "target": "타겟 고객",
  "key_features": ["특징1", "특징2", "특징3"],
  "tone": "원고 톤 (감성적/전문적/친근한 등)",
  "keywords": ["핵심 키워드1", "키워드2", "키워드3"]
}}

JSON만 반환해줘. 다른 설명 없이."""

    response = call_claude(prompt)
    ctx.product_info = parse_json_response(response)

    # 결과 저장
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output")
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, "step1_analysis.json"), "w", encoding="utf-8") as f:
        json.dump(ctx.product_info, f, ensure_ascii=False, indent=2)

    print(f"   완료: {ctx.product_info['product_name']} / 타겟: {ctx.product_info['target']}")
    return ctx
