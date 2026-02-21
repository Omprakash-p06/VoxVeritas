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
**Status**: ⬜ Not Started
**Objective**: Implement desktop screen capture/OCR to read current screen content on voice trigger and feed it into the RAG context.
**Requirements**: REQ-02

### Phase 5: Safety Evaluation & Terminal Testing
**Status**: ⬜ Not Started
**Objective**: Integrate Promptfoo for safety evaluations against the LLM pipeline, and write robust terminal scripts to demo the entire flow without a frontend.
**Requirements**: REQ-06

### Phase 6: External Frontend Integration
**Status**: ⬜ Not Started
**Objective**: Connect the completed, tested backend API to the externally developed frontend dashboard.
**Requirements**: SPEC Goal 1, SPEC Goal 5
