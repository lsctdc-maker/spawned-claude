"""이미지 처리 API 라우터"""

import logging
from typing import Optional

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from app.services.image_processor import ImageProcessorService

logger = logging.getLogger(__name__)
router = APIRouter()

image_service = ImageProcessorService()


class CropRequest(BaseModel):
    """크롭 요청"""
    left: int = Field(ge=0)
    top: int = Field(ge=0)
    right: int = Field(gt=0)
    bottom: int = Field(gt=0)


class CompositeRequest(BaseModel):
    """합성 요청"""
    position_x: int = Field(default=0)
    position_y: int = Field(default=0)
    foreground_scale: float = Field(default=1.0, gt=0, le=3.0)


class HeroBannerRequest(BaseModel):
    """히어로 배너 생성 요청"""
    headline: str = Field(..., max_length=30)
    subheadline: str = Field(..., max_length=60)
    bg_color: str = Field(default="#FFFFFF")
    text_color: str = Field(default="#222222")
    width: int = Field(default=860)
    height: int = Field(default=500)


@router.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    """
    배경 제거 (누끼 추출)

    - rembg 기반 AI 배경 제거
    - PNG 형식으로 반환
    - 최대 10MB 이미지 지원
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")

    image_bytes = await file.read()

    try:
        result_bytes = await image_service.remove_background(image_bytes)
        saved_path = await image_service.save_image(result_bytes)
        logger.info(f"배경 제거 완료: {file.filename}")
        return {
            "filename": file.filename,
            "image_url": saved_path,
            "message": "배경이 제거되었습니다.",
        }
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Query(default=860, ge=100, le=2000),
    height: Optional[int] = Query(default=None, ge=100, le=3000),
    maintain_ratio: bool = Query(default=True),
):
    """
    이미지 리사이즈

    - 너비 기준 비율 유지 리사이즈
    - 또는 지정 크기로 강제 리사이즈
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")

    image_bytes = await file.read()

    try:
        result_bytes = await image_service.resize_image(
            image_bytes, width=width, height=height, maintain_ratio=maintain_ratio
        )
        saved_path = await image_service.save_image(result_bytes)
        return {
            "filename": file.filename,
            "image_url": saved_path,
            "width": width,
            "message": "리사이즈가 완료되었습니다.",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/crop")
async def crop_image(file: UploadFile = File(...), crop: CropRequest = None):
    """
    이미지 크롭

    - 좌표 기반 영역 크롭
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")

    if not crop:
        raise HTTPException(status_code=400, detail="크롭 영역을 지정해주세요.")

    image_bytes = await file.read()

    try:
        result_bytes = await image_service.crop_image(
            image_bytes,
            left=crop.left,
            top=crop.top,
            right=crop.right,
            bottom=crop.bottom,
        )
        saved_path = await image_service.save_image(result_bytes)
        return {
            "filename": file.filename,
            "image_url": saved_path,
            "message": "크롭이 완료되었습니다.",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/composite")
async def composite_images(
    background: UploadFile = File(...),
    foreground: UploadFile = File(...),
    position_x: int = Query(default=0),
    position_y: int = Query(default=0),
    foreground_scale: float = Query(default=1.0, gt=0, le=3.0),
):
    """
    이미지 합성

    - 배경 위에 전경 이미지를 합성
    - 위치와 크기 조절 가능
    """
    bg_bytes = await background.read()
    fg_bytes = await foreground.read()

    try:
        result_bytes = await image_service.composite_images(
            background_bytes=bg_bytes,
            foreground_bytes=fg_bytes,
            position=(position_x, position_y),
            foreground_scale=foreground_scale,
        )
        saved_path = await image_service.save_image(result_bytes)
        return {
            "image_url": saved_path,
            "message": "이미지 합성이 완료되었습니다.",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/hero-banner")
async def create_hero_banner(
    request: HeroBannerRequest,
    product_image: Optional[UploadFile] = File(None),
):
    """
    히어로 배너 자동 생성

    - 텍스트와 상품 이미지를 조합한 배너 생성
    - 860px 너비 최적화
    """
    product_image_bytes = None
    if product_image:
        product_image_bytes = await product_image.read()

    try:
        result_bytes = await image_service.create_hero_banner(
            product_image_bytes=product_image_bytes,
            headline=request.headline,
            subheadline=request.subheadline,
            bg_color=request.bg_color,
            text_color=request.text_color,
            width=request.width,
            height=request.height,
        )
        saved_path = await image_service.save_image(result_bytes)
        return {
            "image_url": saved_path,
            "width": request.width,
            "height": request.height,
            "message": "히어로 배너가 생성되었습니다.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/add-shadow")
async def add_shadow(
    file: UploadFile = File(...),
    offset: int = Query(default=10, ge=0, le=50),
    blur: int = Query(default=20, ge=0, le=50),
):
    """
    이미지에 그림자 효과 추가

    - 자연스러운 드롭 쉐도우 적용
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")

    image_bytes = await file.read()

    try:
        result_bytes = await image_service.add_shadow(
            image_bytes, offset=offset, blur=blur
        )
        saved_path = await image_service.save_image(result_bytes)
        return {
            "image_url": saved_path,
            "message": "그림자 효과가 추가되었습니다.",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
