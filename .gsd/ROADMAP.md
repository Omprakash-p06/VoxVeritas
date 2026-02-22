# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [x] End-to-end voice query pipeline (STT -> RAG -> LLM -> TTS)
- [x] Screen reading capability triggered by voice
- [x] Document grounded and cited answers
- [x] Working multilingual input demo
- [x] Safety dashboard indicating test results

## Phases

> [!NOTE]
> All phases for **Milestone v1.0** have been archived to [.gsd/milestones/v1.0](file:///c:/Users/OM%20Prakash/Documents/VoxVeritas/.gsd/milestones/v1.0).
> 
> Use `/new-milestone` to define the next set of objectives.

### Phase 1: Foundation & Infrastructure
**Status**: ✅ Complete
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

---

### Phase 9: UX Refinement & Normal Chatbot Integration
**Status**: ✅ Complete
**Objective**: Enhance the UI/UX for the target audience by adding a normal chatbot mode (switching between RAG and standard LLM), displaying the running model in the UI, fixing document deletion, and adding a script to manage/download models easily. Ensures GPU VRAM is used efficiently for these tasks.
**Depends on**: Phase 8

**Tasks**:
- [ ] TBD (run /plan 9 to create)

**Verification**:
- TBD

---

### Phase 10: Critical Bug Fixes, GPU Acceleration, and Feature Completion
**Status**: ✅ Complete
**Objective**: Address critical feedback: 1) Fix random LLM hallucinations and Bengali output, 2) Fix uploaded documents not being utilized in RAG/Chatbot context, 3) Implement the missing screen OCR functionality, 4) Complete the partial TTS implementation, 5) Force GPU utilization over CPU for inference, and 6) Add a UI indicator in the chatbot showing which LLM is processing the query.
**Depends on**: Phase 9

**Tasks**:
- [ ] TBD (run `/plan 10` to create)

**Verification**:
- TBD
