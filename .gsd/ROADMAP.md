# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] End-to-end voice query pipeline (STT -> RAG -> LLM -> TTS)
- [ ] Screen reading capability triggered by voice
- [ ] Document grounded and cited answers
- [ ] Working multilingual input demo
- [ ] Safety dashboard indicating test results

## Phases

### Phase 1: Foundation & Infrastructure
**Status**: ⬜ Not Started
**Objective**: Set up project structure, FastAPI backend, local ChromaDB setup, and basic document ingestion endpoint.
**Requirements**: REQ-04, REQ-07

### Phase 2: Core RAG & LLM Integration
**Status**: ✅ Complete
**Objective**: Integrate Sarvam-1 2B via llama-cpp-python, build semantic retrieval against ChromaDB, and generate grounded answers with citations.
**Requirements**: REQ-03, REQ-08

### Phase 3: Voice-First Pipeline
**Status**: ✅ Complete
**Objective**: Integrate Whisper for STT (multilingual) and Kokoro for TTS. Connect the pipeline: Audio Input -> Text -> RAG -> Text -> Audio Output.
**Requirements**: REQ-01, REQ-05

### Phase 4: Screen Reading & Accessibility Expansion
**Status**: ✅ Complete
**Objective**: Implement desktop screen capture/OCR to read current screen content on voice trigger and feed it into the RAG context.
**Requirements**: REQ-02

### Phase 5: Desktop Frontend Dashboard
**Status**: ✅ Complete
**Objective**: Connect the completed, tested backend API to a vanilla HTML/JS/CSS frontend served directly from FastAPI, providing a sleek voice-to-voice interface.
**Requirements**: SPEC Goal 1, SPEC Goal 5

### Phase 6: Safety Evaluation & Terminal Testing
**Status**: ✅ Complete
**Objective**: Integrate Promptfoo for safety evaluations against the LLM pipeline, and write robust terminal scripts to demo the entire flow without a frontend.
**Requirements**: REQ-06

---

### Phase 7: Integration Testing & Debugging
**Status**: ✅ Complete
**Objective**: End-to-end testing of all pipeline components to resolve bugs, validate hallucination guards using live Promptfoo evaluations against the running backend, and ensure the full system is stable and demo-ready.
**Depends on**: Phase 6

**Tasks**:
- [ ] TBD (run /plan 7 to create)

**Verification**:
- TBD

---

### Phase 8: Frontend-Backend Integration
**Status**: ⬜ Not Started
**Objective**: Integrate the externally developed frontend with the VoxVeritas FastAPI backend. Establish CORS policies, finalize the API contract, and ensure the full voice-to-voice pipeline works end-to-end through the production frontend.
**Depends on**: Phase 7

**Tasks**:
- [ ] TBD (run /plan 8 to create)

**Verification**:
- TBD
