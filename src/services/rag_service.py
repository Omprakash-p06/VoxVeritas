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

    def ask_question(self, query: str, mode: str = "rag") -> RAGResponse:
        """
        Processes a user query.
        If mode is 'chat', it sends the query directly to the chat LLM.
        If mode is 'rag', it retrieves context, builds a prompt, and generates a cited answer.
        """
        logger.info(f"Processing {mode.upper()} query: {query}")
        
        if mode == "chat":
            prompt = f"<|im_start|>user\n{query}<|im_end|>\n<|im_start|>assistant\n"
            try:
                answer = self.llm_service.generate_response(prompt, mode="chat", max_tokens=1024)
                return RAGResponse(answer=answer, citations=[])
            except Exception as e:
                logger.error(f"Error in CHAT pipeline: {e}")
                raise
                
        # --- RAG Mode Logic ---
        # 1. Retrieve context
        context_items = query_collection(self.collection, query)
        
        if not context_items:
            # Strict fallback: NEVER answer without document context
            fallback_prompt = f"""You are VoxVeritas, an accessibility assistant that ONLY answers questions based on uploaded documents.

A user asked: "{query}"

No documents were found in the knowledge base that match this query.

You MUST follow these rules EXACTLY:
1. Your response MUST start with "No documents found."
2. Do NOT answer the question. Do NOT provide any factual information, opinions, code, stories, poems, or jokes.
3. Simply tell the user that no relevant documents were found and suggest they upload documents first.
4. Keep your response to 1-2 sentences maximum.

Response:"""
            answer = self.llm_service.generate_response(fallback_prompt, mode="rag", max_tokens=128)
            # Hard safety net: prepend "No documents found." if the LLM didn't include it
            if "no documents found" not in answer.lower():
                answer = "No documents found. " + answer
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
            answer = self.llm_service.generate_response(prompt, mode="rag", max_tokens=512)
            
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
