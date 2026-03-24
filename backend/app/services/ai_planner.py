"""AI 기획 인터뷰 엔진 - 카테고리별 질문 관리 및 USP 추출"""

import json
import logging
from typing import Dict, List, Optional

import anthropic

from app.config import get_settings
from app.models.product import (
    CategoryType,
    InterviewAnswer,
    InterviewQuestion,
    InterviewSession,
    ProductAnalysis,
    ProductInput,
    ToneStyle,
    USPItem,
)
from app.prompts.interview_prompts import get_questions_for_category
from app.prompts.usp_prompts import SYSTEM_PROMPT as USP_SYSTEM_PROMPT
from app.prompts.usp_prompts import build_usp_prompt

logger = logging.getLogger(__name__)


class AIPlannerService:
    """AI 기획 인터뷰 및 분석 서비스"""

    def __init__(self):
        settings = get_settings()
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.CLAUDE_MODEL
        self.max_tokens = settings.CLAUDE_MAX_TOKENS

    def get_interview_questions(self, category: CategoryType) -> List[InterviewQuestion]:
        """카테고리별 인터뷰 질문 목록 반환"""
        return get_questions_for_category(category)

    def _format_product_info(self, product: ProductInput) -> str:
        """상품 정보를 텍스트로 포맷팅"""
        lines = [
            f"상품명: {product.name}",
            f"카테고리: {product.category.value}",
            f"가격대: {product.price_range}",
            f"특징: {product.features}",
        ]
        if product.target_customer:
            lines.append(f"타겟 고객: {product.target_customer}")
        if product.brand_name:
            lines.append(f"브랜드: {product.brand_name}")
        if product.keywords:
            lines.append(f"키워드: {', '.join(product.keywords)}")
        return "\n".join(lines)

    def _format_interview_qa(
        self, category: CategoryType, answers: List[InterviewAnswer]
    ) -> str:
        """인터뷰 Q&A를 텍스트로 포맷팅"""
        questions = get_questions_for_category(category)
        question_map: Dict[int, InterviewQuestion] = {
            q.question_id: q for q in questions
        }
        lines = []
        for ans in answers:
            q = question_map.get(ans.question_id)
            if q:
                lines.append(f"Q: {q.question_text}")
                lines.append(f"A: {ans.answer}")
                lines.append("")
        return "\n".join(lines)

    async def extract_usps(
        self, product: ProductInput, answers: List[InterviewAnswer]
    ) -> List[USPItem]:
        """인터뷰 답변 기반 USP 자동 추출"""
        product_info = self._format_product_info(product)
        interview_qa = self._format_interview_qa(product.category, answers)
        prompt = build_usp_prompt(product_info, interview_qa, product.category)

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=USP_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = response.content[0].text
            # JSON 블록 추출
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]

            data = json.loads(response_text.strip())
            usps = []
            for item in data.get("usps", []):
                usps.append(
                    USPItem(
                        title=item["title"],
                        description=item["description"],
                        icon=item.get("icon", "✅"),
                    )
                )
            return usps

        except json.JSONDecodeError as e:
            logger.error(f"USP JSON 파싱 실패: {e}")
            return self._fallback_usps(product)
        except anthropic.APIError as e:
            logger.error(f"Claude API 오류: {e}")
            return self._fallback_usps(product)

    def _fallback_usps(self, product: ProductInput) -> List[USPItem]:
        """API 실패 시 기본 USP 생성"""
        features = product.features.split(",") if "," in product.features else [product.features]
        usps = []
        icons = ["🏆", "✅", "💎", "🎯", "⭐"]
        for i, feat in enumerate(features[:5]):
            feat = feat.strip()
            usps.append(
                USPItem(
                    title=feat[:8] if len(feat) > 8 else feat,
                    description=feat[:40] if len(feat) > 40 else feat,
                    icon=icons[i % len(icons)],
                )
            )
        return usps if usps else [
            USPItem(title="프리미엄 품질", description="엄선된 원료와 까다로운 품질 관리", icon="🏆"),
            USPItem(title="합리적 가격", description="가성비 높은 프리미엄 제품", icon="💰"),
            USPItem(title="고객 만족", description="높은 재구매율과 고객 만족도", icon="⭐"),
        ]

    async def analyze_product(
        self, product: ProductInput, answers: List[InterviewAnswer]
    ) -> ProductAnalysis:
        """상품 종합 분석 (톤 추천 포함)"""
        product_info = self._format_product_info(product)
        interview_qa = self._format_interview_qa(product.category, answers)
        usps = await self.extract_usps(product, answers)

        analysis_prompt = f"""다음 상품 정보와 인터뷰 결과를 종합 분석해주세요.

[상품 정보]
{product_info}

[인터뷰 Q&A]
{interview_qa}

아래 JSON 형식으로 분석 결과를 제공해주세요:
{{
    "target_audience": "타겟 고객 정의 (구체적으로)",
    "tone_recommendation": "trust|emotional|impact 중 택1",
    "tone_reason": "톤 추천 이유",
    "key_benefits": ["핵심 혜택 3~5개"],
    "emotional_hooks": ["감성 포인트 2~3개"],
    "trust_elements": ["신뢰 요소 2~3개"]
}}

JSON만 응답하세요.
"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system="당신은 한국 이커머스 마케팅 분석 전문가입니다.",
                messages=[{"role": "user", "content": analysis_prompt}],
            )

            response_text = response.content[0].text
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]

            data = json.loads(response_text.strip())

            tone_map = {
                "trust": ToneStyle.TRUST,
                "emotional": ToneStyle.EMOTIONAL,
                "impact": ToneStyle.IMPACT,
            }

            return ProductAnalysis(
                product_name=product.name,
                category=product.category,
                usps=usps,
                target_audience=data.get("target_audience", product.target_customer or "일반 소비자"),
                tone_recommendation=tone_map.get(
                    data.get("tone_recommendation", "trust"), ToneStyle.TRUST
                ),
                key_benefits=data.get("key_benefits", []),
                emotional_hooks=data.get("emotional_hooks", []),
                trust_elements=data.get("trust_elements", []),
            )

        except (json.JSONDecodeError, anthropic.APIError) as e:
            logger.error(f"상품 분석 실패: {e}")
            return ProductAnalysis(
                product_name=product.name,
                category=product.category,
                usps=usps,
                target_audience=product.target_customer or "일반 소비자",
                tone_recommendation=ToneStyle.TRUST,
                key_benefits=[product.features],
                emotional_hooks=["고객 만족"],
                trust_elements=["품질 보증"],
            )

    def create_session(self, product: ProductInput) -> InterviewSession:
        """인터뷰 세션 생성"""
        return InterviewSession(product=product)
