from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import limiter
from app.api import auth, marketplace, matching, intelligence, community, admin

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Agricultural Marketplace API",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Attach rate limiter state
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Too many requests. Rate limit exceeded. Please try again in a minute."
        },
    )


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Permissive for hackathon local dev; production uses settings.CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(marketplace.router, prefix=settings.API_V1_STR)
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(intelligence.router, prefix=settings.API_V1_STR)
app.include_router(community.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", include_in_schema=False)
async def root():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    from fastapi import Response
    return Response(content=b"", media_type="image/x-icon")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
