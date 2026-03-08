# NutriScan AI – start both backend (FastAPI) and frontend (Next.js)
# Run from the project root: nutriscan-ai\
# Usage: .\start.ps1

$root = $PSScriptRoot

# ── Activate venv ─────────────────────────────────────────────────────────────
$venv = Join-Path $root "..\..\.venv\Scripts\Activate.ps1"
if (Test-Path $venv) {
    & $venv
} else {
    Write-Warning "venv not found at $venv – using system Python."
}

# ── Backend (FastAPI / uvicorn) ────────────────────────────────────────────────
Write-Host "`n[1/2] Starting FastAPI backend on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
$env:PYTHONPATH = $root
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "cd '$root'; `$env:PYTHONPATH='$root'; python -m uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000" `
    -WindowStyle Normal

Start-Sleep -Seconds 2

# ── Frontend (Next.js) ────────────────────────────────────────────────────────
$frontendDir = Join-Path $root "frontend"
Write-Host "[2/2] Starting Next.js frontend on http://localhost:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "cd '$frontendDir'; npm run dev" `
    -WindowStyle Normal

Write-Host "`n✓ Both servers starting in separate windows." -ForegroundColor Yellow
Write-Host "  Backend  → http://127.0.0.1:8000/docs"
Write-Host "  Frontend → http://localhost:3000"
