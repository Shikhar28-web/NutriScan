<div align="center">

# NutriScan AI

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=900&color=22C55E&center=true&vCenter=true&width=700&lines=Scan+food+products+in+seconds;Get+health+scores+%2B+risk+insights;Powered+by+Next.js+%2B+FastAPI+%2B+ML" alt="NutriScan animated header" />

<!-- <p>
  <img src="https://img.shields.io/badge/Next.js-Frontend-111827?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-059669?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/ML-Scikit--learn%20%7C%20XGBoost-F59E0B?style=for-the-badge" alt="ML" />
</p> -->

</div>

NutriScan AI helps users understand packaged food using:
- Barcode scan
- Product name search
- Image upload (label or barcode)

It returns a health score, disease-risk hints, processing level, ingredient analysis, and better alternatives.

## What You Get

- Fast product scan and lookup
- Health score and risk insights
- OCR-based image analysis
- AI ingredient explanation and chat
- Account login/signup
- Search history saved in SQLite

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: FastAPI, SQLite
- ML: scikit-learn, XGBoost, EasyOCR
- Data source: Open Food Facts

## Project Structure

```text
nutriscan-ai/
  backend/
  frontend/
  ml/
  requirements.txt
  start-dev.bat
```

## Quick Start (Windows)

Use the root launcher to start both services together:

```powershell
cd c:\Users\Shikhar\OneDrive\Desktop\sem4_projects\NutriScan
.\start-dev.bat
```

If you want to run them manually:

```powershell
cd c:\Users\Shikhar\OneDrive\Desktop\sem4_projects\NutriScan\nutriscan-ai

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

cd frontend
npm install
cd ..

# Terminal 1
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2
cd frontend
npm run dev
```

## Run URLs

- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8000
- Backend Docs: http://127.0.0.1:8000/docs

## Environment Files

Copy these example files and fill in your local values:

- `nutriscan-ai/.env.example` for backend settings like `JWT_SECRET_KEY`
- `nutriscan-ai/frontend/.env.local.example` for frontend settings like `GEMINI_API_KEY`

Important values:

```env
# nutriscan-ai/.env
JWT_SECRET_KEY=replace-with-a-long-random-string
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000

# nutriscan-ai/frontend/.env.local
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Troubleshooting

- If `npm run dev -- --hostname 0.0.0.0` fails, use `npm run dev` inside `frontend/`.
- If the chatbot says Gemini is not configured, check `frontend/.env.local` and restart the frontend.
- If backend ML routes fail, make sure the Python virtual environment is activated and dependencies are installed.

## Main API Routes

- POST `/api/scan-product`
- POST `/api/analyze-food`
- POST `/api/analyze-image`
- GET `/api/recommendations`
- POST `/api/chat`
- POST `/api/auth/signup`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`
- GET `/api/auth/history`
- POST `/api/auth/history`

## License

See `LICENSE`.

