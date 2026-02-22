# run_server.ps1
# Convenience script to start the VoxVeritas FastAPI backend
# Ensures the virtual environment python is used and the PYTHONPATH is set correctly.

$ErrorActionPreference = "Stop"

Write-Host "============================"
Write-Host " Starting VoxVeritas Server "
Write-Host "============================"

# Ensure we are in the project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $projectRoot
Set-Location $projectRoot

# Set PYTHONPATH to the current directory
$env:PYTHONPATH = $PWD.Path

# Default KoboldCpp URL if not explicitly set
if (-not $env:KOBOLDCPP_BASE_URL) {
    $env:KOBOLDCPP_BASE_URL = "http://127.0.0.1:5001"
}

# Check if the virtual environment exists
$pythonExe = Join-Path $PWD.Path "venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Host "ERROR: Virtual environment not found at $pythonExe" -ForegroundColor Red
    Write-Host "Please run 'python -m venv venv' and install dependencies first." -ForegroundColor Yellow
    exit 1
}

# Run the uvicorn server using the venv python module
# This ensures it uses the locally installed 'uvicorn' and 'loguru' packages
Write-Host "Using Python: $pythonExe" -ForegroundColor DarkGray
Write-Host "Starting Uvicorn..." -ForegroundColor Cyan
Write-Host "KoboldCpp URL: $env:KOBOLDCPP_BASE_URL" -ForegroundColor DarkGray
Write-Host "If chat/ask fails, ensure KoboldCpp is running and reachable." -ForegroundColor Yellow

& $pythonExe -m uvicorn src.main:app --host 0.0.0.0 --port 8000
