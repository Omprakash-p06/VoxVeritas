# Phase 9 Research: UX Refinement & Normal Chatbot Integration

## 1. Normal Chatbot & Model Switching
**Problem**: The current `QA` router strictly enforces RAG rules (preventing normal conversation like "hi") by hardcoding a fallback when no documents match. The user wants a standard chatbot experience alongside the RAG experience.
**Solution**:
- Introduce a `/chat` endpoint (or a `mode` parameter in `/ask`).
- Support multiple models. The user suggested something like "gpt-oss". We will use `Llama-3.2-3B-Instruct.Q4_K_M.gguf` or `Qwen2.5-3B-Instruct-Q4_K_M.gguf` as the "Normal Chat" model because it is highly conversational, intelligent, and fits within 4GB VRAM.
- Modify `LLMService` to handle model switching. Since VRAM is strictly 4GB (RTX 3050), keeping two LLMs in VRAM simultaneously will crash. We must implement a "model swapper" where loading a new model unloads the previous one and clears the CUDA cache via C-bindings or simply python GC before initializing the new `Llama` instance.

## 2. UI Bar for Running Model
**Problem**: The user wants to see which model is currently active.
**Solution**:
- Add a `GET /system/info` (or `/health`) endpoint that returns the currently active LLM, TTS, STT models.
- The UI will poll this or update when a response arrives, showing a status bar (e.g., "Active Model: Sarvam-1 2B (RAG) | Cache: 1.2GB").

## 3. Model Download Script
**Problem**: Hard to manually track and download models.
**Solution**:
- Create `scripts/download_models.py` using `huggingface_hub` to fetch:
  - `QuantFactory/sarvam-1-GGUF` (Sarvam-1-Q4_K_M.gguf)
  - `bartowski/Llama-3.2-3B-Instruct-GGUF` (Llama-3.2-3B-Instruct-Q4_K_M.gguf)
  - Whisper models
  - Kokoro TTS models

## 4. Document Deletion Fix
**Problem**: User is unable to delete uploaded documents.
**Solution**:
- The current implementation likely does not remove chunks from ChromaDB. We need to implement the `DELETE /documents/{doc_id}` endpoint in `document.py`.
- Call `collection.delete(where={"doc_id": doc_id})` in ChromaDB and remove the actual file from disk.

## Decisions
- We will refactor `LLMService` to accept `model_path` dynamically and release memory upon change.
- We will add the UI toggles.
- We will create `scripts/download_models.py`.
