#!/bin/bash

echo "==================================="
echo "    Starting VoxVeritas Setup      "
echo "==================================="

# Check for Python 3
if ! command -v python3 &> /dev/null
then
    echo "Python 3 could not be found. Please install Python 3."
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

# Run the server
echo "Starting FastAPI server on http://localhost:8000..."
uvicorn src.main:app --host 0.0.0.0 --port 8000
