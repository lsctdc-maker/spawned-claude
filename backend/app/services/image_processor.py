"""이미지 처리 서비스 - 누끼 추출, 합성, 리사이즈"""

import io
import logging
import os
import uuid
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from app.config import get_settings

logger = logging.getLogger(__name__)

# rembg는 선택적 import (무거운 패키지)
try:
    from rembg import remove as rembg_remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False
    logger.warning("rembg 패키지가 설치되지 않았습니다. 누끼 기능이 제한됩니다.")


class ImageProcessorService:
    """이미지 처리 서비스"""

    def __init__(self):
        settings = get_settings()
        self.output_width = settings.IMAGE_OUTPUT_WIDTH
        self.quality = settings.IMAGE_QUALITY
        self.max_size_mb = settings.MAX_IMAGE_SIZE_MB
        self.output_dir = Path("static/generated/images")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _generate_filename(self, suffix: str = ".png") -> str:
        """고유 파일명 생성"""
        return f"{uuid.uuid4().hex[:12]}{suffix}"

    def _validate_image_size(self, image_bytes: bytes) -> bool:
        """이미지 크기 검증"""
        size_mb = len(image_bytes) / (1024 * 1024)
        if size_mb > self.max_size_mb:
            raise ValueError(
                f"이미지 크기가 {self.max_size_mb}MB를 초과합니다. "
                f"(현재: {size_mb:.1f}MB)"
            )
        return True

    async def remove_background(self, image_bytes: bytes) -> bytes:
        """배경 제거 (누끼 추출)"""
        self._validate_image_size(image_bytes)

        if not REMBG_AVAILABLE:
            raise RuntimeError(
                "rembg 패키지가 설치되지 않았습니다. "
                "pip install rembg 로 설치해주세요."
            )

        try:
            result = rembg_remove(image_bytes)
            logger.info("배경 제거 완료")
            return result
        except Exception as e:
            logger.error(f"배경 제거 실패: {e}")
            raise ValueError(f"배경 제거 중 오류가 발생했습니다: {e}")

    async def resize_image(
        self,
        image_bytes: bytes,
        width: Optional[int] = None,
        height: Optional[int] = None,
        maintain_ratio: bool = True,
    ) -> bytes:
        """이미지 리사이즈"""
        self._validate_image_size(image_bytes)
        img = Image.open(io.BytesIO(image_bytes))
        target_width = width or self.output_width

        if maintain_ratio:
            ratio = target_width / img.width
            target_height = int(img.height * ratio)
        else:
            target_height = height or img.height

        resized = img.resize(
            (target_width, target_height), Image.Resampling.LANCZOS
        )

        output = io.BytesIO()
        fmt = "PNG" if img.mode == "RGBA" else "JPEG"
        if fmt == "JPEG":
            resized = resized.convert("RGB")
            resized.save(output, format=fmt, quality=self.quality)
        else:
            resized.save(output, format=fmt)

        logger.info(f"리사이즈 완료: {img.size} → {resized.size}")
        return output.getvalue()

    async def crop_image(
        self,
        image_bytes: bytes,
        left: int,
        top: int,
        right: int,
        bottom: int,
    ) -> bytes:
        """이미지 크롭"""
        self._validate_image_size(image_bytes)
        img = Image.open(io.BytesIO(image_bytes))
        cropped = img.crop((left, top, right, bottom))

        output = io.BytesIO()
        fmt = "PNG" if img.mode == "RGBA" else "JPEG"
        if fmt == "JPEG":
            cropped = cropped.convert("RGB")
        cropped.save(output, format=fmt, quality=self.quality)

        logger.info(f"크롭 완료: ({left},{top},{right},{bottom})")
        return output.getvalue()

    async def composite_images(
        self,
        background_bytes: bytes,
        foreground_bytes: bytes,
        position: Tuple[int, int] = (0, 0),
        foreground_scale: float = 1.0,
    ) -> bytes:
        """이미지 합성 (전경을 배경 위에 합성)"""
        bg = Image.open(io.BytesIO(background_bytes)).convert("RGBA")
        fg = Image.open(io.BytesIO(foreground_bytes)).convert("RGBA")

        if foreground_scale != 1.0:
            new_w = int(fg.width * foreground_scale)
            new_h = int(fg.height * foreground_scale)
            fg = fg.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # 합성
        composite = Image.new("RGBA", bg.size, (0, 0, 0, 0))
        composite.paste(bg, (0, 0))
        composite.paste(fg, position, mask=fg)

        output = io.BytesIO()
        composite.save(output, format="PNG")
        logger.info(f"이미지 합성 완료: position={position}, scale={foreground_scale}")
        return output.getvalue()

    async def create_hero_banner(
        self,
        product_image_bytes: Optional[bytes],
        headline: str,
        subheadline: str,
        bg_color: str = "#FFFFFF",
        text_color: str = "#222222",
        width: int = 860,
        height: int = 500,
    ) -> bytes:
        """히어로 배너 자동 생성"""
        # 배경 생성
        bg = Image.new("RGB", (width, height), bg_color)
        draw = ImageDraw.Draw(bg)

        # 폰트 (시스템 기본 폰트 사용)
        try:
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
            font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        except OSError:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()

        # 텍스트 영역 (왼쪽)
        text_x = 60
        text_y_start = height // 3

        draw.text(
            (text_x, text_y_start),
            headline,
            fill=text_color,
            font=font_large,
        )
        draw.text(
            (text_x, text_y_start + 60),
            subheadline,
            fill="#666666",
            font=font_medium,
        )

        # 상품 이미지가 있으면 오른쪽에 배치
        if product_image_bytes:
            try:
                product_img = Image.open(io.BytesIO(product_image_bytes)).convert("RGBA")
                max_h = int(height * 0.7)
                ratio = max_h / product_img.height
                new_w = int(product_img.width * ratio)
                product_img = product_img.resize(
                    (new_w, max_h), Image.Resampling.LANCZOS
                )
                x_pos = width - new_w - 40
                y_pos = (height - max_h) // 2
                bg.paste(
                    product_img,
                    (x_pos, y_pos),
                    mask=product_img if product_img.mode == "RGBA" else None,
                )
            except Exception as e:
                logger.warning(f"상품 이미지 배치 실패: {e}")

        output = io.BytesIO()
        bg.save(output, format="JPEG", quality=self.quality)
        logger.info("히어로 배너 생성 완료")
        return output.getvalue()

    async def save_image(self, image_bytes: bytes, filename: Optional[str] = None) -> str:
        """이미지를 파일로 저장하고 경로 반환"""
        if not filename:
            # 이미지 포맷 감지
            img = Image.open(io.BytesIO(image_bytes))
            ext = ".png" if img.mode == "RGBA" else ".jpg"
            filename = self._generate_filename(ext)

        filepath = self.output_dir / filename
        with open(filepath, "wb") as f:
            f.write(image_bytes)

        relative_path = f"/static/generated/images/{filename}"
        logger.info(f"이미지 저장: {relative_path}")
        return relative_path

    async def add_shadow(self, image_bytes: bytes, offset: int = 10, blur: int = 20) -> bytes:
        """이미지에 그림자 효과 추가"""
        img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

        # 그림자 레이어 생성
        shadow_size = (img.width + blur * 2, img.height + blur * 2)
        shadow = Image.new("RGBA", shadow_size, (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.rectangle(
            [blur, blur, blur + img.width, blur + img.height],
            fill=(0, 0, 0, 80),
        )
        shadow = shadow.filter(ImageFilter.GaussianBlur(blur))

        # 합성
        result_size = (img.width + blur * 2 + offset, img.height + blur * 2 + offset)
        result = Image.new("RGBA", result_size, (0, 0, 0, 0))
        result.paste(shadow, (offset, offset), shadow)
        result.paste(img, (0, 0), img)

        output = io.BytesIO()
        result.save(output, format="PNG")
        return output.getvalue()
