"""
Application configuration using pydantic-settings.
All secrets come from environment variables / .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./aromi.db"

    # Groq API (primary)
    GROQ_API_KEY: str = ""

    # Google Gemini (backup)
    GEMINI_API_KEY: str = ""

    # JWT
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"


settings = Settings()
