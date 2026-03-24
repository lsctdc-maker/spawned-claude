"""카피라이팅 엔진 - Claude API 연동으로 섹션별 카피 생성"""

import json
import logging
from typing import Dict, List, Optional

import anthropic

from app.config import get_settings
from app.models.detail_page import CopywritingResult, SectionCopy
from app.models.product import (
    CategoryType,
    InterviewAnswer,
    ProductInput,
    ToneStyle,
    USPItem,
)
from app.models.template import SectionType
from app.prompts.copywriting_prompts import (
    SYSTEM_PROMPT,
    build_copywriting_prompt,
)

logger = logging.getLogger(__name__)


class CopywriterService:
    """Claude API 기반 카피라이팅 서비스"""

    def __init__(self):
        settings = get_settings()
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.CLAUDE_MODEL
        self.max_tokens = settings.CLAUDE_MAX_TOKENS

    def _format_product_info(self, product: ProductInput) -> str:
        """상품 정보를 텍스트로 변환"""
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
        return "\n".join(lines)

    def _format_interview_context(self, answers: List[InterviewAnswer]) -> str:
        """인터뷰 답변을 텍스트로 변환"""
        if not answers:
            return "인터뷰 답변 없음"
        lines = []
        for ans in answers:
            lines.append(f"질문 {ans.question_id}: {ans.answer}")
        return "\n".join(lines)

    def _format_usp_context(self, usps: List[USPItem]) -> str:
        """USP를 텍스트로 변환"""
        if not usps:
            return "USP 미추출"
        lines = []
        for usp in usps:
            lines.append(f"{usp.icon} {usp.title}: {usp.description}")
        return "\n".join(lines)

    def _parse_section_response(self, response_text: str) -> Dict:
        """Claude 응답에서 JSON 파싱"""
        text = response_text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        try:
            return json.loads(text.strip())
        except json.JSONDecodeError:
            logger.warning(f"JSON 파싱 실패, 원본 텍스트 사용: {text[:100]}...")
            return {
                "headline": "",
                "subheadline": "",
                "body_text": text[:200],
                "bullet_points": [],
                "cta_text": "",
                "extra_data": {},
            }

    async def generate_section_copy(
        self,
        section_type: SectionType,
        product: ProductInput,
        answers: List[InterviewAnswer],
        usps: List[USPItem],
        tone: ToneStyle,
    ) -> SectionCopy:
        """단일 섹션 카피 생성"""
        product_info = self._format_product_info(product)
        interview_context = self._format_interview_context(answers)
        usp_context = self._format_usp_context(usps)

        prompt = build_copywriting_prompt(
            section_type=section_type,
            tone=tone,
            product_info=product_info,
            interview_context=interview_context,
            usp_context=usp_context,
        )

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )

            data = self._parse_section_response(response.content[0].text)

            return SectionCopy(
                section_type=section_type,
                headline=data.get("headline", ""),
                subheadline=data.get("subheadline", ""),
                body_text=data.get("body_text", ""),
                bullet_points=data.get("bullet_points", []),
                cta_text=data.get("cta_text", ""),
                extra_data=data.get("extra_data", {}),
            )

        except anthropic.APIError as e:
            logger.error(f"섹션 {section_type.value} 카피 생성 실패: {e}")
            return self._fallback_section_copy(section_type, product)

    def _fallback_section_copy(
        self, section_type: SectionType, product: ProductInput
    ) -> SectionCopy:
        """API 실패 시 기본 카피"""
        fallbacks = {
            SectionType.HERO: SectionCopy(
                section_type=section_type,
                headline=product.name,
                subheadline=product.features[:30] if product.features else "",
                body_text=product.features[:100] if product.features else "",
                cta_text="자세히 보기",
            ),
            SectionType.USP_POINTS: SectionCopy(
                section_type=section_type,
                headline="이 제품이 특별한 이유",
                bullet_points=["✅ 프리미엄 품질", "✅ 합리적 가격", "✅ 높은 만족도"],
            ),
            SectionType.DETAIL_DESC: SectionCopy(
                section_type=section_type,
                headline="상세 설명",
                body_text=product.features,
            ),
            SectionType.COMPARISON: SectionCopy(
                section_type=section_type,
                headline="비교해 보세요",
                subheadline="차이를 직접 확인하세요",
                bullet_points=[
                    "품질|프리미엄|일반",
                    "가격|합리적|비슷",
                    "인증|보유|미보유",
                ],
            ),
            SectionType.HOWTO: SectionCopy(
                section_type=section_type,
                headline="이렇게 사용하세요",
                bullet_points=[
                    "STEP 1. 제품을 준비합니다",
                    "STEP 2. 설명서를 확인합니다",
                    "STEP 3. 사용을 시작합니다",
                ],
            ),
            SectionType.CERTIFICATION: SectionCopy(
                section_type=section_type,
                headline="인증으로 증명합니다",
                bullet_points=["🏅 품질 인증 보유"],
            ),
            SectionType.REVIEWS: SectionCopy(
                section_type=section_type,
                headline="고객 후기",
                subheadline="실제 사용자의 솔직한 후기",
                bullet_points=["⭐⭐⭐⭐⭐ 매우 만족합니다 - 구매자A"],
            ),
            SectionType.FAQ: SectionCopy(
                section_type=section_type,
                headline="자주 묻는 질문",
                bullet_points=[
                    "Q. 배송은 얼마나 걸리나요?|A. 주문 후 1~2일 내 출고됩니다.",
                    "Q. 교환/반품이 가능한가요?|A. 수령 후 7일 이내 가능합니다.",
                ],
            ),
            SectionType.CTA: SectionCopy(
                section_type=section_type,
                headline="지금이 가장 좋은 기회입니다",
                subheadline="망설이면 품절될 수 있어요",
                cta_text="지금 바로 구매하기",
                bullet_points=["🚚 무료 배송", "🔄 무료 교환/반품"],
            ),
        }
        return fallbacks.get(
            section_type,
            SectionCopy(section_type=section_type, headline=product.name),
        )

    async def generate_all_copies(
        self,
        product: ProductInput,
        answers: List[InterviewAnswer],
        usps: List[USPItem],
        tone: ToneStyle,
        section_types: List[SectionType],
    ) -> CopywritingResult:
        """전체 섹션 카피 일괄 생성"""
        sections: List[SectionCopy] = []

        for section_type in section_types:
            copy = await self.generate_section_copy(
                section_type=section_type,
                product=product,
                answers=answers,
                usps=usps,
                tone=tone,
            )
            sections.append(copy)
            logger.info(f"섹션 {section_type.value} 카피 생성 완료")

        return CopywritingResult(
            product_name=product.name,
            category=product.category,
            tone=tone,
            sections=sections,
        )
