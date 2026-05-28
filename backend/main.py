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
    await init_db()
    logger.info("[startup] Database tables initialized")
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

# CORS — allow the Vite dev server to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
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
