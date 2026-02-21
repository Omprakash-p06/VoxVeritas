@echo off
echo ===================================
echo     Starting VoxVeritas Setup      
echo ===================================

:: Check for Python
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Python could not be found. Please install Python 3.
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

:: Run the server
echo Starting FastAPI server on http://localhost:8000...
uvicorn src.main:app --host 0.0.0.0 --port 8000
