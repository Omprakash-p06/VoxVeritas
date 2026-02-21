# REQUIREMENTS.md

## Format
| ID | Requirement | Source | Status |
|----|-------------|--------|--------|
| REQ-01 | The system shall provide an end-to-end voice query pipeline (mic -> Whisper STT -> Document Retrieval -> Sarvam-1 -> Kokoro TTS). | SPEC Goal 1 | Pending |
| REQ-02 | The system shall be able to capture and read the current screen content when requested via voice prompt. | SPEC Goal 2 | Pending |
| REQ-03 | Generated answers must explicitly cite the source document snippets used for retrieval. | SPEC Goal 3 | Pending |
| REQ-04 | The system must support document ingestion (PDF, DOCX, TXT) into a local ChromaDB vector store. | SRS 3.1 | Pending |
| REQ-05 | The pipeline must support multilingual voice inputs (English + at least one Indic language). | SPEC Goal 4 | Pending |
| REQ-06 | A safety dashboard must display Promptfoo scenario pass/fail results. | SRS 3.5 | Pending |
| REQ-07 | Python codebase must strictly adhere to Google Style Guide standards. | SPEC Goal 5 | Pending |
| REQ-08 | Target execution environment must operate within a 4 GB VRAM limit (RTX 3050). | SPEC Constraints | Pending |
