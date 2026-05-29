"""
AroMi FastAPI application entry point.
Mounts all routers, configures CORS, rate limiting, and creates DB tables on startup.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import settings
from database import init_db
from routers import auth, chat, profile, progress
from routers.history import router as history_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all DB tables on startup (dev mode — use Alembic in production)."""
    try:
        await init_db()
        logger.info("[startup] Database tables initialized successfully")
    except Exception as e:
        logger.error(f"[startup] Database initialization failed: {e}")
        logger.error(f"[startup] DATABASE_URL may be incorrect — check environment variables")
        # Don't crash — let the app start so we can see health check
    yield
    logger.info("[shutdown] AroMi backend shutting down")


app = FastAPI(
    title="AroMi API",
    description="AI-powered health and wellness coach",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting — register the limiter's exception handler
app.state.limiter = chat.limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — allow frontend origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Add production frontend URL if set
if settings.FRONTEND_URL and settings.FRONTEND_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(profile.router)
app.include_router(progress.router)
app.include_router(history_router)


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint — returns 200 when the server is running."""
    return {"status": "ok", "service": "AroMi API"}


@app.get("/debug-env", tags=["debug"])
async def debug_env():
    """Temporary debug endpoint — shows environment variable status."""
    import os
    db_url = os.getenv("DATABASE_URL", "NOT SET")
    # Hide password for security
    if db_url and "@" in db_url:
        parts = db_url.split("@")
        hidden = parts[0].split(":")
        hidden[-1] = "****"
        db_url_safe = ":".join(hidden) + "@" + parts[1]
    else:
        db_url_safe = db_url
    
    return {
        "DATABASE_URL": db_url_safe,
        "GROQ_API_KEY": "SET" if os.getenv("GROQ_API_KEY") else "NOT SET",
        "JWT_SECRET": "SET" if os.getenv("JWT_SECRET") else "NOT SET",
        "FRONTEND_URL": os.getenv("FRONTEND_URL", "NOT SET"),
        "python_version": __import__("sys").version,
    }