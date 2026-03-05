## NutriScan AI Backend

Backend + ML pipeline for analyzing packaged foods by barcode and providing health insights.

This project is **backend-only** so you can later connect any web/mobile frontend to it.

### Project Structure (initial)

- **backend/**
  - **app.py** – FastAPI app factory and `app` instance.
  - **config.py** – Environment / settings management using `pydantic-settings`.
  - **routes/**
    - **\_\_init\_\_.py** – Route package marker + docs.
    - **scan.py** – Example `/api/scan-product` endpoint that accepts a barcode and returns stubbed product data.
  - **models/**
    - **\_\_init\_\_.py** – Models package marker.
    - **schemas.py** – Pydantic request/response schemas (e.g., `ScanRequest`, `ProductDetails`).
  - **utils/**
    - **\_\_init\_\_.py** – Placeholder for shared utilities.
- **requirements.txt** – Python dependencies with versions.
- **.env.example** – Example environment configuration (copy to `.env` and edit).

Later we will add:

- `services/` for OpenFoodFacts, ML models, LLM/RAG logic.
- `ml/` and `rag/` directories as per your full spec.

### Setup & Running the Server

1. **Create and activate a virtual environment (Windows / PowerShell)**

```powershell
cd "c:\Users\Shikhar\OneDrive\Desktop\Documents\FreshCheck\nutriscan-ai"
python -m venv .venv
.venv\Scripts\Activate.ps1
```

2. **Install dependencies**

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

3. **Create your `.env` file**

Copy the example and fill in real values:

```powershell
copy .env.example .env
```

Then edit `.env` (e.g., set `GEMINI_API_KEY`).

4. **Run the FastAPI server**

From the project root (`nutriscan-ai`):

```powershell
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

5. **Test the API**

- Open interactive docs in your browser: `http://localhost:8000/docs`
- Try:
  - `GET /health` – basic health check.
  - `POST /api/scan-product` with JSON body: `{ "barcode": "1234567890123" }`

This skeleton is designed so that **all ML and RAG logic** will live in dedicated `services/` and `ml/` modules, making it easy to connect any frontend later.

