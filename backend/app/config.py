"""환경변수 및 API 키 설정 모듈"""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # API Keys
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Database
    DATABASE_URL: str = "sqlite:///./detailpage.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # AWS S3
    AWS_ACCESS_KEY: str = ""
    AWS_SECRET_KEY: str = ""
    AWS_REGION: str = "ap-northeast-2"
    S3_BUCKET: str = "detailpage-images"

    # App Settings
    APP_NAME: str = "한국형 상세페이지 자동 생성 서비스"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # Claude Model
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    CLAUDE_MAX_TOKENS: int = 4096

    # Image Processing
    MAX_IMAGE_SIZE_MB: int = 10
    IMAGE_OUTPUT_WIDTH: int = 860
    IMAGE_QUALITY: int = 90

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """설정 싱글턴 반환"""
    return Settings()
