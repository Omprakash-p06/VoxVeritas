# run_evals.ps1
# Script to run the safety evaluations against the active VoxVeritas backend.

Write-Host "=================================================="
Write-Host "  VOXVERITAS: PROMPTFOO SAFETY EVALUATION SUITE   "
Write-Host "=================================================="

# Check if npm is installed
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm is not installed. Promptfoo requires Node.js." -ForegroundColor Red
    exit 1
}

# Warn user to start the backend
Write-Host "Ensure the FastAPI backend is running on http://localhost:8000"
Write-Host "Running: uvicorn src.main:app"
Write-Host "Starting promptfoo evaluation..." -ForegroundColor Cyan

# Run promptfoo using npx pointing to the config file
npx promptfoo@latest eval -c evaluations/promptfooconfig.yaml

Write-Host "`nEvaluation complete. Launching Safety Dashboard..." -ForegroundColor Green
npx promptfoo@latest view -y
