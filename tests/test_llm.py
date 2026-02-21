import pytest
from src.services.llm_service import LLMService
import os

@pytest.mark.skipif(not os.path.exists(".data/models/qwen2.5-1.5b-instruct-q4_k_m.gguf"), 
                    reason="Model file not downloaded yet")
def test_llm_generation():
    service = LLMService()
    response = service.generate_response("Say hello world", max_tokens=10)
    assert len(response) > 0
    print(f"\nModel Response: {response}")

def test_llm_service_singleton():
    from src.services.llm_service import get_llm_service
    s1 = get_llm_service()
    s2 = get_llm_service()
    assert s1 is s2
