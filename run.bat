@echo off
setlocal
cd /d "%~dp0"

echo ===============================================
echo   VoxVeritas Full Launcher (KoboldCpp+App)    
echo ===============================================

:: Check for Python
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Python could not be found. Please install Python 3.
    exit /b
)

:: Check for npm
npm --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo npm could not be found. Please install Node.js LTS.
    exit /b
)

:: Create virtual environment if it doesn't exist
IF NOT EXIST "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

:: Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

:: Install frontend dependencies
echo Installing frontend dependencies...
pushd frontend
npm install
popd

:: Download required local GGUF model files
echo Downloading required models (if missing)...
venv\Scripts\python.exe scripts\download_models.py --model all

:: Ensure KoboldCpp executable exists
IF NOT EXIST "koboldcpp.exe" (
    echo ERROR: koboldcpp.exe not found in project root.
    echo Place koboldcpp.exe in this folder and run again.
    exit /b
)

echo Starting KoboldCpp on http://127.0.0.1:5001 ...
start "VoxVeritas - KoboldCpp" cmd /k "cd /d %CD% && koboldcpp.exe --model .data\models\Qwen2.5-3B-Instruct-Q4_K_M.gguf --host 127.0.0.1 --port 5001 --contextsize 4096 --usecublas --gpulayers 999"

timeout /t 5 >nul

:: Start backend
echo Starting backend on http://localhost:8000 ...
start "VoxVeritas - Backend" cmd /k "cd /d %CD% && call venv\Scripts\activate.bat && set PYTHONPATH=%CD% && set KOBOLDCPP_BASE_URL=http://127.0.0.1:5001 && python -m uvicorn src.main:app --host 0.0.0.0 --port 8000"

:: Start frontend
echo Starting frontend on http://localhost:5173 ...
start "VoxVeritas - Frontend" cmd /k "cd /d %CD%\frontend && npm run dev"

echo.
echo VoxVeritas is launching in 3 terminals:
echo   - KoboldCpp: http://127.0.0.1:5001
echo   - Backend  : http://localhost:8000
echo   - Frontend : http://localhost:5173
echo.
echo Open http://localhost:5173 in your browser.
