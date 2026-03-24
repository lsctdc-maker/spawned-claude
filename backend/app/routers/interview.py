"""AI 기획 인터뷰 API 라우터"""

import logging
from typing import Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.product import (
    CategoryType,
    InterviewAnswer,
    InterviewQuestion,
    ToneStyle,
    USPItem,
)
from app.services.ai_planner import AIPlannerService

logger = logging.getLogger(__name__)
router = APIRouter()

planner = AIPlannerService()

# product 라우터의 인메모리 저장소 참조
from app.routers.product import _products, _sessions


class SubmitAnswersRequest(BaseModel):
    """인터뷰 답변 제출 요청"""
    answers: List[InterviewAnswer] = Field(..., min_length=1)
    tone: ToneStyle = Field(default=ToneStyle.TRUST)


class ExtractUSPRequest(BaseModel):
    """USP 추출 요청"""
    answers: List[InterviewAnswer] = Field(default_factory=list)


@router.get("/{product_id}/questions", response_model=Dict)
async def get_interview_questions(product_id: str):
    """
    상품 카테고리에 맞는 인터뷰 질문 목록 반환

    - 카테고리별로 최적화된 6개의 질문 제공
    - 각 질문에 답변 예시(placeholder) 포함
    """
    product = _products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    questions = planner.get_interview_questions(product.category)

    return {
        "product_id": product_id,
        "product_name": product.name,
        "category": product.category.value,
        "questions": [q.model_dump() for q in questions],
        "total_questions": len(questions),
    }


@router.post("/{product_id}/submit", response_model=Dict)
async def submit_answers(product_id: str, request: SubmitAnswersRequest):
    """
    인터뷰 답변을 제출하고 세션에 저장

    - 답변을 세션에 저장
    - 톤앤매너 설정 반영
    - 답변 기반 USP 자동 추출
    """
    product = _products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    session = _sessions.get(product_id)
    if not session:
        raise HTTPException(status_code=404, detail="인터뷰 세션을 찾을 수 없습니다.")

    # 답변 저장
    session.answers = request.answers
    session.tone = request.tone

    # USP 자동 추출
    usps = await planner.extract_usps(product, request.answers)
    session.usps = usps

    logger.info(
        f"인터뷰 답변 제출: {product.name}, "
        f"답변 {len(request.answers)}개, USP {len(usps)}개 추출"
    )

    return {
        "product_id": product_id,
        "message": "답변이 저장되었습니다.",
        "answers_count": len(request.answers),
        "tone": request.tone.value,
        "usps": [u.model_dump() for u in usps],
    }


@router.post("/{product_id}/extract-usp", response_model=Dict)
async def extract_usp(product_id: str, request: ExtractUSPRequest):
    """
    인터뷰 답변 기반 USP 추출 (별도 호출)

    - 기존 세션 답변 또는 새 답변으로 USP 추출
    - Claude API를 통한 심층 분석
    """
    product = _products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    session = _sessions.get(product_id)
    answers = request.answers
    if not answers and session:
        answers = session.answers

    if not answers:
        raise HTTPException(
            status_code=400,
            detail="USP 추출을 위한 인터뷰 답변이 필요합니다.",
        )

    usps = await planner.extract_usps(product, answers)

    # 세션에도 저장
    if session:
        session.usps = usps

    return {
        "product_id": product_id,
        "product_name": product.name,
        "usps": [u.model_dump() for u in usps],
        "total": len(usps),
    }


@router.get("/{product_id}/session", response_model=Dict)
async def get_session(product_id: str):
    """현재 인터뷰 세션 상태 조회"""
    if product_id not in _products:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    session = _sessions.get(product_id)
    if not session:
        raise HTTPException(status_code=404, detail="인터뷰 세션을 찾을 수 없습니다.")

    return {
        "product_id": product_id,
        "product_name": session.product.name,
        "answers_count": len(session.answers),
        "usps_count": len(session.usps),
        "tone": session.tone.value,
        "usps": [u.model_dump() for u in session.usps],
        "has_completed_interview": len(session.answers) > 0,
    }
