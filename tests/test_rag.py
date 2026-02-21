import pytest
from src.services.rag_service import RAGService, RAGResponse
import os

@pytest.mark.skipif(not os.path.exists(".data/models/sarvam-1-Q4_K_M.gguf"), 
                    reason="Model file not downloaded yet")
def test_rag_ask_question():
    service = RAGService()
    response = service.ask_question("What is the capital of France?")
    
    assert isinstance(response, RAGResponse)
    assert isinstance(response.answer, str)
    assert len(response.answer) > 0
    assert isinstance(response.citations, list)
    
def test_rag_service_singleton():
    from src.services.rag_service import get_rag_service
    s1 = get_rag_service()
    s2 = get_rag_service()
    assert s1 is s2
