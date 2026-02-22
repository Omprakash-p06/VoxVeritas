from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from src.core.logging import setup_logging
from src.api import health, document, qa, voice, safety, screen

def create_app() -> FastAPI:
    """Creates and configures the FastAPI application."""
    # Setup global logging
    setup_logging()

    app = FastAPI(
        title="VoxVeritas API",
        description="Backend API for VoxVeritas: A voice-first multilingual accessibility assistant",
        version="1.0.0",
    )

    # CORS — allow the Vite dev server and any localhost origin
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(health.router, tags=["Health"])
    app.include_router(document.router, tags=["Documents"])
    app.include_router(qa.router, tags=["QA"])
    app.include_router(voice.router, tags=["Voice"])
    app.include_router(safety.router, tags=["Safety"])
    app.include_router(screen.router, tags=["ScreenOCR"])

    @app.on_event("startup")
    async def startup_event():
        logger.info("VoxVeritas Application successfully started.")

    # Mount static files at the root (MUST be last so API routes take priority)
    import os
    os.makedirs("src/static", exist_ok=True)
    app.mount("/", StaticFiles(directory="src/static", html=True), name="static")

    return app

app = create_app()
