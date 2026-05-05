@echo off
setlocal

REM Get the directory of this batch script
set "BASE_DIR=%~dp0"
if "%BASE_DIR:~-1%"=="\" set "BASE_DIR=%BASE_DIR:~0,-1%"

set "PROJECT_DIR=%BASE_DIR%"
set "FRONTEND_DIR=%PROJECT_DIR%\frontend"
set "BACKEND_HOST=127.0.0.1"
set "BACKEND_PORT=8000"
set "PYTHONWARNINGS=ignore"

REM Set Python binary path for ML bridge (checking local .venv first, then parent .venv)
if exist "%BASE_DIR%\.venv\Scripts\python.exe" (
	set "PYTHON_BIN=%BASE_DIR%\.venv\Scripts\python.exe"
) else if exist "%BASE_DIR%\..\.venv\Scripts\python.exe" (
	set "PYTHON_BIN=%BASE_DIR%\..\.venv\Scripts\python.exe"
) else (
	set "PYTHON_BIN=python"
)

echo ============================================================
echo Starting NutriScan Dev Server with ML Bridge
echo ============================================================
echo.
echo Python executable: %PYTHON_BIN%
echo Project directory: %PROJECT_DIR%
echo Frontend directory: %FRONTEND_DIR%
echo Backend host: %BACKEND_HOST%:%BACKEND_PORT%
if not exist "%PYTHON_BIN%" (
	echo [WARN] Python venv executable not found at configured path.
	echo [WARN] ML routes may fail until a valid venv is available.
)

echo.
echo The app will be available at:
echo   http://localhost:3000
echo.
echo Note: First request may be slower due to OCR model loading (30-60s).
echo Press Ctrl+C to stop the servers.
echo ============================================================
echo.

REM Start the FastAPI backend in a new command window
start "NutriScan Backend" cmd /c "cd /d \"%PROJECT_DIR%\" && \"%PYTHON_BIN%\" -m uvicorn backend.app:app --host %BACKEND_HOST% --port %BACKEND_PORT% --reload"

REM Start Next.js frontend in a new command window
start "NutriScan Frontend" cmd /c "cd /d \"%FRONTEND_DIR%\" && npm run dev"

endlocal
