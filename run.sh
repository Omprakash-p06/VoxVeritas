#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "==============================================="
echo "  VoxVeritas Launcher (Backend + Frontend)     "
echo "==============================================="

# Check for Python 3
if ! command -v python3 &> /dev/null
then
    echo "Python 3 could not be found. Please install Python 3."
    exit
fi

# Check for npm
if ! command -v npm &> /dev/null
then
    echo "npm could not be found. Please install Node.js LTS."
    exit
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Install frontend dependencies
echo "Installing frontend dependencies..."
pushd frontend > /dev/null
npm install
popd > /dev/null

# Download required local GGUF model files
echo "Downloading required models (if missing)..."
python scripts/download_models.py --model all

# Export env for backend
export PYTHONPATH="$ROOT_DIR"
export KOBOLDCPP_BASE_URL="${KOBOLDCPP_BASE_URL:-http://127.0.0.1:5001}"

echo "NOTE: KoboldCpp must already be running at $KOBOLDCPP_BASE_URL"
echo "      (Windows users can run run.bat to auto-start koboldcpp.exe)."

# Start backend in background
echo "Starting FastAPI server on http://localhost:8000..."
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend in foreground
echo "Starting frontend on http://localhost:5173..."
pushd frontend > /dev/null
npm run dev
popd > /dev/null

kill "$BACKEND_PID" >/dev/null 2>&1 || true
