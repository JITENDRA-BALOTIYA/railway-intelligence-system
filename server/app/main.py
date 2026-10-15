import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.routers import cascade, meta, predict, trains, weather

app = FastAPI(
    title="RailPulse API",
    description="Dynamic ETA forecast backend (SIH 2026, PS 26028). Real: weather, timetable and delay "
                "statistics, XGBoost model, evaluation. Simulated (labelled): GPS position, TSR, "
                "preceding-train and disruption inputs. See /api/meta.",
    version="1.0.0",
)

origins = [o.strip() for o in os.getenv("RAILPULSE_CORS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False,
                   allow_methods=["*"], allow_headers=["*"])

for r in (meta.router, trains.router, weather.router, predict.router, cascade.router):
    app.include_router(r)

STATIC = Path(__file__).parent / "static"
if (STATIC / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=STATIC / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    async def spa(path: str):
        if path.startswith("api/"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        f = (STATIC / path).resolve()
        if path and f.is_file() and STATIC.resolve() in f.parents:
            return FileResponse(f)
        return FileResponse(STATIC / "index.html")
else:
    @app.get("/", include_in_schema=False)
    async def root():
        return {"service": "RailPulse API", "status": "online", "docs": "/docs",
                "note": "Frontend not built; see README (npm run build)."}
