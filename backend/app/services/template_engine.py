"""Jinja2 기반 HTML 템플릿 렌더링 엔진"""

import logging
import os
from typing import Dict, List, Optional

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.models.detail_page import SectionCopy, SectionOutput
from app.models.product import CategoryType
from app.models.template import (
    CATEGORY_PALETTES,
    DEFAULT_SECTION_ORDER,
    ColorPalette,
    SectionConfig,
    SectionType,
    TemplateConfig,
)

logger = logging.getLogger(__name__)

# 템플릿 디렉토리 경로
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")


class TemplateEngineService:
    """Jinja2 기반 템플릿 렌더링 서비스"""

    def __init__(self):
        self.env = Environment(
            loader=FileSystemLoader(TEMPLATE_DIR),
            autoescape=select_autoescape(["html"]),
            trim_blocks=True,
            lstrip_blocks=True,
        )

    def get_template_config(
        self,
        category: CategoryType,
        custom_palette: Optional[ColorPalette] = None,
        custom_sections: Optional[List[SectionConfig]] = None,
    ) -> TemplateConfig:
        """카테고리 기반 템플릿 설정 생성"""
        config = TemplateConfig.from_category(category, custom_palette)
        if custom_sections:
            config.sections = custom_sections
        return config

    def render_section(
        self,
        section_type: SectionType,
        copy: SectionCopy,
        palette: ColorPalette,
        config: TemplateConfig,
        image_urls: Optional[Dict[str, str]] = None,
    ) -> str:
        """단일 섹션 HTML 렌더링"""
        template_name = f"sections/{section_type.value}.html"

        try:
            template = self.env.get_template(template_name)
        except Exception:
            logger.warning(f"템플릿 '{template_name}'을 찾을 수 없습니다. 기본 렌더링 사용.")
            return self._fallback_render(section_type, copy, palette, config)

        context = {
            "copy": copy,
            "palette": palette,
            "config": config,
            "images": image_urls or {},
            "section_type": section_type.value,
        }

        html = template.render(**context)
        logger.info(f"섹션 {section_type.value} 렌더링 완료")
        return html

    def _fallback_render(
        self,
        section_type: SectionType,
        copy: SectionCopy,
        palette: ColorPalette,
        config: TemplateConfig,
    ) -> str:
        """템플릿 파일이 없을 경우 인라인 렌더링"""
        width = config.page_width
        font = config.font_family

        headline_html = ""
        if copy.headline:
            headline_html = f"""
            <h2 style="font-size:28px;font-weight:700;color:{palette.text_primary};
                        margin:0 0 12px 0;font-family:{font};">
                {copy.headline}
            </h2>"""

        subheadline_html = ""
        if copy.subheadline:
            subheadline_html = f"""
            <p style="font-size:16px;color:{palette.text_secondary};
                       margin:0 0 20px 0;font-family:{font};">
                {copy.subheadline}
            </p>"""

        body_html = ""
        if copy.body_text:
            paragraphs = copy.body_text.split("\n")
            body_html = "".join(
                f'<p style="font-size:15px;color:{palette.text_primary};'
                f'line-height:1.8;margin:0 0 12px 0;font-family:{font};">{p}</p>'
                for p in paragraphs
                if p.strip()
            )

        bullets_html = ""
        if copy.bullet_points:
            items = "".join(
                f'<li style="margin:0 0 8px 0;font-size:15px;color:{palette.text_primary};'
                f'font-family:{font};">{bp}</li>'
                for bp in copy.bullet_points
            )
            bullets_html = f'<ul style="padding-left:20px;margin:16px 0;">{items}</ul>'

        return f"""
        <div style="width:{width}px;margin:0 auto;padding:40px 30px;
                     box-sizing:border-box;background:{palette.background};">
            {headline_html}
            {subheadline_html}
            {body_html}
            {bullets_html}
        </div>
        """

    def render_all_sections(
        self,
        copies: List[SectionCopy],
        config: TemplateConfig,
        image_urls: Optional[Dict[str, str]] = None,
    ) -> List[SectionOutput]:
        """전체 섹션 렌더링 (순서 반영)"""
        copy_map: Dict[SectionType, SectionCopy] = {
            c.section_type: c for c in copies
        }

        outputs: List[SectionOutput] = []
        for section_cfg in sorted(config.sections, key=lambda s: s.order):
            if not section_cfg.enabled:
                continue

            copy = copy_map.get(section_cfg.section_type)
            if not copy:
                continue

            html = self.render_section(
                section_type=section_cfg.section_type,
                copy=copy,
                palette=config.palette,
                config=config,
                image_urls=image_urls,
            )
            outputs.append(
                SectionOutput(
                    section_type=section_cfg.section_type,
                    html=html,
                    order=section_cfg.order,
                )
            )

        return outputs

    def get_section_order(self, category: CategoryType) -> List[SectionType]:
        """카테고리별 기본 섹션 순서 반환"""
        return DEFAULT_SECTION_ORDER.get(
            category, DEFAULT_SECTION_ORDER[CategoryType.LIVING]
        )

    def get_color_palette(self, category: CategoryType) -> ColorPalette:
        """카테고리별 기본 색상 팔레트 반환"""
        return CATEGORY_PALETTES.get(
            category, CATEGORY_PALETTES[CategoryType.LIVING]
        )
