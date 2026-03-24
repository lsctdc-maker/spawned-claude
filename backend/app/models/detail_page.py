"""상세페이지 관련 Pydantic 모델"""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field

from .product import CategoryType, InterviewAnswer, ProductInput, ToneStyle, USPItem
from .template import SectionType, TemplateConfig


class SectionCopy(BaseModel):
    """섹션별 카피라이팅 결과"""
    section_type: SectionType
    headline: Optional[str] = Field(None, description="섹션 헤드라인")
    subheadline: Optional[str] = Field(None, description="섹션 서브 헤드라인")
    body_text: Optional[str] = Field(None, description="본문 텍스트")
    bullet_points: List[str] = Field(default_factory=list, description="불릿 포인트 목록")
    cta_text: Optional[str] = Field(None, description="CTA 버튼 텍스트")
    extra_data: Dict = Field(default_factory=dict, description="섹션별 추가 데이터")


class SectionOutput(BaseModel):
    """섹션 렌더링 결과"""
    section_type: SectionType
    html: str = Field(..., description="렌더링된 HTML")
    order: int = Field(..., description="섹션 순서")


class CopywritingResult(BaseModel):
    """카피라이팅 전체 결과"""
    product_name: str
    category: CategoryType
    tone: ToneStyle
    sections: List[SectionCopy]
    created_at: datetime = Field(default_factory=datetime.now)


class PageBuildRequest(BaseModel):
    """상세페이지 빌드 요청"""
    product: ProductInput
    answers: List[InterviewAnswer] = Field(default_factory=list)
    usps: List[USPItem] = Field(default_factory=list)
    tone: ToneStyle = Field(default=ToneStyle.TRUST)
    template_config: Optional[TemplateConfig] = Field(None, description="커스텀 템플릿 설정")


class DetailPageOutput(BaseModel):
    """상세페이지 최종 결과물"""
    product_name: str
    category: CategoryType
    html: str = Field(..., description="완성된 HTML 전문")
    sections: List[SectionOutput] = Field(default_factory=list)
    copywriting: Optional[CopywritingResult] = None
    image_urls: List[str] = Field(default_factory=list, description="사용된 이미지 URL 목록")
    created_at: datetime = Field(default_factory=datetime.now)
    page_width: int = Field(default=860)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
