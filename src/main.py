from fastapi import FastAPI
from loguru import logger

from src.core.logging import setup_logging
from src.api import health

def create_app() -> FastAPI:
    """Creates and configures the FastAPI application."""
    # Setup global logging
    setup_logging()

    app = FastAPI(
        title="VoxVeritas API",
        description="Backend API for VoxVeritas: A voice-first multilingual accessibility assistant",
        version="1.0.0",
    )

    # Include routers
    app.include_router(health.router, tags=["Health"])

    @app.on_event("startup")
    async def startup_event():
        logger.info("VoxVeritas Application successfully started.")

    return app

app = create_app()
