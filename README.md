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
