# Phase 10 Research & Diagnosis

## Issue 1: Random LLM Responses / Bengali Output
**Diagnosis**: The React frontend uses an endpoint called `POST /chat` for its Direct LLM interactions. However, the backend `src/api/qa.py` currently maps `/chat` directly to `service.generate_response()` without supplying the `mode="chat"` flag. As a result, the backend defaults to the `rag` model (Sarvam-1). When Sarvam receives generic conversational prompts prefixed with OpenAI/ChatML tags, it hallucinates (often spitting out raw Bengali due to its Indic language roots).
**Solution**: Modify `src/api/qa.py` to pass `mode="chat"` so the LLM Service correctly hot-swaps to Llama-3-Instruct for conversations. Update `rag_service.py` context prompt generation to use proper Llama-3 tokens (`<|start_header_id|>`) instead of ChatML tokens (`<|im_start|>`).

## Issue 2: Documents Not Used in RAG
**Diagnosis**: Inside `src/services/vector_store.py`, `query_collection` hardcodes a `max_distance=0.65`. Because `all-MiniLM-L6-v2` L2 distances for highly relevant text often float between 0.8 and 1.2, every single context chunk is being aggressively stripped out, leaving an empty array for RAG context.
**Solution**: Increase `max_distance` to `1.5` or remove the hard threshold entirely and rely on Top-K retrieval.

## Issue 3: Screen OCR Implementation Missing
**Diagnosis**: The frontend `ChatView.tsx` has a "SCREEN OCR ON" toggle, but the current implementation only applies the `readScreen` payload when utilizing the `POST /ask_voice` voice endpoint. The text-based `POST /ask` and `POST /chat` endpoints do not parse or process the screen OCR context.
**Solution**: Add a `read_screen: bool = False` configuration field to the JSON body requests in `src/api/qa.py` and instruct them to utilize `ScreenReaderService` to capture Windows desktop content during text queries.

## Issue 4: TTS Implementation Partial
**Diagnosis**: The TTS fallback is functional in theory, but when large paragraphs are generated, Kokoro might crash or the frontend `<audio>` blob element fails to render continuous streaming results.
**Solution**: Enforce strict error handling in the Javascript `playBlobAudio` routine and verify the `TTS_AUDIO_DIR` caching routine correctly synthesizes larger chunks.

## Issue 5: No GPU Utilization
**Diagnosis**: The python script output shows `llama_cpp.llama_supports_gpu_offload() == False`. This means `llama-cpp-python` was compiled without CuBLAS capability, so even with the RTX 3050, it routes to CPU inference.
**Solution**: We must execute a pip command during execution to reinstall `llama-cpp-python` utilizing the windows CUDA 12.1 wheel from Abetlen's wheel server: `pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu121 --force-reinstall`.

## Issue 6: No LLM Model Indicator in UI
**Diagnosis**: The new `GET /health` API endpoint provides `models.llm` successfully, but the `ChatView.tsx` and `NavBar.tsx` components do not have a visual element explicitly displaying it.
**Solution**: Update the React frontend `NavBar` to fetch and render the active LLM name fetched from the backend so the user knows exactly what model is processing their request.
