"""상세페이지 내보내기 API 라우터"""

import logging
import os
import uuid
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field

from app.models.detail_page import DetailPageOutput, PageBuildRequest
from app.models.product import InterviewAnswer, ToneStyle, USPItem
from app.models.template import TemplateConfig
from app.services.page_builder import PageBuilderService

logger = logging.getLogger(__name__)
router = APIRouter()

page_builder = PageBuilderService()

from app.routers.product import _products, _sessions

# 생성된 페이지 저장소
_generated_pages: Dict[str, DetailPageOutput] = {}

OUTPUT_DIR = Path("static/generated/pages")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class BuildPageRequest(BaseModel):
    """상세페이지 빌드 요청"""
    tone: ToneStyle = Field(default=ToneStyle.TRUST)
    usps: Optional[List[USPItem]] = Field(None, description="커스텀 USP (미지정 시 자동 추출)")


class BuildSectionRequest(BaseModel):
    """단일 섹션 빌드 요청"""
    section_type: str = Field(..., description="섹션 타입")
    tone: ToneStyle = Field(default=ToneStyle.TRUST)


@router.post("/{product_id}/build", response_model=Dict)
async def build_detail_page(product_id: str, request: BuildPageRequest):
    """
    상세페이지 전체 빌드

    전체 프로세스:
    1. USP 추출 (인터뷰 기반)
    2. 섹션별 카피라이팅 생성 (Claude API)
    3. HTML 템플릿 렌더링
    4. 전체 페이지 조립

    빌드 완료 후 미리보기 URL과 다운로드 URL을 반환합니다.
    """
    product = _products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")

    session = _sessions.get(product_id)
    answers = session.answers if session else []
    usps = request.usps or (session.usps if session else [])

    build_request = PageBuildRequest(
        product=product,
        answers=answers,
        usps=usps,
        tone=request.tone,
    )

    try:
        result = await page_builder.build_page(build_request)
    except Exception as e:
        logger.error(f"상세페이지 빌드 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"상세페이지 빌드 중 오류가 발생했습니다: {str(e)}",
        )

    # HTML 파일 저장
    page_id = uuid.uuid4().hex[:8]
    filename = f"{product_id}_{page_id}.html"
    filepath = OUTPUT_DIR / filename

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(result.html)

    _generated_pages[page_id] = result

    logger.info(f"상세페이지 빌드 완료: {product.name} (Page ID: {page_id})")

    return {
        "page_id": page_id,
        "product_id": product_id,
        "product_name": product.name,
        "preview_url": f"/api/v1/export/{page_id}/preview",
        "download_url": f"/api/v1/export/{page_id}/download",
        "html_url": f"/static/generated/pages/{filename}",
        "sections_count": len(result.sections),
        "message": "상세페이지가 성공적으로 생성되었습니다.",
    }


@router.get("/{page_id}/preview", response_class=HTMLResponse)
async def preview_page(page_id: str):
    """
    생성된 상세페이지 미리보기 (HTML 렌더링)
    """
    page = _generated_pages.get(page_id)
    if not page:
        # 파일에서 로드 시도
        for fpath in OUTPUT_DIR.glob(f"*_{page_id}.html"):
            with open(fpath, "r", encoding="utf-8") as f:
                return HTMLResponse(content=f.read())
        raise HTTPException(status_code=404, detail="페이지를 찾을 수 없습니다.")

    return HTMLResponse(content=page.html)


@router.get("/{page_id}/download")
async def download_page(page_id: str):
    """
    생성된 상세페이지 HTML 파일 다운로드
    """
    for fpath in OUTPUT_DIR.glob(f"*_{page_id}.html"):
        return FileResponse(
            path=str(fpath),
            filename=fpath.name,
            media_type="text/html",
        )
    raise HTTPException(status_code=404, detail="페이지 파일을 찾을 수 없습니다.")


@router.get("/{page_id}/sections", response_model=Dict)
async def get_page_sections(page_id: str):
    """
    생성된 페이지의 섹션별 HTML 조회
    """
    page = _generated_pages.get(page_id)
    if not page:
        raise HTTPException(status_code=404, detail="페이지를 찾을 수 없습니다.")

    return {
        "page_id": page_id,
        "product_name": page.product_name,
        "sections": [
            {
                "section_type": s.section_type.value,
                "order": s.order,
                "html": s.html,
            }
            for s in sorted(page.sections, key=lambda x: x.order)
        ],
    }


@router.get("/{page_id}/copywriting", response_model=Dict)
async def get_page_copywriting(page_id: str):
    """
    생성된 페이지의 카피라이팅 결과 조회
    """
    page = _generated_pages.get(page_id)
    if not page:
        raise HTTPException(status_code=404, detail="페이지를 찾을 수 없습니다.")

    if not page.copywriting:
        raise HTTPException(
            status_code=404, detail="카피라이팅 결과를 찾을 수 없습니다."
        )

    return {
        "page_id": page_id,
        "product_name": page.copywriting.product_name,
        "tone": page.copywriting.tone.value,
        "sections": [s.model_dump() for s in page.copywriting.sections],
    }


@router.get("/pages/list", response_model=Dict)
async def list_generated_pages():
    """생성된 전체 페이지 목록"""
    pages = [
        {
            "page_id": pid,
            "product_name": p.product_name,
            "category": p.category.value,
            "created_at": p.created_at.isoformat(),
            "preview_url": f"/api/v1/export/{pid}/preview",
        }
        for pid, p in _generated_pages.items()
    ]
    return {"total": len(pages), "pages": pages}


@router.delete("/{page_id}", response_model=Dict)
async def delete_page(page_id: str):
    """생성된 페이지 삭제"""
    if page_id not in _generated_pages:
        raise HTTPException(status_code=404, detail="페이지를 찾을 수 없습니다.")

    page = _generated_pages.pop(page_id)

    # 파일도 삭제
    for fpath in OUTPUT_DIR.glob(f"*_{page_id}.html"):
        fpath.unlink(missing_ok=True)

    return {"message": f"'{page.product_name}' 상세페이지가 삭제되었습니다."}
