from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from src.services.llm_service import LLMService, get_llm_service
from src.services.rag_service import RAGService, get_rag_service, RAGResponse
from loguru import logger

class ChatRequest(BaseModel):
    prompt: str
    max_tokens: int = 512
    temperature: float = 0.7

class ChatResponse(BaseModel):
    response: str

class QARequest(BaseModel):
    query: str

router = APIRouter()

@router.post("/chat", response_model=ChatResponse, summary="Direct chat with the LLM")
async def chat(request: ChatRequest, service: LLMService = Depends(get_llm_service)) -> ChatResponse:
    """
    Directly queries the LLM with a prompt. 
    This is primarily for testing the base model integration.
    """
    try:
        response_text = service.generate_response(
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature
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
        return service.ask_question(query=request.query)
    except Exception as e:
        logger.error(f"QA endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
