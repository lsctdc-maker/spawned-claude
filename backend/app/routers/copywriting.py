"""카피라이팅 생성 API 라우터"""

import logging
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.detail_page import CopywritingResult, SectionCopy
from app.models.product import InterviewAnswer, ToneStyle, USPItem
from app.models.template import SectionType, TemplateConfig
from app.services.copywriter import CopywriterService

logger = logging.getLogger(__name__)
router = APIRouter()

copywriter = CopywriterService()

from app.routers.product import _products, _sessions


class GenerateCopyRequest(BaseModel):
    """카피라이팅 생성 요청"""
    tone: ToneStyle = Field(default=ToneStyle.TRUST)
    sections: Optional[List[SectionType]] = Field(
        None, description="생성할 섹션 목록 (미지정 시 카테고리 기본값)"
    )


class GenerateSectionCopyRequest(BaseModel):
    """단일 섹션 카피 생성 요청"""
    section_type: SectionType
    tone: ToneStyle = Field(default=ToneStyle.TRUST)
    additional_context: Optional[str] = Field(None, description="추가 맥락 정보")


class RegenerateCopyRequest(BaseModel):
    """카피 재생성 요청"""
    section_type: SectionType
    tone: ToneStyle = Field(default=ToneStyle.TRUST)
    feedback: Optional[str] = Field(None, description="이전 카피에 대한 피드백")


@router.post("/{product_id}/generate", response_model=Dict)
async def generate_all_copies(product_id: str, request: GenerateCopyRequest):
    """
    전체 섹션 카피라이팅 일괄 생성

    - 인터뷰 답변과 USP를 기반으로 모든 섹션의 카피 생성
    - 톤앤매너에 맞게 작성
    - Claude API를 통한 전문 카피라이팅
    """
    product = _products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    session = _sessions.get(product_id)
    answers = session.answers if session else []
    usps = session.usps if session else []

    # 섹션 타입 결정
    if request.sections:
        section_types = request.sections
    else:
        config = TemplateConfig.from_category(product.category)
        section_types = [sc.section_type for sc in config.sections if sc.enabled]

    result = await copywriter.generate_all_copies(
        product=product,
        answers=answers,
        usps=usps,
        tone=request.tone,
        section_types=section_types,
    )

    logger.info(
        f"카피라이팅 생성 완료: {product.name}, "
        f"{len(result.sections)}개 섹션"
    )

    return {
        "product_id": product_id,
        "product_name": result.product_name,
        "tone": result.tone.value,
        "sections": [s.model_dump() for s in result.sections],
        "total_sections": len(result.sections),
    }


@router.post("/{product_id}/generate-section", response_model=Dict)
async def generate_section_copy(
    product_id: str, request: GenerateSectionCopyRequest
):
    """
    단일 섹션 카피 생성

    - 특정 섹션만 선택적으로 카피 생성
    - 추가 맥락 정보 반영 가능
    """
    product = _products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    session = _sessions.get(product_id)
    answers = session.answers if session else []
    usps = session.usps if session else []

    copy = await copywriter.generate_section_copy(
        section_type=request.section_type,
        product=product,
        answers=answers,
        usps=usps,
        tone=request.tone,
    )

    logger.info(f"섹션 카피 생성: {request.section_type.value}")

    return {
        "product_id": product_id,
        "section": copy.model_dump(),
    }


@router.post("/{product_id}/regenerate", response_model=Dict)
async def regenerate_copy(product_id: str, request: RegenerateCopyRequest):
    """
    섹션 카피 재생성 (피드백 반영)

    - 이전 카피에 대한 피드백을 반영하여 재생성
    - 동일한 상품/인터뷰 데이터 사용
    """
    product = _products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    session = _sessions.get(product_id)
    answers = session.answers if session else []
    usps = session.usps if session else []

    # 피드백이 있으면 features에 임시 추가 (컨텍스트로 전달)
    if request.feedback:
        original_features = product.features
        product.features = (
            f"{product.features}\n\n[재생성 피드백] {request.feedback}"
        )

    copy = await copywriter.generate_section_copy(
        section_type=request.section_type,
        product=product,
        answers=answers,
        usps=usps,
        tone=request.tone,
    )

    # features 원복
    if request.feedback:
        product.features = original_features

    logger.info(f"섹션 카피 재생성: {request.section_type.value}")

    return {
        "product_id": product_id,
        "section": copy.model_dump(),
        "regenerated": True,
    }


@router.get("/tones/list", response_model=Dict)
async def list_tones():
    """사용 가능한 톤앤매너 목록"""
    tones = [
        {
            "value": ToneStyle.TRUST.value,
            "label": "신뢰감",
            "description": "데이터, 인증, 전문가 추천 등 객관적 근거를 강조하는 톤",
        },
        {
            "value": ToneStyle.EMOTIONAL.value,
            "label": "감성적",
            "description": "스토리텔링과 공감, 감성적 표현을 중심으로 한 톤",
        },
        {
            "value": ToneStyle.IMPACT.value,
            "label": "임팩트",
            "description": "강렬한 숫자, 비교 표현, 긴급성을 강조하는 톤",
        },
    ]
    return {"tones": tones}
