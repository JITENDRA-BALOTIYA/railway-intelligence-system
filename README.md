# Rail Intelligence System · RailPulse (SIH 2026 · PS 26028 · Team CATHODE)

Dynamic train ETA forecasting. **UI** (React + Vite + Tailwind) is deployed on Vercel, **API + model**
(FastAPI + XGBoost) on Render.

## What is real, what is simulated

| Part | Status |
|---|---|
| 88-train timetable (IRCTC public dump) | real data, **not NTES-verified** |
| 1-year per-station delay stats (etrain.info) | real, **aggregate** (not day-specific) |
| XGBoost quantile model (q10/q50/q90) | real, trained here. Backtest on unseen services: MAE 20.96 vs 25.42 min baseline, P10–P90 coverage 72% (target 80%) |
| Live weather (Open-Meteo) | real, via API with cache; shows "NOT APPLIED" if unreachable |
| Train position, delay at current stop, TSR, preceding train, signal failure | **simulated** (no public RTIS/COIS feed exists). Labelled in the UI |
| Weather effect (10 min × severity), 0.4 cascade coefficient | **assumed rules**, exposed at `/api/meta` |

Details and honest Q&A for the jury: `JURY_QA.md`.

## Layout

```
src/            React UI (components unchanged in design; all data comes from the API)
backend/        FastAPI + XGBoost (app/, scripts/build_data.py, tests/, data_raw/)
render.yaml     Render blueprint for the backend (rootDir: backend)
Dockerfile      alternative backend container
```

## Run locally

```bash
# 1) backend (terminal 1)
cd backend
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000

# 2) UI (terminal 2, repo root)
npm install
npm run dev          # http://localhost:3000, /api is proxied to :8000
```

Tests: `cd backend && python -m pytest -q` (19 tests).
Retrain: `cd backend && python scripts/build_data.py && python -m app.ml.train`.

## Deploy

1. **API on Render:** New → Blueprint → select this repo (uses `render.yaml`, `rootDir: backend`).
   Open `https://<your-app>.onrender.com/api/health`.
2. **UI on Vercel:** import this repo (root directory = repo root). Environment variable
   `VITE_API_BASE` = the Render URL (no trailing slash). Redeploy.
3. **CORS:** `RAILPULSE_CORS` in Render must contain the exact Vercel origin
   (preset to `https://railway-intelligence-system.vercel.app`).
4. Render's free tier sleeps after ~15 min idle: open `/api/health` a few minutes before a demo.
   The UI shows "Connecting to the forecast API…" while it wakes up.
