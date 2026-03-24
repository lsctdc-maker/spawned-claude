"""템플릿 관련 Pydantic 모델"""

from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field

from .product import CategoryType


class SectionType(str, Enum):
    """상세페이지 섹션 타입"""
    HERO = "hero"
    USP_POINTS = "usp_points"
    DETAIL_DESC = "detail_desc"
    COMPARISON = "comparison"
    HOWTO = "howto"
    CERTIFICATION = "certification"
    REVIEWS = "reviews"
    FAQ = "faq"
    CTA = "cta"


class ColorPalette(BaseModel):
    """색상 팔레트"""
    primary: str = Field(..., description="메인 컬러 (hex)")
    secondary: str = Field(..., description="보조 컬러 (hex)")
    accent: str = Field(..., description="강조 컬러 (hex)")
    background: str = Field(default="#FFFFFF", description="배경색 (hex)")
    text_primary: str = Field(default="#222222", description="주요 텍스트 색상")
    text_secondary: str = Field(default="#666666", description="보조 텍스트 색상")
    text_muted: str = Field(default="#999999", description="흐린 텍스트 색상")


# 카테고리별 기본 색상 팔레트
CATEGORY_PALETTES: Dict[CategoryType, ColorPalette] = {
    CategoryType.FOOD: ColorPalette(
        primary="#E8530E",
        secondary="#FF8C42",
        accent="#2D5016",
    ),
    CategoryType.COSMETICS: ColorPalette(
        primary="#C4577A",
        secondary="#E8A0BF",
        accent="#7B2D4E",
    ),
    CategoryType.HEALTH: ColorPalette(
        primary="#2E7D32",
        secondary="#66BB6A",
        accent="#1B5E20",
    ),
    CategoryType.ELECTRONICS: ColorPalette(
        primary="#1565C0",
        secondary="#42A5F5",
        accent="#0D47A1",
    ),
    CategoryType.FASHION: ColorPalette(
        primary="#212121",
        secondary="#616161",
        accent="#D4A574",
    ),
    CategoryType.LIVING: ColorPalette(
        primary="#5D4037",
        secondary="#8D6E63",
        accent="#3E2723",
    ),
}


class SectionConfig(BaseModel):
    """섹션 설정"""
    section_type: SectionType
    enabled: bool = Field(default=True, description="섹션 활성화 여부")
    order: int = Field(..., description="섹션 순서 (1부터 시작)")
    custom_title: Optional[str] = Field(None, description="커스텀 섹션 타이틀")


# 카테고리별 기본 섹션 순서
DEFAULT_SECTION_ORDER: Dict[CategoryType, List[SectionType]] = {
    CategoryType.FOOD: [
        SectionType.HERO,
        SectionType.USP_POINTS,
        SectionType.DETAIL_DESC,
        SectionType.CERTIFICATION,
        SectionType.HOWTO,
        SectionType.REVIEWS,
        SectionType.FAQ,
        SectionType.CTA,
    ],
    CategoryType.COSMETICS: [
        SectionType.HERO,
        SectionType.USP_POINTS,
        SectionType.DETAIL_DESC,
        SectionType.COMPARISON,
        SectionType.CERTIFICATION,
        SectionType.REVIEWS,
        SectionType.HOWTO,
        SectionType.FAQ,
        SectionType.CTA,
    ],
    CategoryType.HEALTH: [
        SectionType.HERO,
        SectionType.USP_POINTS,
        SectionType.CERTIFICATION,
        SectionType.DETAIL_DESC,
        SectionType.HOWTO,
        SectionType.COMPARISON,
        SectionType.REVIEWS,
        SectionType.FAQ,
        SectionType.CTA,
    ],
    CategoryType.ELECTRONICS: [
        SectionType.HERO,
        SectionType.USP_POINTS,
        SectionType.DETAIL_DESC,
        SectionType.COMPARISON,
        SectionType.HOWTO,
        SectionType.REVIEWS,
        SectionType.FAQ,
        SectionType.CTA,
    ],
    CategoryType.FASHION: [
        SectionType.HERO,
        SectionType.USP_POINTS,
        SectionType.DETAIL_DESC,
        SectionType.HOWTO,
        SectionType.REVIEWS,
        SectionType.FAQ,
        SectionType.CTA,
    ],
    CategoryType.LIVING: [
        SectionType.HERO,
        SectionType.USP_POINTS,
        SectionType.DETAIL_DESC,
        SectionType.HOWTO,
        SectionType.COMPARISON,
        SectionType.REVIEWS,
        SectionType.FAQ,
        SectionType.CTA,
    ],
}


class TemplateConfig(BaseModel):
    """템플릿 전체 설정"""
    category: CategoryType
    palette: ColorPalette
    sections: List[SectionConfig]
    page_width: int = Field(default=860, description="상세페이지 너비 (px)")
    font_family: str = Field(
        default="'Pretendard', 'Noto Sans KR', sans-serif",
        description="폰트 패밀리",
    )
    line_height: float = Field(default=1.6, description="줄 간격")

    @classmethod
    def from_category(cls, category: CategoryType, custom_palette: Optional[ColorPalette] = None) -> "TemplateConfig":
        """카테고리 기반 기본 템플릿 설정 생성"""
        palette = custom_palette or CATEGORY_PALETTES.get(
            category, CATEGORY_PALETTES[CategoryType.LIVING]
        )
        section_order = DEFAULT_SECTION_ORDER.get(
            category, DEFAULT_SECTION_ORDER[CategoryType.LIVING]
        )
        sections = [
            SectionConfig(section_type=st, order=idx + 1)
            for idx, st in enumerate(section_order)
        ]
        return cls(category=category, palette=palette, sections=sections)
