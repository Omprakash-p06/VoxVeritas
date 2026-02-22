param(
    [ValidateSet('qwen', 'sarvam', 'llama')]
    [string]$Model = 'qwen',
    [switch]$SkipInstall,
    [switch]$SkipModelDownload,
    [switch]$SkipKobold,
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Invoke-OrPreview([string]$Command) {
    if ($DryRun) {
        Write-Host "[DryRun] $Command" -ForegroundColor Yellow
        return
    }
    Invoke-Expression $Command
}

function Stop-PortListener([int]$Port) {
    $lines = netstat -ano | Select-String (":$Port.*LISTENING")
    if (-not $lines) { return }

    foreach ($line in $lines) {
        $parts = ($line.Line -split '\s+') | Where-Object { $_ }
        $procId = $parts[-1]
        if ($procId -and $procId -ne '0') {
            try {
                Stop-Process -Id ([int]$procId) -Force -ErrorAction Stop
                Write-Host "Stopped PID $procId on port $Port" -ForegroundColor DarkYellow
            } catch {
                Write-Host "Could not stop PID $procId on port $Port" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host '=============================================='
Write-Host ' VoxVeritas Full Launcher (PowerShell)'
Write-Host '=============================================='

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $projectRoot
Set-Location $projectRoot

$pythonExe = Join-Path $projectRoot 'venv\Scripts\python.exe'
$frontendDir = Join-Path $projectRoot 'frontend'
$koboldExe = Join-Path $projectRoot 'koboldcpp.exe'

Write-Step 'Checking prerequisites'
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw 'Python is not installed or not available on PATH.'
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'npm is not installed or not available on PATH.'
}

if (-not (Test-Path $pythonExe)) {
    Write-Step 'Creating Python virtual environment'
    Invoke-OrPreview "python -m venv `"$projectRoot\venv`""
}

if (-not $SkipInstall) {
    Write-Step 'Installing Python and frontend dependencies'
    Invoke-OrPreview "& `"$pythonExe`" -m pip install -r `"$projectRoot\requirements.txt`""
    Invoke-OrPreview "Set-Location `"$frontendDir`"; npm install; Set-Location `"$projectRoot`""
} else {
    Write-Host 'Skipping dependency installation.' -ForegroundColor DarkGray
}

if (-not $SkipModelDownload) {
    Write-Step "Ensuring model files exist (.data/models) for profile '$Model'"
    Invoke-OrPreview "& `"$pythonExe`" `"$projectRoot\scripts\download_models.py`" --model $Model"
} else {
    Write-Host 'Skipping model download.' -ForegroundColor DarkGray
}

if (-not $SkipKobold) {
    Write-Step 'Preparing KoboldCpp service'
    if (-not (Test-Path $koboldExe)) {
        throw "koboldcpp.exe not found at $koboldExe"
    }

    $modelPath = switch ($Model) {
        'qwen' { Join-Path $projectRoot '.data\models\Qwen2.5-3B-Instruct-Q4_K_M.gguf' }
        'sarvam' { Join-Path $projectRoot '.data\models\sarvam-1-Q4_K_M.gguf' }
        'llama' { Join-Path $projectRoot '.data\models\Llama-3.2-3B-Instruct-Q4_K_M.gguf' }
    }

    if (-not (Test-Path $modelPath)) {
        throw "Model file not found: $modelPath"
    }

    Stop-PortListener -Port 5001

    $koboldCmd = "Set-Location '$projectRoot'; .\koboldcpp.exe --model '$modelPath' --host 127.0.0.1 --port 5001 --contextsize 4096 --usecublas --gpulayers 999"
    if ($DryRun) {
        Write-Host "[DryRun] Start KoboldCpp: $koboldCmd" -ForegroundColor Yellow
    } else {
        Start-Process powershell -ArgumentList @('-NoExit', '-Command', $koboldCmd) -WindowStyle Normal
    }

    if (-not $DryRun) {
        Write-Host 'Waiting for KoboldCpp API (http://127.0.0.1:5001)...' -ForegroundColor DarkGray
        $ready = $false
        for ($i = 0; $i -lt 60; $i++) {
            Start-Sleep -Seconds 2
            try {
                $status = & $pythonExe -c "import requests; print(requests.get('http://127.0.0.1:5001/api/extra/version', timeout=3).status_code)"
                if ($status -match '200') {
                    $ready = $true
                    break
                }
            } catch {}
        }
        if (-not $ready) {
            Write-Host 'KoboldCpp did not become ready yet. Backend may fail until it is up.' -ForegroundColor Yellow
        }
    }
} else {
    Write-Host 'Skipping KoboldCpp launch.' -ForegroundColor DarkGray
}

if (-not $SkipBackend) {
    Write-Step 'Starting backend (uvicorn on :8000)'
    Stop-PortListener -Port 8000

    $backendCmd = "Set-Location '$projectRoot'; `$env:PYTHONPATH='$projectRoot'; `$env:KOBOLDCPP_BASE_URL='http://127.0.0.1:5001'; & '$pythonExe' -m uvicorn src.main:app --host 0.0.0.0 --port 8000"
    if ($DryRun) {
        Write-Host "[DryRun] Start Backend: $backendCmd" -ForegroundColor Yellow
    } else {
        Start-Process powershell -ArgumentList @('-NoExit', '-Command', $backendCmd) -WindowStyle Normal
    }
} else {
    Write-Host 'Skipping backend launch.' -ForegroundColor DarkGray
}

if (-not $SkipFrontend) {
    Write-Step 'Starting frontend (Vite on :5173)'
    Stop-PortListener -Port 5173

    $frontendCmd = "Set-Location '$frontendDir'; npm run dev"
    if ($DryRun) {
        Write-Host "[DryRun] Start Frontend: $frontendCmd" -ForegroundColor Yellow
    } else {
        Start-Process powershell -ArgumentList @('-NoExit', '-Command', $frontendCmd) -WindowStyle Normal
    }
} else {
    Write-Host 'Skipping frontend launch.' -ForegroundColor DarkGray
}

Write-Host "`nLaunched services:" -ForegroundColor Green
Write-Host "- KoboldCpp: http://127.0.0.1:5001" -ForegroundColor Green
Write-Host "- Backend  : http://localhost:8000" -ForegroundColor Green
Write-Host "- Frontend : http://localhost:5173" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`nDry run completed (no processes started)." -ForegroundColor Yellow
}
