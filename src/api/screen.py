import os
import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from src.services.screen_reader import get_screen_reader_service

router = APIRouter()


class ScreenOCRResponse(BaseModel):
    status: str
    engine: str
    text: str
    chars: int


TEMP_UPLOAD_DIR = ".data/temp_image"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)


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


@router.post("/screen/ocr/upload", response_model=ScreenOCRResponse, summary="Run OCR on an uploaded screenshot")
async def screen_ocr_upload(file: UploadFile = File(...)) -> ScreenOCRResponse:
    content_type = (file.content_type or "").lower()
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    service = get_screen_reader_service()
    engine = service.get_engine_name()

    temp_path = os.path.join(TEMP_UPLOAD_DIR, f"uploaded_{file.filename or 'screen.png'}")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = service.read_image_file(temp_path)
        if not text:
            raise HTTPException(
                status_code=503,
                detail=f"OCR returned no text from uploaded screenshot. Active engine: {engine}.",
            )

        return ScreenOCRResponse(
            status="success",
            engine=engine,
            text=text,
            chars=len(text),
        )
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@router.post("/screen/ocr", response_model=ScreenOCRResponse, summary="(Legacy) Run OCR on an uploaded screenshot")
async def screen_ocr_upload_legacy(file: UploadFile = File(...)) -> ScreenOCRResponse:
    return await screen_ocr_upload(file)
