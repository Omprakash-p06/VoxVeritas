# Phase 5 Research: Frontend UI

## Objective
Build a User Interface to interact with the backend FastAPI services, particularly the `/ask_voice` end-to-end RAG pipeline, the screen reader, and the document uploader.

## Requirements & Context
The user stated in the previous prompt:
> "Let's move onto Phase 5 (Frontend UI)?"
And then ran `/plan 5`.

Although ROADMAP.md technically lists "Phase 5: Safety Evaluation", the user explicitly intends Phase 5 to be the "External Frontend Integration" (Goal 1 & 5). We will pivot Phase 5 to be the Frontend UI, and push Safety Evaluation to Phase 6.

## Technology Options

1. **React / Next.js / Vite (External SPA)**
   *   *Pros:* Highly modern, interactive, beautiful UI. Best for a native-like experience.
   *   *Cons:* Requires setting up a whole Node.js/npm ecosystem, dealing with CORS explicitly, and managing a separate repository or folder structure.

2. **Streamlit / Gradio (Python Native)**
   *   *Pros:* Extremely fast to build. Pure Python. No npm required.
   *   *Cons:* Can sometimes feel clunky for highly custom audio recording components. However, Gradio has an excellent built-in `gr.Audio(sources=["microphone"])` component that is perfect for Voice-to-Voice AI applications.

3. **Vanilla HTML/JS/CSS served by FastAPI (Jinja2)**
   *   *Pros:* Zero dependencies. Hosted on the exact same port as the API.
   *   *Cons:* Having to write raw `MediaRecorder` boilerplate in JS to capture the microphone, chunk the blobs, and send `FormData` to the backend.

## Verdict
Given the constraints (local machine, hacking together a pipeline, strict VRAM limits, Python-heavy ecosystem), **Gradio** or a **Custom HTML/JS** page served statically by FastAPI are the best choices.

To guarantee maximum control over the aesthetics and the `read_screen` boolean toggle without introducing another heavy framework, an elegant **Vanilla HTML/JS/CSS** static frontend served directly via FastAPI (`/`) is the most lightweight and professional approach. We don't need to boot up a separate Node server, we just write a sleek UI, capture the mic via `navigator.mediaDevices`, post to `/ask_voice`, and play back the resulting Base64 audio!
