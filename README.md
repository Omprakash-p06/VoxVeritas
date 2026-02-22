# VoxVeritas

VoxVeritas is a voice-first, multilingual, accessibility-focused RAG system allowing users to query uploaded documents using voice, receiving grounded answers and speech readout.

## Quick Start

**For Linux / macOS:**
```bash
chmod +x run.sh
./run.sh
```

**For Windows:**
```cmd
run.bat
```

## Manual Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   - Linux/macOS: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate.bat`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn src.main:app --host 0.0.0.0 --port 8000
   ```

## LLM Backend (KoboldCpp)

VoxVeritas now uses KoboldCpp as the LLM runtime (instead of `llama-cpp-python` inside FastAPI).

1. Start KoboldCpp separately with your GGUF model and GPU-enabled flags.
2. Ensure the KoboldCpp API is reachable (default):
   - `http://127.0.0.1:5001/api/v1/generate`
3. Optional environment variables before running FastAPI:
   - `KOBOLDCPP_BASE_URL` (default: `http://127.0.0.1:5001`)
   - `KOBOLDCPP_TIMEOUT_SECONDS` (default: `240`)
   - `KOBOLDCPP_CONTEXT_LENGTH` (default: `4096`)
   - `KOBOLDCPP_RAG_MODEL_NAME` (display label only)
   - `KOBOLDCPP_CHAT_MODEL_NAME` (display label only)
