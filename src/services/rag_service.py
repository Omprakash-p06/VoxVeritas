from src.services.vector_store import get_collection, query_collection
from src.services.llm_service import get_llm_service
from loguru import logger
from pydantic import BaseModel
from typing import List

class RAGResponse(BaseModel):
    answer: str
    citations: List[str]

class RAGService:
    """Orchestrates query retrieval and LLM generation for grounded answers."""

    def __init__(self):
        self.collection = get_collection()
        self.llm_service = get_llm_service()

    def ask_question(self, query: str) -> RAGResponse:
        """
        Processes a user query: retrieves context, builds a prompt, and generates a cited answer.
        """
        logger.info(f"Processing RAG query: {query}")
        
        # 1. Retrieve context
        context_items = query_collection(self.collection, query)
        
        if not context_items:
            # Fallback if no context found
            answer = self.llm_service.generate_response(
                f"User asked: {query}. No specific document context was found. Please answer based on general knowledge but state that no documents were found."
            )
            return RAGResponse(answer=answer, citations=[])

        # 2. Build augmented prompt
        context_text = "\n\n".join([
            f"--- Context Chunk {i+1} (Source: {item['metadata'].get('filename', 'Unknown')}) ---\n{item['text']}"
            for i, item in enumerate(context_items)
        ])
        
        prompt = f"""You are VoxVeritas, an accessibility assistant. Use the provided context to answer the user's question. 
If the answer is not in the context, say you don't know based on the documents.
Always include the source filename in brackets like [Source: filename.pdf] at the end of relevant sentences.

Context:
{context_text}

Question: {query}
Answer:"""

        # 3. Generate response
        try:
            answer = self.llm_service.generate_response(prompt, max_tokens=512)
            
            # Extract citations from metadata
            citations = list(set([item['metadata'].get('filename', 'Unknown') for item in context_items if 'filename' in item['metadata']]))
            
            return RAGResponse(answer=answer, citations=citations)
        except Exception as e:
            logger.error(f"Error in RAG pipeline: {e}")
            raise

# Singleton instance
_rag_instance = None

def get_rag_service() -> RAGService:
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = RAGService()
    return _rag_instance
