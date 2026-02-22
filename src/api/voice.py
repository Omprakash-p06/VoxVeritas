import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi import Form
from pydantic import BaseModel
from loguru import logger
from src.services.stt_service import get_stt_service
from src.services.tts_service import get_tts_service
from src.services.rag_service import get_rag_service

router = APIRouter()

class SynthesizeRequest(BaseModel):
    text: str

# Directory for storing temporary audio
TEMP_AUDIO_DIR = ".data/temp_audio"
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)

@router.post("/transcribe", summary="Transcribe Audio to Text")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Receives an audio file, transcribes it using Whisper, and returns the text.
    """
    if not file.filename.endswith(('.wav', '.mp3', '.m4a', '.ogg', '.flac')):
         raise HTTPException(status_code=400, detail="Unsupported audio format")

    logger.info(f"Received audio file for transcription: {file.filename}")
    
    # Save uploaded file temporarily
    temp_file_path = os.path.join(TEMP_AUDIO_DIR, file.filename)
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        stt_service = get_stt_service()
        transcription = stt_service.transcribe_audio(temp_file_path)
        
        return {
            "status": "success",
            "transcription": transcription
        }
    except Exception as e:
        logger.error(f"Error processing audio upload: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as cleanup_err:
                logger.warning(f"Failed to remove temp file {temp_file_path}: {cleanup_err}")

@router.post("/synthesize", summary="Synthesize Text to Audio")
async def synthesize_audio(request: SynthesizeRequest):
    """
    Receives text, generates synthetic speech using Kokoro, and returns a .wav file.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    logger.info(f"Received text for synthesis: {request.text[:50]}...")
    
    try:
        tts_service = get_tts_service()
        # Generate a unique filename using hash or just override a temp one for demo
        # For multi-tenant we'd use UUID, here we just use output.wav
        output_path = tts_service.generate_audio(request.text, output_filename="response.wav")
        
        return FileResponse(
            path=output_path,
            media_type="audio/wav",
            filename="response.wav"
        )
    except Exception as e:
        logger.error(f"Error synthesizing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask_voice", summary="End-to-End Voice RAG Pipeline")
async def ask_voice(file: UploadFile = File(...), read_screen: bool = Form(False), chat_mode: bool = Form(False)):
    """
    Receives an audio file containing a spoken question.
    Optional: read_screen boolean parameter.
    1. Transcribes it into text using Whisper.
    2. (Optional) Captures user's screen using Windows Native OCR and injects as context.
    3. Runs the RAG pipeline to get a cited answer.
    4. Synthesizes the answer text into audio using Kokoro.
    5. Returns a JSON payload with data and audio b64.
    """
    import base64

    if not file.filename.endswith(('.wav', '.mp3', '.m4a', '.ogg', '.flac')):
         raise HTTPException(status_code=400, detail="Unsupported audio format")

    temp_file_path = os.path.join(TEMP_AUDIO_DIR, file.filename)
    try:
        # Save temp file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logger.info(f"Step 1: Transcribing ...")
        stt_service = get_stt_service()
        transcription = stt_service.transcribe_audio(temp_file_path)
        logger.info(f"Transcription: {transcription}")
        
        logger.info(f"Step 2: Generation RAG Answer ...")
        rag_service = get_rag_service()

        mode_str = "chat" if chat_mode else "rag"
        rag_response = rag_service.ask_question(transcription, mode=mode_str, read_screen=read_screen)
        
        logger.info(f"Step 3: Synthesizing TTS ...")
        tts_service = get_tts_service()
        output_path = tts_service.generate_audio(rag_response.answer, output_filename="pipelined_response.wav")
        
        # Citations are already a list of source filenames.
        citation_texts = rag_response.citations
        
        # Read the generated TTS file and convert to base64
        with open(output_path, "rb") as f:
            audio_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        return JSONResponse(status_code=200, content={
            "transcription": transcription,
            "answer": rag_response.answer,
            "citations": citation_texts,
            "audio_base64": audio_b64,
            "model": rag_response.model,
        })

    except Exception as e:
        logger.error(f"Error in Voice RAG pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                pass
