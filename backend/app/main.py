import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import limiter
from app.api import (
    auth,
    marketplace,
    matching,
    intelligence,
    community,
    admin,
    reliability,
    heatmap,
    agreements_expanded,
    verification,
    messaging,
    user_search,
)
from app.api.intelligence import refresh_live_prices


# ── Lifespan (replaces deprecated on_event) ──────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: kick off background price refresh
    task = asyncio.create_task(refresh_live_prices())
    yield
    # Shutdown: cancel background task gracefully
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


# ── App creation ──────────────────────────────────────────────────────
app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Agricultural Marketplace API",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Rate limiter ──────────────────────────────────────────────────────
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Too many requests. Rate limit exceeded. Please try again in a minute."
        },
    )


# ── Middleware ────────────────────────────────────────────────────────
# GZip compression for responses > 500 bytes — big speed win for JSON payloads
app.add_middleware(GZipMiddleware, minimum_size=500)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Permissive for hackathon local dev; production uses settings.CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Process-time header (lightweight profiling)
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    import time

    start = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{time.perf_counter() - start:.4f}"
    return response


# ── Routers ───────────────────────────────────────────────────────────
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(marketplace.router, prefix=settings.API_V1_STR)
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(intelligence.router, prefix=settings.API_V1_STR)
app.include_router(community.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(reliability.router, prefix=settings.API_V1_STR)
app.include_router(agreements_expanded.router, prefix=settings.API_V1_STR)
app.include_router(heatmap.router, prefix=settings.API_V1_STR)
app.include_router(verification.router, prefix=settings.API_V1_STR)
app.include_router(messaging.router, prefix=settings.API_V1_STR)
app.include_router(user_search.router, prefix=settings.API_V1_STR)


# ── Utility routes ────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
@app.get(f"{settings.API_V1_STR}/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content=b"", media_type="image/x-icon")


# ── CLI entry point ──────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
