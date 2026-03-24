"""상세페이지 조립 엔진 - 전체 상세페이지를 하나로 결합"""

import logging
import os
from typing import Dict, List, Optional

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.models.detail_page import (
    CopywritingResult,
    DetailPageOutput,
    PageBuildRequest,
    SectionOutput,
)
from app.models.product import InterviewAnswer, ProductInput, ToneStyle, USPItem
from app.models.template import SectionType, TemplateConfig
from app.services.ai_planner import AIPlannerService
from app.services.copywriter import CopywriterService
from app.services.template_engine import TemplateEngineService

logger = logging.getLogger(__name__)

TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")


class PageBuilderService:
    """상세페이지 조립 서비스"""

    def __init__(self):
        self.planner = AIPlannerService()
        self.copywriter = CopywriterService()
        self.template_engine = TemplateEngineService()
        self.env = Environment(
            loader=FileSystemLoader(TEMPLATE_DIR),
            autoescape=select_autoescape(["html"]),
        )

    def _build_full_html(
        self,
        sections: List[SectionOutput],
        config: TemplateConfig,
        product_name: str,
    ) -> str:
        """섹션 HTML을 하나의 완성된 HTML로 조립"""
        sorted_sections = sorted(sections, key=lambda s: s.order)
        sections_html = "\n".join(s.html for s in sorted_sections)

        try:
            template = self.env.get_template("base.html")
            return template.render(
                product_name=product_name,
                sections_html=sections_html,
                config=config,
                palette=config.palette,
            )
        except Exception:
            logger.warning("base.html 템플릿을 찾을 수 없습니다. 인라인 HTML 생성.")
            return self._inline_full_html(
                sections_html, config, product_name
            )

    def _inline_full_html(
        self,
        sections_html: str,
        config: TemplateConfig,
        product_name: str,
    ) -> str:
        """base.html 없이 인라인 HTML 생성"""
        return f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{product_name} - 상세페이지</title>
    <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: {config.font_family};
            line-height: {config.line_height};
            color: {config.palette.text_primary};
            background-color: #F5F5F5;
            -webkit-font-smoothing: antialiased;
        }}
        .detail-page-wrapper {{
            width: {config.page_width}px;
            max-width: 100%;
            margin: 0 auto;
            background-color: {config.palette.background};
        }}
        img {{
            max-width: 100%;
            height: auto;
        }}
    </style>
</head>
<body>
    <div class="detail-page-wrapper">
        {sections_html}
    </div>
</body>
</html>"""

    async def build_page(self, request: PageBuildRequest) -> DetailPageOutput:
        """상세페이지 전체 빌드 프로세스"""
        product = request.product
        answers = request.answers
        tone = request.tone

        logger.info(f"상세페이지 빌드 시작: {product.name}")

        # 1. 템플릿 설정 결정
        config = request.template_config or TemplateConfig.from_category(
            product.category
        )

        # 2. USP 추출 (제공되지 않은 경우)
        usps = request.usps
        if not usps and answers:
            usps = await self.planner.extract_usps(product, answers)
            logger.info(f"USP {len(usps)}개 추출 완료")

        # 3. 섹션 타입 목록 추출
        section_types = [
            sc.section_type for sc in config.sections if sc.enabled
        ]

        # 4. 카피라이팅 생성
        copywriting_result = await self.copywriter.generate_all_copies(
            product=product,
            answers=answers,
            usps=usps,
            tone=tone,
            section_types=section_types,
        )
        logger.info(f"카피라이팅 {len(copywriting_result.sections)}개 섹션 완료")

        # 5. 템플릿 렌더링
        section_outputs = self.template_engine.render_all_sections(
            copies=copywriting_result.sections,
            config=config,
        )
        logger.info(f"HTML 렌더링 {len(section_outputs)}개 섹션 완료")

        # 6. 전체 HTML 조립
        full_html = self._build_full_html(
            sections=section_outputs,
            config=config,
            product_name=product.name,
        )

        # 7. 결과 반환
        return DetailPageOutput(
            product_name=product.name,
            category=product.category,
            html=full_html,
            sections=section_outputs,
            copywriting=copywriting_result,
            page_width=config.page_width,
        )

    async def build_single_section(
        self,
        section_type: SectionType,
        product: ProductInput,
        answers: List[InterviewAnswer],
        usps: List[USPItem],
        tone: ToneStyle,
        config: Optional[TemplateConfig] = None,
    ) -> SectionOutput:
        """단일 섹션만 빌드"""
        if not config:
            config = TemplateConfig.from_category(product.category)

        copy = await self.copywriter.generate_section_copy(
            section_type=section_type,
            product=product,
            answers=answers,
            usps=usps,
            tone=tone,
        )

        html = self.template_engine.render_section(
            section_type=section_type,
            copy=copy,
            palette=config.palette,
            config=config,
        )

        order = 1
        for sc in config.sections:
            if sc.section_type == section_type:
                order = sc.order
                break

        return SectionOutput(
            section_type=section_type,
            html=html,
            order=order,
        )
