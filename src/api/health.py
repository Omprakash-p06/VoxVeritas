from fastapi import APIRouter
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    version: str

router = APIRouter()

@router.get("/health", response_model=HealthResponse, summary="Check system health")
async def check_health() -> HealthResponse:
    """Returns the basic health status of the application."""
    return HealthResponse(status="ok", version="1.0.0")
