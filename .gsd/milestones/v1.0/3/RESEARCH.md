# Phase 3 Research: Voice-First Pipeline

## 1. Kokoro TTS (Text-to-Speech)
- **Integration**: Kokoro has a lightweight, official Python pip package (`pip install kokoro`). It runs highly efficiently locally.
- **Dependencies**: Requires `soundfile` and `espeak-ng` (or standard `espeak`) for phonemization if doing advanced English/multilingual stuff, but standard pip install handles the torch inferences.
- **Hardware**: Easily runs on CPU or GPU.
- **Model Storage**: Downloads an `.onnx` or `.pth` model file (around 82M parameters). 
- **Action Plan**: Use the `kokoro` pip package. Generate a `.wav` file or an audio byte stream for playback.

## 2. OpenAI Whisper (Speech-to-Text)
- **Integration**: Official OpenAI package exists (`pip install -U openai-whisper`).
- **Multilingual Support**: By default, standard Whisper models (e.g., `base`, `small`, `medium`) are inherently multilingual and perform automatic language detection and translation/transcription. 
- **Hardware**: For a 4GB VRAM RTX 3050, the `small` (244M params, ~2GB VRAM req) or `base` (74M params, ~1GB VRAM req) models are ideal. We should default to `base` or `small` to avoid OOM errors when the LLM is also loaded.
- **Dependencies**: Requires `ffmpeg` installed on the system path to process raw audio inputs (e.g., microphone recordings). Windows users must have `ffmpeg` available.
- **Action Plan**: Create a generic endpoint that accepts an audio file (e.g., `.wav`), writes it to a `.data/temp_audio/` dir, passes it to Whisper `model.transcribe()`, and returns the extracted text string.
