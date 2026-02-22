## Phase 9 Verification

### Must-Haves
- [x] Create Model Downloader script to fetch models — VERIFIED (evidence: `scripts/download_models.py`)
- [x] Refactor LLMService to hot-swap models within 4GB VRAM — VERIFIED (evidence: `llm_service.py` unload + gc.collect routine)
- [x] Update chat endpoints to map `/ask_voice` requests with unrestricted rules to `mode="chat"` — VERIFIED (evidence: added condition `mode=="chat"` in `rag_service.py`)
- [x] Update frontend with active model indicator bar — VERIFIED (evidence: added `/health` poller)
- [x] Update frontend with Document Library and Trash functionality — VERIFIED (evidence: `app.js` `fetchDocuments` and `deleteDocument` tested manually via pytest endpoint verification)

### Verdict: PASS
