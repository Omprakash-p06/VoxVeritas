from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from src.services.rag_service import RAGService, get_rag_service, RAGResponse
from loguru import logger
from typing import List

class ChatRequest(BaseModel):
    prompt: str
    max_tokens: int = 512
    temperature: float = 0.2
    read_screen: bool = False
    screen_context: str | None = None

class ChatResponse(BaseModel):
    response: str
    model: str
    citations: List[str]

class QARequest(BaseModel):
    query: str
    mode: str = "rag"
    read_screen: bool = False
    screen_context: str | None = None

router = APIRouter()

@router.post("/chat", response_model=ChatResponse, summary="Direct chat with the LLM")
async def chat(request: ChatRequest, service: RAGService = Depends(get_rag_service)) -> ChatResponse:
    """
    Direct chat mode using the chat model, while still attaching retrieved document citations.
    """
    try:
        rag_result = service.ask_question(
            query=request.prompt,
            mode="chat",
            read_screen=request.read_screen,
            screen_context_override=request.screen_context,
        )
        return ChatResponse(response=rag_result.answer, model=rag_result.model, citations=rag_result.citations)
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask", response_model=RAGResponse, summary="Grounded QA using RAG")
async def ask(request: QARequest, service: RAGService = Depends(get_rag_service)) -> RAGResponse:
    """
    Performs grounded QA using retrieved document context.
    """
    try:
        return service.ask_question(
            query=request.query,
            mode=request.mode,
            read_screen=request.read_screen,
            screen_context_override=request.screen_context,
        )
    except Exception as e:
        logger.error(f"QA endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
