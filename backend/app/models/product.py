"""상품 관련 Pydantic 모델"""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class CategoryType(str, Enum):
    """상품 카테고리 타입"""
    FOOD = "food"
    COSMETICS = "cosmetics"
    HEALTH = "health"
    ELECTRONICS = "electronics"
    FASHION = "fashion"
    LIVING = "living"


class ToneStyle(str, Enum):
    """카피라이팅 톤앤매너"""
    TRUST = "trust"          # 신뢰감 (데이터, 인증 강조)
    EMOTIONAL = "emotional"  # 감성적 (스토리텔링, 공감)
    IMPACT = "impact"        # 임팩트 (강렬한 헤드카피, 숫자 강조)


class ProductInput(BaseModel):
    """상품 등록 입력 모델"""
    name: str = Field(..., min_length=1, max_length=200, description="상품명")
    category: CategoryType = Field(..., description="상품 카테고리")
    price_range: str = Field(..., description="가격대 (예: 10,000~30,000원)")
    features: str = Field(..., min_length=10, description="상품 특징 및 설명")
    target_customer: Optional[str] = Field(None, description="타겟 고객층")
    image_url: Optional[str] = Field(None, description="상품 대표 이미지 URL")
    brand_name: Optional[str] = Field(None, description="브랜드명")
    keywords: Optional[List[str]] = Field(default_factory=list, description="검색 키워드")


class USPItem(BaseModel):
    """USP(고유 판매 포인트) 항목"""
    title: str = Field(..., description="USP 제목 (짧고 임팩트 있게)")
    description: str = Field(..., description="USP 상세 설명")
    icon: str = Field(default="✅", description="아이콘 이모지 또는 아이콘 코드")


class InterviewQuestion(BaseModel):
    """AI 인터뷰 질문"""
    question_id: int = Field(..., description="질문 고유 ID")
    question_text: str = Field(..., description="질문 내용")
    category: CategoryType = Field(..., description="대상 카테고리")
    is_required: bool = Field(default=True, description="필수 여부")
    placeholder: Optional[str] = Field(None, description="답변 예시 placeholder")


class InterviewAnswer(BaseModel):
    """인터뷰 답변"""
    question_id: int = Field(..., description="질문 ID")
    answer: str = Field(..., min_length=1, description="답변 내용")


class InterviewSession(BaseModel):
    """인터뷰 세션"""
    product: ProductInput
    answers: List[InterviewAnswer] = Field(default_factory=list)
    usps: List[USPItem] = Field(default_factory=list)
    tone: ToneStyle = Field(default=ToneStyle.TRUST, description="카피 톤앤매너")


class ProductAnalysis(BaseModel):
    """상품 분석 결과"""
    product_name: str
    category: CategoryType
    usps: List[USPItem]
    target_audience: str
    tone_recommendation: ToneStyle
    key_benefits: List[str]
    emotional_hooks: List[str]
    trust_elements: List[str]
