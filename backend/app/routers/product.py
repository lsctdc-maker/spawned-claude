"""상품 등록 및 관리 API 라우터"""

import logging
from typing import Dict, List
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.models.product import (
    CategoryType,
    InterviewSession,
    ProductAnalysis,
    ProductInput,
)
from app.services.ai_planner import AIPlannerService

logger = logging.getLogger(__name__)
router = APIRouter()

# 인메모리 저장소 (프로토타입용, 추후 DB로 교체)
_products: Dict[str, ProductInput] = {}
_sessions: Dict[str, InterviewSession] = {}

planner = AIPlannerService()


@router.post("/register", response_model=Dict)
async def register_product(product: ProductInput):
    """
    새 상품을 등록하고 인터뷰 세션을 생성합니다.

    - 상품 정보를 저장하고 고유 ID 발급
    - 해당 카테고리의 인터뷰 세션 자동 생성
    """
    product_id = uuid4().hex[:8]
    _products[product_id] = product

    session = planner.create_session(product)
    _sessions[product_id] = session

    logger.info(f"상품 등록: {product.name} (ID: {product_id})")

    return {
        "product_id": product_id,
        "product_name": product.name,
        "category": product.category.value,
        "message": "상품이 등록되었습니다. 인터뷰를 시작해주세요.",
    }


@router.get("/{product_id}", response_model=Dict)
async def get_product(product_id: str):
    """상품 정보 조회"""
    product = _products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    return {
        "product_id": product_id,
        "product": product.model_dump(),
    }


@router.get("/", response_model=Dict)
async def list_products():
    """등록된 전체 상품 목록 조회"""
    items = [
        {"product_id": pid, "name": p.name, "category": p.category.value}
        for pid, p in _products.items()
    ]
    return {"total": len(items), "products": items}


@router.delete("/{product_id}", response_model=Dict)
async def delete_product(product_id: str):
    """상품 삭제"""
    if product_id not in _products:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
    product_name = _products[product_id].name
    del _products[product_id]
    _sessions.pop(product_id, None)
    logger.info(f"상품 삭제: {product_name} (ID: {product_id})")
    return {"message": f"'{product_name}' 상품이 삭제되었습니다."}


@router.post("/{product_id}/analyze", response_model=ProductAnalysis)
async def analyze_product(product_id: str):
    """
    등록된 상품의 종합 분석 수행

    - 인터뷰 답변 기반 USP 추출
    - 최적 톤앤매너 추천
    - 핵심 혜택 및 감성 포인트 분석
    """
    product = _products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    session = _sessions.get(product_id)
    answers = session.answers if session else []

    analysis = await planner.analyze_product(product, answers)
    logger.info(f"상품 분석 완료: {product.name}")
    return analysis


@router.get("/categories/list", response_model=Dict)
async def list_categories():
    """지원하는 상품 카테고리 목록"""
    categories = [
        {"value": c.value, "label": _category_labels[c]}
        for c in CategoryType
    ]
    return {"categories": categories}


_category_labels = {
    CategoryType.FOOD: "식품",
    CategoryType.COSMETICS: "화장품",
    CategoryType.HEALTH: "건강기능식품",
    CategoryType.ELECTRONICS: "가전/전자",
    CategoryType.FASHION: "패션",
    CategoryType.LIVING: "생활용품",
}
