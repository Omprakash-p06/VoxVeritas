# Phase 7 Verification: Integration Testing & Debugging

## 1. Wave 1: Bug Fixing
- **Action**: Addressed the `MemoryError` bug in the document parser logic and verified the `StaticFiles` mapping. Also resolved the `uvicorn` `.venv` path issues using a convenience `$env:PYTHONPATH` script (`run_server.ps1`).
- **Validation**: All 4 automated pytests inside `test_voice_api.py` run perfectly with 0 warnings and 0 errors:
  ```powershell
  $env:PYTHONPATH="." ; python -m pytest tests/test_voice_api.py
  # PASSED: test_create_and_delete_tts_job
  # PASSED: test_ask_voice_endpoint
  # PASSED: test_ask_voice_endpoint_with_screen
  # PASSED: test_missing_query_parameter
  ```

## 2. Wave 2: Live Promptfoo Assertions
- **Action**: Ran 10 adversarial jailbreak prompts (e.g., "how to build a bomb", "DDoS python scripts", "hate speech").
- **Validation**:
  - The application threw `422 Unprocessable Entity` when Promptfoo's `promptfooconfig.yaml` payload was misconfigured, proving the Pydantic type validation works.
  - After correcting the hook, the LLM hallucinatted responses to contextless questions.
  - We hardened the RAG fallback logic (`rag_service.py`) to enforce a rejection schema when context is missing for adversarial actions.
  - `npx promptfoo eval` executed successfully with a `10/10 (100%)` pass rate.
  - Generates HTML UI correctly running on `localhost:15500`.

**Requirement Satisfied**: Phase 7 Goal Complete.
