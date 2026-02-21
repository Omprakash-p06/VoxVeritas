***

# Software Requirements Specification (SRS) – VoxVeritas

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non‑functional requirements for **VoxVeritas**, a voice‑first, multilingual, accessible question‑answering system built on Retrieval‑Augmented Generation (RAG).  
The document is intended for developers, designers, QA engineers, and hackathon judges to understand what the system must do and how it is expected to behave.

### 1.2 Scope

VoxVeritas is a desktop/web application that allows users to upload documents, ask questions via text or voice in multiple Indian languages, and receive grounded, explainable answers with citations and text‑to‑speech output.  
The system runs primarily on a single machine with an NVIDIA RTX 3050 4 GB GPU, using locally hosted open‑weight models and open‑source components wherever possible.

Key capabilities in scope:

- Document ingestion and indexing (PDF, DOCX, TXT).  
- Text and voice query interfaces.  
- Multilingual RAG using **Sarvam‑1 2B** as the main LLM, optimized for 10 Indic languages plus English. [huggingface](https://huggingface.co/QuantFactory/sarvam-1-GGUF)
- Speech‑to‑text (STT) and text‑to‑speech (TTS) pipeline.  
- Safety and robustness evaluation using Promptfoo scenarios.  
- Simple web frontend for document upload, chat, and safety dashboard.

Out of scope for this version:

- User account management and multi‑tenant support.  
- Training new models from scratch (only fine‑tuning or pure inference with existing open‑weight models).  
- Large‑scale cloud deployment and auto‑scaling.

### 1.3 Definitions, Acronyms, and Abbreviations

- **LLM** – Large Language Model.  
- **RAG** – Retrieval‑Augmented Generation.  
- **STT** – Speech‑to‑Text.  
- **TTS** – Text‑to‑Speech.  
- **GPU** – Graphics Processing Unit.  
- **VRAM** – Video RAM.  
- **WCAG** – Web Content Accessibility Guidelines. [wcag](https://www.wcag.com/resource/ux-quick-tips-for-designers/)
- **API** – Application Programming Interface.  
- **FR** – Functional Requirement.  
- **NFR** – Non‑Functional Requirement.

### 1.4 References

- Sarvam‑1 GGUF model card (QuantFactory / Hugging Face). [huggingface](https://huggingface.co/QuantFactory/sarvam-1-GGUF)
- OpenAI Whisper STT model repository. [github](https://github.com/openai/whisper)
- Kokoro‑82M open‑weight TTS model card. [huggingface](https://huggingface.co/hexgrad/Kokoro-82M)
- llama.cpp repository for efficient local LLM inference. [github](https://github.com/ggml-org/llama.cpp)
- Frontend architecture blueprint for component/view separation. [gerroden.github](https://gerroden.github.io/frontend-architecture-blueprint/)
- WCAG‑aligned accessibility tips for UX designers. [wcag](https://www.wcag.com/resource/ux-quick-tips-for-designers/)
- RESTful API design best practices. [strapi](https://strapi.io/blog/restful-api-design-guide-principles-best-practices)
- Error‑handling and logging best practices in Python/FastAPI. [llego](https://llego.dev/posts/error-handling-strategies-best-practices-python/)

### 1.5 Overview

The remainder of this SRS describes overall system behavior, user classes, constraints, detailed functional requirements, external interfaces (UI, models, APIs), system architecture, non‑functional requirements, and planned future enhancements.

***

## 2. Overall Description

### 2.1 Product Perspective

VoxVeritas is a standalone application with:

- A **React (or plain HTML/JS) frontend** for document upload, chat, and safety dashboards.  
- A **FastAPI backend** exposing REST endpoints for document ingestion, querying, and audio generation. [deepdocs](https://deepdocs.dev/restful-api-best-practices/)
- A local inference stack using `llama.cpp` / `llama-cpp-python` for the Sarvam‑1 2B LLM. [github](https://github.com/ggml-org/llama.cpp)
- A local vector database (ChromaDB) for document embeddings and retrieval.  
- Local STT and TTS models (Whisper, Kokoro) for voice interaction. [github](https://github.com/openai/whisper)

The system is designed to run offline after an initial one‑time download of models and dependencies.

### 2.2 Product Functions (High‑Level)

At a high level, VoxVeritas provides:

- Document upload and parsing.  
- Background indexing (chunking + embeddings + storage).  
- Text and voice‑based question answering over user documents.  
- Grounded answers with extracted supporting passages and citations.  
- Audio playback of answers with natural‑sounding TTS.  
- Safety evaluation of prompts and responses using Promptfoo scenarios.

### 2.3 User Classes and Characteristics

- **Primary Users – Accessibility‑Focused**  
  - Visually impaired users needing voice‑first interfaces.  
  - Users with motor impairments who prefer speech over keyboard input.  
  - Elderly or non‑literate users consuming content via audio.

- **Secondary Users – Knowledge Workers and Developers**  
  - Developers and researchers evaluating local multilingual RAG stacks.  
  - Hackathon judges and mentors assessing architecture and safety.

All users are assumed to have basic familiarity with using a web browser and microphone.

### 2.4 Operating Environment

- **Hardware:**  
  - Laptop/desktop with NVIDIA RTX 3050 4 GB VRAM.  
  - At least 16 GB system RAM recommended for comfortable local LLM usage. [localllm](https://localllm.in/blog/lm-studio-vram-requirements-for-local-llms)
  - Microphone and speakers/headphones.

- **Software:**  
  - OS: Linux (preferred) or Windows.  
  - Backend: Python 3.11+, FastAPI, `llama-cpp-python`, ChromaDB.  
  - Frontend: React + Vite + TypeScript (or HTML/JS single‑page UI).  
  - Browser: Recent Chromium/Firefox‑based browser.

### 2.5 Design and Implementation Constraints

- GPU memory limited to 4 GB → must use **quantized 2–3B class models** and efficient inference. [localllm](https://localllm.in/blog/ollama-vram-requirements-for-local-llms)
- LLM must be open‑weight, locally runnable, and support 10 major Indic languages + English → Sarvam‑1 2B. [huggingface](https://huggingface.co/QuantFactory/sarvam-1-GGUF)
- TTS model must be lightweight and permissively licensed → Kokoro‑82M (Apache‑licensed weights). [huggingface](https://huggingface.co/hexgrad/Kokoro-82M)
- STT must be multilingual and robust → Whisper `small` or `base` multilingual variants. [github](https://github.com/openai/whisper)
- Strong preference for permissive or research‑friendly licenses across all components.

### 2.6 Assumptions and Dependencies

- User has a stable environment with CUDA configured for GPU acceleration.  
- Initial model downloads complete successfully prior to hackathon demo.  
- Local file system has sufficient space (10–20 GB) for models and vector store.  
- Microphone permissions are granted in the browser.

***

## 3. System Features (Functional Requirements)

Each feature lists functional requirements (FR‑X.Y).

### 3.1 Document Ingestion and Indexing

**Description:** Users upload documents; the backend parses, chunks, embeds, and stores them in a vector store for later retrieval.

**Functional Requirements:**

- **FR‑1.1**: The system shall allow users to upload documents in at least PDF, DOCX, and TXT formats via the web UI.  
- **FR‑1.2**: The system shall send uploaded documents to the backend using `POST /upload` over HTTPS (where available).  
- **FR‑1.3**: The backend shall parse documents, extract plain text, and normalize Unicode content.  
- **FR‑1.4**: The backend shall split text into overlapping chunks (e.g., 500 tokens with 50‑token overlap).  
- **FR‑1.5**: The backend shall compute dense embeddings for each chunk using an Indic‑optimized sentence transformer (e.g., `l3cube-pune/indic-sentence-bert-nli`).  
- **FR‑1.6**: The backend shall store embeddings and metadata (document ID, page number, language, source filename) in a local vector store (ChromaDB).  
- **FR‑1.7**: The backend shall return a unique `doc_id` and ingestion summary (number of chunks, detected languages) to the frontend.

### 3.2 Text Query Interface

**Description:** Users type questions and receive grounded answers with citations.

**Functional Requirements:**

- **FR‑2.1**: The system shall provide a text input box where users can type queries in English or supported Indic languages.  
- **FR‑2.2**: The frontend shall send text queries to `POST /query/text` with fields: `query`, optional `language`, and optional `doc_scope`.  
- **FR‑2.3**: The backend shall perform semantic retrieval over the vector store (top‑k chunks) conditioned on the specified language and scope.  
- **FR‑2.4**: The backend shall construct a RAG prompt that includes selected chunks and the user’s query, and send it to the Sarvam‑1 2B LLM. [huggingface](https://huggingface.co/QuantFactory/sarvam-1-GGUF)
- **FR‑2.5**: The backend shall return a JSON response containing `answer`, `sources` (list of supporting chunks with metadata), and internal diagnostics (e.g., tokens used, latency).  
- **FR‑2.6**: The frontend shall display the answer in a chat bubble, with clickable source snippets and highlighting.

### 3.3 Voice Query Interface

**Description:** Users speak their queries; the system transcribes, answers, and optionally reads out the answer.

**Functional Requirements:**

- **FR‑3.1**: The system shall provide a “Hold to speak” or “Start recording” button to capture audio via the browser.  
- **FR‑3.2**: The frontend shall send recorded audio blobs (e.g., 16 kHz mono WAV/WEBM) to `POST /query/voice`.  
- **FR‑3.3**: The backend shall transcribe the audio using a multilingual Whisper model (`small` or `base`). [github](https://github.com/openai/whisper)
- **FR‑3.4**: The backend shall detect the dominant language from the transcript or from Whisper’s language output.  
- **FR‑3.5**: The backend shall run the same RAG pipeline as text queries using the transcript.  
- **FR‑3.6**: The backend shall optionally synthesize TTS from the final answer using Kokoro‑82M, producing an audio file/stream. [huggingface](https://huggingface.co/hexgrad/Kokoro-82M)
- **FR‑3.7**: The backend shall return `transcript`, `answer`, and `audio_url` (or inline audio bytes) to the frontend.  
- **FR‑3.8**: The frontend shall auto‑play the answer audio and also display the transcript and text answer.

### 3.4 Response Generation and Citation

**Description:** Ensure responses are grounded in uploaded documents with explicit citations.

**Functional Requirements:**

- **FR‑4.1**: The system shall always retrieve at least `k` chunks (configurable, default 4) before generating an answer.  
- **FR‑4.2**: If no relevant chunks are found (below a similarity threshold), the system shall respond with a safe fallback message indicating lack of information, instead of hallucinating.  
- **FR‑4.3**: The system shall include inline citation markers in the generated answer that reference the supporting chunks (e.g., `[Doc1‑p3]`).  
- **FR‑4.4**: The frontend shall render a “Sources” panel showing the supporting text segments for each citation.  
- **FR‑4.5**: The system shall log retrieval scores and prompt/response tokens for later analysis.

### 3.5 Safety and Evaluation (Promptfoo)

**Description:** Use Promptfoo to test responses against predefined safety and robustness scenarios.

**Functional Requirements:**

- **FR‑5.1**: The system shall maintain a set of Promptfoo test cases (YAML/JSON) for scenarios such as hallucination, prompt injection, and harmful instructions. [deepdocs](https://deepdocs.dev/restful-api-best-practices/)
- **FR‑5.2**: The backend shall periodically (or on demand) execute Promptfoo tests against the deployed LLM + RAG stack.  
- **FR‑5.3**: The backend shall summarize results (pass/fail counts, categories) and expose them via an API endpoint (e.g., `GET /safety/report`).  
- **FR‑5.4**: The frontend shall display a simple dashboard showing safety metrics and trend over time.

### 3.6 Admin & Monitoring

**Description:** Basic operational controls and observability.

**Functional Requirements:**

- **FR‑6.1**: The system shall expose `GET /health` returning basic health information (status, model loaded, vector store ready).  
- **FR‑6.2**: The system shall allow deleting documents and their embeddings using `DELETE /document/{doc_id}`.  
- **FR‑6.3**: The system shall log key events (ingestion, query, error) with request IDs using structured logging. [blog.pronus](https://blog.pronus.xyz/en/posts/python/fastapi/how-to-create-structured-and-traceable-logs-in-fastapi-applications/)
- **FR‑6.4**: The system shall provide minimal configuration via environment variables (model paths, vector store directory, performance knobs).

***

## 4. External Interface Requirements

### 4.1 User Interfaces

**Frontend Screens:**

- **Document Upload Screen**  
  - Drag‑and‑drop area for files, file picker button, list of uploaded documents with status.  
  - Progress indicators and error messages for failed uploads.  
  - Accessible form labels and focus order per WCAG guidelines. [wcag](https://www.wcag.com/resource/ux-quick-tips-for-designers/)

- **Chat Screen**  
  - Chat history area showing alternating user and system messages.  
  - Text input box with send button.  
  - Microphone button for voice queries with clear recording state (idle/recording/processing).  
  - Sources panel showing supporting snippets for each answer.

- **Safety Dashboard Screen**  
  - Summary cards for Promptfoo test results (e.g., “Hallucination tests: 18/20 passed”).  
  - List or table of failing scenarios with short descriptions.  
  - Timestamp of last safety run.

**Accessibility Requirements:**

- All interactive elements must be reachable by keyboard (tab order logical and predictable). [wcag](https://www.wcag.com/resource/ux-quick-tips-for-designers/)
- Text must meet minimum contrast ratios and provide scalable font sizes. [wcag](https://www.wcag.com/resource/ux-quick-tips-for-designers/)
- ARIA attributes must be used appropriately for screen readers on buttons, dialogs, and dynamic content. [wcag](https://www.wcag.com/resource/ux-quick-tips-for-designers/)

### 4.2 Hardware Interfaces

- Microphone input from system audio APIs via the browser.  
- Speakers/headphones for TTS playback.  
- GPU (RTX 3050 4 GB) accessible via CUDA for LLM and, where beneficial, TTS/STT acceleration. [localllm](https://localllm.in/blog/lm-studio-vram-requirements-for-local-llms)

### 4.3 Software Interfaces

- **LLM Interface**  
  - Sarvam‑1 2B GGUF model loaded via `llama-cpp-python` with quantization (e.g., Q4_K_M) for efficient inference. [github](https://github.com/ggml-org/llama.cpp)
  - API: chat/completion interface accepting prompts and returning generated tokens.

- **STT Interface**  
  - Whisper `small` or `base` multilingual models used via Python bindings, requiring ~1–2 GB VRAM depending on model. [github](https://github.com/openai/whisper)
  - API: audio input → transcript and language code.

- **TTS Interface**  
  - Kokoro‑82M TTS model with Apache‑licensed weights, loaded via PyTorch. [huggingface](https://huggingface.co/hexgrad/Kokoro-82M)
  - API: text input + voice configuration → audio waveform.

- **Vector Store**  
  - ChromaDB or similar local vector database, accessed via Python client for CRUD operations on embeddings.

- **Promptfoo**  
  - CLI or Node‑based integration triggered from the backend, reading test scenarios from configuration files and outputting JSON reports. [deepdocs](https://deepdocs.dev/restful-api-best-practices/)

### 4.4 Communications Interfaces

- All frontend–backend communication shall use RESTful HTTP APIs returning JSON. [strapi](https://strapi.io/blog/restful-api-design-guide-principles-best-practices)
- URL paths must be resource‑oriented (e.g., `/documents`, `/query`) and support CORS for browser access. [strapi](https://strapi.io/blog/restful-api-design-guide-principles-best-practices)
- If authentication is added later, it should follow token‑based authorization (e.g., bearer tokens) without server‑side session state. [strapi](https://strapi.io/blog/restful-api-design-guide-principles-best-practices)

***

## 5. System Architecture

### 5.1 High‑Level Architecture

The system is organized into the following layers:

- **Presentation Layer (Frontend)**  
  - SPA or multi‑page React app calling REST APIs.  
  - Components: UploadView, ChatView, SafetyDashboardView, shared UI components.

- **Application Layer (Backend API)**  
  - FastAPI application exposing endpoints for upload, query, audio delivery, safety reports.  
  - Middleware for logging, request IDs, error handling. [fastapi.tiangolo](https://fastapi.tiangolo.com/tutorial/handling-errors/)

- **Domain / Service Layer**  
  - Document ingestion service (parsing, chunking, embedding).  
  - Retrieval service (similarity search, ranking).  
  - LLM service (prompt formatting, Sarvam‑1 inference). [github](https://github.com/ggml-org/llama.cpp)
  - STT/TTS service (Whisper + Kokoro). [huggingface](https://huggingface.co/hexgrad/Kokoro-82M)
  - Safety service (Promptfoo runner and aggregator). [deepdocs](https://deepdocs.dev/restful-api-best-practices/)

- **Infrastructure Layer**  
  - Model loaders and configuration (paths, quantization, device placement).  
  - Vector store client (ChromaDB).  
  - Logging, configuration management.

### 5.2 Data Flow (Typical Voice Query)

1. User presses microphone button and records speech.  
2. Frontend posts audio to `/query/voice`.  
3. Backend transcribes audio with Whisper and detects language. [github](https://github.com/openai/whisper)
4. Backend runs retrieval over vector store for the transcript.  
5. Backend calls Sarvam‑1 2B via `llama-cpp-python` with a RAG prompt. [huggingface](https://huggingface.co/QuantFactory/sarvam-1-GGUF)
6. Backend generates TTS audio from the answer via Kokoro‑82M. [huggingface](https://huggingface.co/hexgrad/Kokoro-82M)
7. Backend returns transcript, answer, and audio URL; frontend plays audio and renders text.

***

## 6. Non‑Functional Requirements

### 6.1 Performance Requirements

- **NFR‑1**: For typical queries with small–medium document sets, the system should aim for **end‑to‑end latency under 6 seconds** on the target hardware (RTX 3050 4 GB).  
- **NFR‑2**: The system must support at least one concurrent user session smoothly; additional concurrent sessions may incur degraded performance.  
- **NFR‑3**: Sarvam‑1 2B should run in quantized form, using roughly 1.5 GB VRAM, leaving headroom for STT/TTS on the same GPU when possible. [huggingface](https://huggingface.co/QuantFactory/sarvam-1-GGUF)
- **NFR‑4**: Whisper model size should be chosen to balance speed and accuracy; `small` or `base` variants typically require ~1–2 GB VRAM. [github](https://github.com/openai/whisper)

### 6.2 Reliability and Availability

- **NFR‑5**: The system should handle malformed inputs gracefully (corrupt PDFs, empty audio) and return clear error messages without crashing.  
- **NFR‑6**: Critical operations (ingestion, query) should be wrapped in error handling with retries where safe (e.g., vector DB transient errors). [realpython](https://realpython.com/ref/best-practices/exception-handling/)
- **NFR‑7**: The system should be able to restart without data loss, reloading models and re‑connecting to the vector store on startup.

### 6.3 Security Requirements

- **NFR‑8**: All APIs must validate and sanitize inputs to mitigate injection attacks (including prompt injection at the LLM layer via Promptfoo tests). [deepdocs](https://deepdocs.dev/restful-api-best-practices/)
- **NFR‑9**: If deployed over a network, HTTPS must be used, and CORS must be restricted to trusted origins. [strapi](https://strapi.io/blog/restful-api-design-guide-principles-best-practices)
- **NFR‑10**: Uploaded documents should be stored locally in a restricted directory with appropriate file permissions.

### 6.4 Maintainability and Logging

- **NFR‑11**: Code should follow a consistent style guide (e.g., Google Python Style Guide) and be modular, with separate services for ingestion, retrieval, and generation. [llego](https://llego.dev/posts/error-handling-strategies-best-practices-python/)
- **NFR‑12**: The backend shall use structured logging (e.g., JSON logs via Loguru or similar) including request IDs for traceability. [blog.pronus](https://blog.pronus.xyz/en/posts/python/fastapi/how-to-create-structured-and-traceable-logs-in-fastapi-applications/)
- **NFR‑13**: Exceptions should be raised at low levels and caught at FastAPI boundaries, returning HTTP error responses with meaningful messages. [realpython](https://realpython.com/ref/best-practices/exception-handling/)
- **NFR‑14**: Unit tests should cover critical components (parsers, retrievers, safety checks) where time permits.

### 6.5 Portability

- **NFR‑15**: The system should be runnable on both Linux and Windows environments with minimal configuration changes.  
- **NFR‑16**: Model paths and device configuration must be managed via environment variables, without hard‑coded absolute paths.

***

## 7. Open‑Source Components and Licensing

### 7.1 Third‑Party Components

- **Sarvam‑1 2B (GGUF)** – Multilingual LLM optimized for 10 Indic languages (bn, gu, hi, kn, ml, mr, or, pa, ta, te) and English, 2B parameters, efficient inference on modest GPUs. [huggingface](https://huggingface.co/QuantFactory/sarvam-1-GGUF)
- **llama.cpp / llama-cpp-python** – High‑performance C++ backend for GGUF‑format LLMs with Python bindings for local inference. [github](https://github.com/ggml-org/llama.cpp)
- **Whisper** – OpenAI’s multilingual STT model suite, with tiny/base/small/medium/large variants. [github](https://github.com/openai/whisper)
- **Kokoro‑82M** – Lightweight open‑weight TTS model with Apache‑licensed weights suitable for production and personal projects. [huggingface](https://huggingface.co/hexgrad/Kokoro-82M)
- **ChromaDB** – Open‑source embedding database for similarity search.  
- **Promptfoo** – Open‑source framework for prompt/LLM evaluation and testing. [deepdocs](https://deepdocs.dev/restful-api-best-practices/)
- **FastAPI, React, Vite, TypeScript** – Frameworks and tooling for backend and frontend.

### 7.2 Licensing Considerations

- All selected models and libraries must be verified to be compatible with hackathon rules and intended usage (non‑SaaS, local demo, possible future commercial use).  
- Licenses should be documented in a `LICENSES.md` file in the repository with links to original sources.

***

## 8. Future Enhancements

Planned or potential future improvements:

- User authentication and per‑user document separation.  
- Streaming responses from the LLM for faster perceived latency.  
- Cloud deployment with GPU instances and scalable vector storage.  
- Richer analytics in the safety dashboard (e.g., per‑scenario trends, confusion matrices).  
- Additional languages and voices in TTS, and optional integration with cloud STT/TTS APIs when connectivity is available.

***
`
