# VoxVeritas

VoxVeritas is a voice-first, multilingual, accessibility-focused RAG assistant with:

- Document upload + retrieval (RAG)
- Direct chat mode
- Voice pipeline (STT + TTS)
- Screen OCR context (including browser-captured screenshots)
- KoboldCpp as the LLM runtime backend

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- (Windows) `koboldcpp.exe` in project root

## One-command launch (Windows)

`run.bat` now performs the complete flow:

1. Creates/uses `venv`
2. Installs Python dependencies
3. Installs frontend dependencies
4. Downloads required GGUF models into `.data/models`
5. Starts KoboldCpp (Qwen 3B GGUF, GPU offload)
6. Starts backend (`uvicorn`)
7. Starts frontend (`vite`)

Run:

```bat
run.bat
```

Alternative (PowerShell, more controls):

```powershell
./scripts/run_full.ps1
```

Useful options:

```powershell
./scripts/run_full.ps1 -Model qwen
./scripts/run_full.ps1 -Model sarvam -SkipFrontend
./scripts/run_full.ps1 -DryRun
```

Then open:

- Frontend: `http://localhost:5173`
- Backend docs: `http://localhost:8000/docs`
- KoboldCpp API: `http://127.0.0.1:5001`

## One-command launch (Linux/macOS)

`run.sh` now does setup + backend/frontend launch, and expects KoboldCpp to already be running and reachable.

```bash
chmod +x run.sh
./run.sh
```

## Model download script

Use this script to download GGUF files into `.data/models`:

```bash
python scripts/download_models.py --model all
```

Options:

- `--model all` (default)
- `--model qwen`
- `--model sarvam`
- `--model llama`

## Manual run (recommended for debugging)

### 1) Install dependencies

```bash
python -m venv venv
```

Windows:

```bat
venv\Scripts\activate.bat
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

Linux/macOS:

```bash
source venv/bin/activate
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

### 2) Download models

```bash
python scripts/download_models.py --model all
```

### 3) Start KoboldCpp

Windows example:

```powershell
.\koboldcpp.exe --model ".data\models\Qwen2.5-3B-Instruct-Q4_K_M.gguf" --host 127.0.0.1 --port 5001 --contextsize 4096 --usecublas --gpulayers 999
```

### 4) Start backend

```powershell
$env:PYTHONPATH = $PWD.Path
$env:KOBOLDCPP_BASE_URL = "http://127.0.0.1:5001"
venv\Scripts\python.exe -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### 5) Start frontend

```powershell
cd frontend
npm run dev
```

## Environment variables

- `KOBOLDCPP_BASE_URL` (default: `http://127.0.0.1:5001`)
- `KOBOLDCPP_TIMEOUT_SECONDS` (default: `240`)
- `KOBOLDCPP_CONTEXT_LENGTH` (default: `4096`)
- `KOBOLDCPP_RAG_MODEL_NAME` (UI label)
- `KOBOLDCPP_CHAT_MODEL_NAME` (UI label)

## Health checks

```powershell
python -c "import requests; print(requests.get('http://127.0.0.1:5001/api/extra/version',timeout=10).status_code)"
python -c "import requests; print(requests.get('http://localhost:8000/health',timeout=10).json())"
```
