from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from loguru import logger
import torch

class ModelsStatus(BaseModel):
    llm: str
    llm_loaded: bool
    llm_backend: str
    stt: str
    stt_loaded: bool
    tts: str
    tts_loaded: bool
    embedder: str
    embedder_loaded: bool

class VectorStoreStatus(BaseModel):
    connected: bool
    document_count: int
    chunk_count: int

class GpuStatus(BaseModel):
    vram_used_mb: float
    vram_total_mb: float
    device: str

class HealthResponse(BaseModel):
    status: str
    version: str
    models: ModelsStatus
    vector_store: VectorStoreStatus
    gpu: GpuStatus

router = APIRouter()

@router.get("/health", response_model=HealthResponse, summary="Check system health")
async def check_health() -> HealthResponse:
    """Returns detailed health status of the application."""

    # --- Models ---
    try:
        from src.services.llm_service import _instance as _llm_instance
        from src.services.stt_service import STTService
        from src.services.tts_service import TTSService

        _stt_instance = getattr(STTService, "_instance", None)
        _tts_instance = getattr(TTSService, "_instance", None)

        llm_loaded = _llm_instance is not None and getattr(_llm_instance, "llm", None) is not None
        llm_info = _llm_instance.get_current_model_info() if llm_loaded else {}
        active_llm_name = llm_info.get('name', 'None') if llm_loaded else "None"
        active_llm_backend = llm_info.get('compute_backend', 'cpu') if llm_loaded else "cpu"

        models = ModelsStatus(
            llm=active_llm_name,
            llm_loaded=llm_loaded,
            llm_backend=active_llm_backend,
            stt="openai/whisper-base",
            stt_loaded=_stt_instance is not None and getattr(_stt_instance, "model", None) is not None,
            tts="kokoro-tts",
            tts_loaded=_tts_instance is not None and getattr(_tts_instance, "pipeline", None) is not None,
            embedder="all-MiniLM-L6-v2",
            embedder_loaded=True,  # loaded at module level in vector_store
        )
    except Exception as e:
        logger.warning(f"Models health check failed: {e}")
        models = ModelsStatus(
            llm="bartowski/sarvam-1-GGUF", llm_loaded=False,
            llm_backend="cpu",
            stt="openai/whisper-base", stt_loaded=False,
            tts="kokoro-tts", tts_loaded=False,
            embedder="all-MiniLM-L6-v2", embedder_loaded=False,
        )

    # --- Vector Store ---
    try:
        from src.services.vector_store import get_collection
        col = get_collection()
        count = col.count()
        # Estimate unique docs from metadata
        peek = col.peek(1)
        vs = VectorStoreStatus(connected=True, document_count=0, chunk_count=count)
        if count > 0:
            # try to count distinct doc_ids
            try:
                all_meta = col.get(include=["metadatas"])
                doc_ids = set()
                for m in (all_meta.get("metadatas") or []):
                    if m and "doc_id" in m:
                        doc_ids.add(m["doc_id"])
                vs.document_count = len(doc_ids)
            except Exception:
                vs.document_count = 0
    except Exception as e:
        logger.warning(f"Vector store health check failed: {e}")
        vs = VectorStoreStatus(connected=False, document_count=0, chunk_count=0)

    # --- GPU ---
    try:
        if torch.cuda.is_available():
            dev = torch.cuda.current_device()
            gpu = GpuStatus(
                vram_used_mb=round(torch.cuda.memory_allocated(dev) / 1024 / 1024, 1),
                vram_total_mb=round(torch.cuda.get_device_properties(dev).total_memory / 1024 / 1024, 1),
                device=torch.cuda.get_device_name(dev),
            )
        else:
            gpu = GpuStatus(vram_used_mb=0, vram_total_mb=0, device="cpu")
    except Exception as e:
        logger.warning(f"GPU health check failed: {e}")
        gpu = GpuStatus(vram_used_mb=0, vram_total_mb=0, device="unknown")

    return HealthResponse(
        status="ok",
        version="1.0.0",
        models=models,
        vector_store=vs,
        gpu=gpu,
    )
