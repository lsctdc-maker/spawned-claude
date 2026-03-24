"""FastAPI 메인 애플리케이션"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

from app.config import get_settings
from app.routers import product, interview, copywriting, image, export

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="한국형 상세페이지를 AI 기반으로 자동 생성하는 백엔드 서비스",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 설정
origins = settings.ALLOWED_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(product.router, prefix="/api/v1/products", tags=["상품 관리"])
app.include_router(interview.router, prefix="/api/v1/interview", tags=["AI 기획 인터뷰"])
app.include_router(copywriting.router, prefix="/api/v1/copywriting", tags=["카피라이팅"])
app.include_router(image.router, prefix="/api/v1/images", tags=["이미지 처리"])
app.include_router(export.router, prefix="/api/v1/export", tags=["내보내기"])

# 정적 파일 디렉토리 (생성된 이미지, HTML 등)
os.makedirs("static/generated", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", tags=["상태 확인"])
async def root():
    """API 서버 상태 확인"""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["상태 확인"])
async def health_check():
    """헬스체크 엔드포인트"""
    return {"status": "healthy"}


# 글로벌 예외 핸들러
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "error_type": "validation_error"},
    )


@app.exception_handler(FileNotFoundError)
async def not_found_handler(request: Request, exc: FileNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc), "error_type": "not_found"},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "내부 서버 오류가 발생했습니다.",
            "error_type": "internal_error",
        },
    )
