@echo off
setlocal

REM Get the directory of this batch script
set "BASE_DIR=%~dp0"
set "BASE_DIR=%BASE_DIR:~0,-1%"

REM Set Python binary path for ML bridge (checking local .venv first)
if exist "%BASE_DIR%\.venv\Scripts\python.exe" (
    set "PYTHON_BIN=%BASE_DIR%\.venv\Scripts\python.exe"
) else (
    set "PYTHON_BIN=python"
)
set PYTHONWARNINGS=ignore

echo ============================================================
echo Starting NutriScan Dev Server with ML Bridge
echo ============================================================
echo.
echo Python executable: %PYTHON_BIN%
echo Project directory: %BASE_DIR%

REM Start the FastAPI backend in a new command window
echo Starting FastAPI Backend on port 8000...
start "NutriScan Backend" cmd /c "cd /d "%BASE_DIR%" && %PYTHON_BIN% -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload"

REM Change to frontend directory and start Next.js
echo Starting Next.js Frontend on port 3000...
cd /d "%BASE_DIR%\frontend"

echo.
echo The app will be available at:
echo   http://localhost:3000
echo.
echo Note: First request may be slower due to OCR model loading (30-60s).
echo Press Ctrl+C to stop the frontend server.
echo ============================================================
echo.
npm run dev -- --hostname 0.0.0.0

endlocal
