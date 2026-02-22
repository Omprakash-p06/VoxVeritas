from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.services.screen_reader import get_screen_reader_service

router = APIRouter()


class ScreenOCRResponse(BaseModel):
    status: str
    engine: str
    text: str
    chars: int


@router.get("/screen/ocr", response_model=ScreenOCRResponse, summary="Capture current screen and run OCR")
async def screen_ocr() -> ScreenOCRResponse:
    service = get_screen_reader_service()
    text = service.capture_and_read_screen()
    engine = service.get_engine_name()

    if not text:
        raise HTTPException(
            status_code=503,
            detail=f"Screen OCR returned no text. Active engine: {engine}. Ensure screen content is visible and OCR dependencies are installed.",
        )

    return ScreenOCRResponse(
        status="success",
        engine=engine,
        text=text,
        chars=len(text),
    )
