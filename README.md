# VoxVeritas

VoxVeritas is a voice-first, multilingual, accessibility-focused RAG assistant with:

- Document upload + retrieval (RAG)
- Direct chat mode
- Voice pipeline (STT + TTS)
- Screen OCR context (including browser-captured screenshots)
- KoboldCpp as the LLM runtime backend

## Prerequisites

- **Python 3.11 or 3.12, 64-bit** (required — Python 3.13 and 32-bit builds lack prebuilt wheels for `pydantic-core`, `numpy`, `chromadb`)
- Node.js 18+
- npm
- (Windows) `koboldcpp.exe` in project root

> **Tip:** Verify you have the right Python before creating a venv:
> ```powershell
> py -0   # lists installed versions; look for -V:3.11 or -V:3.12 (64-bit)
> ```

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

Windows (use `py -3.11` to pin the correct interpreter):

```powershell
py -3.11 -m venv venv --without-pip
venv\Scripts\python.exe -m ensurepip
venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel
venv\Scripts\pip.exe install -r requirements.txt
cd frontend; npm install; cd ..
```

Linux/macOS:

```bash
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

> **Note:** `run.bat` calls plain `python -m venv venv` which may pick up an incompatible Python on PATH. If it fails, run the manual steps above instead.

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
venv\Scripts\python.exe -c "import requests; print(requests.get('http://127.0.0.1:5001/api/extra/version',timeout=10).status_code)"
venv\Scripts\python.exe -c "import requests; print(requests.get('http://localhost:8000/health',timeout=10).json())"
```

## Troubleshooting

### `ModuleNotFoundError: No module named 'pydantic_core._pydantic_core'`

This means your venv was created with an incompatible Python (typically Python 3.13 or a 32-bit build). Fix:

```powershell
Remove-Item -Recurse -Force venv
py -3.11 -m venv venv --without-pip
venv\Scripts\python.exe -m ensurepip
venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel
venv\Scripts\pip.exe install -r requirements.txt
```

### `numpy` / `chromadb` fails to build from source

Same root cause — wrong Python version or 32-bit interpreter. Prebuilt wheels for these packages only exist for Python 3.11/3.12 64-bit on Windows. Use `py -3.11` as shown above.

### `pip` bootstrap fails during `py -3.11 -m venv venv`

Network-restricted environments may fail to fetch pip during venv creation. Use `--without-pip` and bootstrap with `ensurepip` (offline/bundled):

```powershell
py -3.11 -m venv venv --without-pip
venv\Scripts\python.exe -m ensurepip
```
