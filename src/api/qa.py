from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from src.services.llm_service import LLMService, get_llm_service
from src.services.rag_service import RAGService, get_rag_service, RAGResponse
from loguru import logger

class ChatRequest(BaseModel):
    prompt: str
    max_tokens: int = 512
    temperature: float = 0.7
    read_screen: bool = False

class ChatResponse(BaseModel):
    response: str

class QARequest(BaseModel):
    query: str
    mode: str = "rag"
    read_screen: bool = False

router = APIRouter()

@router.post("/chat", response_model=ChatResponse, summary="Direct chat with the LLM")
async def chat(request: ChatRequest, service: LLMService = Depends(get_llm_service)) -> ChatResponse:
    """
    Directly queries the LLM with a prompt. 
    This is primarily for testing the base model integration.
    """
    try:
        prompt = request.prompt
        if request.read_screen:
            from src.services.screen_reader import get_screen_reader_service
            ocr_text = get_screen_reader_service().capture_and_read_screen()
            if ocr_text:
                prompt = f"SCREEN CONTEXT: {ocr_text}\n\nUSER PROMPT: {prompt}"

        response_text = service.generate_response(
            prompt=prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            mode="chat"
        )
        return ChatResponse(response=response_text)
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask", response_model=RAGResponse, summary="Grounded QA using RAG")
async def ask(request: QARequest, service: RAGService = Depends(get_rag_service)) -> RAGResponse:
    """
    Performs grounded QA using retrieved document context.
    """
    try:
        return service.ask_question(query=request.query, mode=request.mode, read_screen=request.read_screen)
    except Exception as e:
        logger.error(f"QA endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
