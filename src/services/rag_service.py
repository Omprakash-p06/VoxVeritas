from src.services.vector_store import get_collection, query_collection
from src.services.llm_service import get_llm_service
from loguru import logger
from pydantic import BaseModel
from typing import List

class RAGResponse(BaseModel):
    answer: str
    citations: List[str]
    model: str

class RAGService:
    """Orchestrates query retrieval and LLM generation for grounded answers."""

    def __init__(self):
        self.collection = get_collection()
        self.llm_service = get_llm_service()

    def ask_question(self, query: str, mode: str = "rag", read_screen: bool = False) -> RAGResponse:
        """
        Processes a user query by combining document retrieval (RAG) and optional screen capture (OCR).
        """
        logger.info(f"Processing {mode.upper()} query (OCR={read_screen}): {query}")
        
        # 1. Capture screen OCR if requested
        ocr_context = ""
        if read_screen:
            from src.services.screen_reader import get_screen_reader_service
            ocr_context = get_screen_reader_service().capture_and_read_screen()
            if ocr_context:
                logger.debug(f"Captured OCR context: {len(ocr_context)} chars")

        # 2. Handle Direct Chat Mode
        if mode == "chat":
            system_prompt = (
                "You are VoxVeritas, a factual assistant. "
                "Prefer concise, accurate answers. If asked about uploaded documents and you do not have evidence, "
                "explicitly say you do not have enough document context."
            )
            prompt_body = query
            if ocr_context:
                prompt_body = f"SCREEN CONTEXT: {ocr_context}\n\nUSER QUERY: {query}"
            
            chat_payload = f"<|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt_body}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
            
            answer = self.llm_service.generate_response(chat_payload, mode="chat", max_tokens=1024)
            model_name = self.llm_service.get_current_model_info().get("name", "Unknown")
            return RAGResponse(answer=answer, citations=[], model=model_name)

        # 3. Handle RAG Mode
        context_items = query_collection(self.collection, query)
        
        # 4. Fallback if no context at all
        if not context_items and not ocr_context:
            answer = "I couldn't find relevant information in uploaded documents or screen OCR context for this query."
            model_name = self.llm_service.get_current_model_info().get("name", "Unknown")
            return RAGResponse(answer=answer, citations=[], model=model_name)

        # 5. Build prompt with available context
        context_parts = []
        if ocr_context:
            context_parts.append(f"--- SCREEN CAPTURE CONTEXT ---\n{ocr_context}")
        
        if context_items:
            doc_context = "\n\n".join([
                f"--- Document Chunk (Source: {item['metadata'].get('filename', 'Unknown')}) ---\n{item['text']}"
                for item in context_items
            ])
            context_parts.append(doc_context)
            
        full_context = "\n\n".join(context_parts)
        
        prompt = f"""You are VoxVeritas, an accessibility assistant.
    Strict grounding rules:
    1) Answer ONLY from the context below.
    2) If context is insufficient, say exactly: "Insufficient context from uploaded documents."
    3) Do not invent facts.
    4) Keep the answer concise.

Context:
{full_context}

Question: {query}
    Answer:"""

        # 6. Generate and return
        answer = self.llm_service.generate_response(prompt, mode="rag", max_tokens=1024)
        citations = []
        if context_items:
            citations = list(set([item['metadata'].get('filename', 'Unknown') for item in context_items if 'filename' in item['metadata']]))

        model_name = self.llm_service.get_current_model_info().get("name", "Unknown")
        return RAGResponse(answer=answer, citations=citations, model=model_name)

# Singleton instance
_rag_instance = None

def get_rag_service() -> RAGService:
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = RAGService()
    return _rag_instance
