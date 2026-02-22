# Phase 7 Research: Integration Testing & Debugging

## Objective
Stabilize the entire VoxVeritas system and confirm demo-readiness. This includes closing known bugs, running live Promptfoo evaluations, and running the full pipeline without errors.

## Known Issues & Gaps Identified

### Bug 1: `uvicorn` not finding venv dependencies
**Symptom**: Running `uvicorn src.main:app` from a plain PowerShell terminal gives `ModuleNotFoundError: No module named 'loguru'`.
**Root Cause**: The system PATH resolves to the global Python 3.13 interpreter where VoxVeritas' packages are not installed. The project must be run with the `venv` Python.
**Fix**: Add a `run_server.ps1` convenience script that activates the venv and sets `PYTHONPATH` before starting `uvicorn`. Also document the correct invocation in `README.md`.

### Bug 2: Promptfoo evaluations never run live
**Symptom**: `evaluations/promptfooconfig.yaml` exists but was never executed against the running backend.
**Root Cause**: The server hasn't been launched in a stable session yet.
**Fix**: As part of Phase 7 execution, we will start the backend server and then actually run `npx promptfoo eval` and capture the results.

### Bug 3: No integration test for the full HTTP pipeline
**Symptom**: Unit and component tests exist (e.g., `test_stt.py`, `test_tts.py`, `test_rag.py`) but they test services in isolation. There is no single end-to-end test that hits the live FastAPI server from a test client (i.e., `test_voice_api.py` uses a `TestClient`, not a real running server).
**Fix**: `tests/test_voice_api.py` with `TestClient` is actually a valid approach and is sufficient. However, we should verify all tests in that file pass.

### Bug 4: `StaticFiles` mount order conflict
**Symptom**: Mounting `StaticFiles` at `/` catches ALL requests, including API routes `/ask`, `/transcribe`, etc., potentially shadowing the API endpoints.
**Root Cause**: In FastAPI, routes are matched top-down. If `/` is mounted as `StaticFiles` before API routers are defined, static files will absorb everything.
**Fix**: In `src/main.py`, ensure `app.mount("/", ...)` is called **after** all API routers are included (which it currently is, since it's appended at the end of `create_app`). Verify empirically that API routes still respond correctly after mounting static files.

## Testing Strategy
Phase 7 will have three waves:
1. **Bug Fixes** — Fix the `run_server.ps1` PATH issue and verify static mount order.
2. **Full Test Suite Run** — Run all existing pytest suites sequentially.
3. **Live Promptfoo Evaluation** — Start the server and fire the promptfoo evaluations to generate a real dashboard.
