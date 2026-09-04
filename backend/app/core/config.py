import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application Info
    APP_NAME: str = os.getenv("APP_NAME", "Farm-Nex")
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Security & Auth
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", "farm-nex-sih2026-super-secure-jwt-secret-key-32chars"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = "60/minute"
    RATE_LIMIT_AUTH: str = "10/minute"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://farm-nex.vercel.app",
    ]

    # Weight settings for matching service
    MATCHING_WEIGHTS: dict = {
        "net_realization": 0.45,
        "price": 0.20,
        "distance": 0.15,
        "quantity": 0.08,
        "quality": 0.05,
        "reliability": 0.05,
        "availability": 0.02,
    }

    # Logistics Freight Rate Settings (INR per km per quintal)
    # 1 tonne = 10 quintals. Base rate ~ ₹3.50/tonne-km -> ₹0.35/quintal-km
    FREIGHT_BASE_RATE_PER_QUINTAL_KM: float = 0.35
    FREIGHT_MIN_CHARGE: float = 250.0  # Minimum base freight cost in INR
    PLATFORM_FEE_PERCENTAGE: float = 0.015  # 1.5% transparent platform facilitation fee

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
