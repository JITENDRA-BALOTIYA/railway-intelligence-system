"""System self-description. The UI's 'How it works' tab renders THIS, so its honesty badges can
never drift from what the backend actually does."""
import json
from datetime import datetime, timezone
from fastapi import APIRouter
from app import registry
from app.ml import priors as pri
from app.routers import cascade as cc

router = APIRouter(prefix="/api", tags=["meta"])


def _eval():
    p = pri.ART / "eval.json"
    return json.load(open(p)) if p.exists() else None


@router.get("/health")
async def health():
    return {"status": "ok", "model_loaded": pri.models_available(), "trains": len(registry.list_trains()),
            "time": datetime.now(timezone.utc).isoformat(timespec="seconds")}


@router.get("/meta")
async def meta():
    ev = _eval()
    model_ok = pri.models_available()
    return {
        "project": "RailPulse — Dynamic ETA Forecast (SIH 2026, PS 26028)",
        "counts": {"trains": len(registry.list_trains()), "modelled_stops": registry.stop_count()},
        "model": {"version": pri.MODEL_VERSION if model_ok else None, "type": "XGBoost quantile regression (q10/q50/q90)",
                  "available": model_ok, "evaluation": ev},
        "data_sources": [
            {"id": "timetable", "name": "Train timetable", "status": "real_data",
             "note": "IRCTC_cleaned.csv, public dump, date unknown, NOT verified against NTES."},
            {"id": "delay_stats", "name": "Station delay statistics", "status": "real_data",
             "note": "etrain.info 1-year aggregate scraped 2025-09-27 (public Kaggle dump). Aggregate, not day-by-day."},
            {"id": "weather", "name": "Weather", "status": "live",
             "note": "Open-Meteo forecast API, cached 10 min, stale fallback. Station coordinates curated or geocoded (approximate)."},
            {"id": "rtis", "name": "Train GPS position (RTIS)", "status": "simulated",
             "note": "No public API; needs a CRIS/zonal-railway agreement. The UI position/delay are user-set inputs."},
            {"id": "tsr", "name": "TSR / signals / control office (COIS)", "status": "simulated",
             "note": "No public feed. Modelled as labelled scenario rules."},
        ],
        "layers": [
            {"layer": "Data acquisition", "items": [
                {"name": "Open-Meteo weather", "status": "live"},
                {"name": "Timetable dataset", "status": "real_data"},
                {"name": "Historical delay statistics", "status": "real_data"},
                {"name": "RTIS GPS feed", "status": "simulated"},
                {"name": "TSR / COIS signals", "status": "simulated"}]},
            {"layer": "Processing & features", "items": [
                {"name": "Schema validation (Pydantic)", "status": "live"},
                {"name": "Route-time feature builder (shared by train & serve)", "status": "live"},
                {"name": "Data-driven train registry (JSON per train)", "status": "live"},
                {"name": "PostgreSQL + Redis feature store", "status": "planned"}]},
            {"layer": "ETA intelligence", "items": [
                {"name": "XGBoost station-delay model", "status": "real_data" if model_ok else "planned"},
                {"name": "Delay propagation along the route", "status": "live"},
                {"name": "Weather / TSR / preceding-train rules", "status": "simulated"},
                {"name": "Hold-out evaluation vs baselines", "status": "live" if ev else "planned"},
                {"name": "Drift monitoring & retraining", "status": "planned"}]},
            {"layer": "Service & delivery", "items": [
                {"name": "FastAPI REST contract", "status": "live"},
                {"name": "WebSocket push", "status": "planned"},
                {"name": "Redis forecast cache", "status": "planned"}]},
            {"layer": "Decision interfaces", "items": [
                {"name": "Operations console", "status": "live"},
                {"name": "Passenger card", "status": "live"},
                {"name": "Station board", "status": "live"},
                {"name": "Partner integrations (NTES/UTS)", "status": "planned"}]},
        ],
        "assumptions": {
            "cascade_coefficient": cc.CASCADE_COEFFICIENT,
            "disruption_widen_factor": cc.DISRUPTION_WIDEN_FACTOR,
            "weather_min_per_severity": cc.WEATHER_MIN_PER_SEVERITY,
            "on_time_max_min": cc.ON_TIME_MAX_MIN,
            "minor_delay_max_min": cc.MINOR_DELAY_MAX_MIN,
            "note": "Assumed constants, not learned from data (no weather/TSR/preceding-train signal in the training set).",
        },
        "fallback_chain": [
            "1. Model priors + live delay", "2. Last valid weather reading (marked stale)",
            "3. Weather unavailable: not applied, never faked", "4. Schedule only (no model artifacts)"],
        "limitations": [
            "The model predicts the typical delay at a station (1-year aggregate), not a specific day's delay.",
            "P10–P90 is the spread across similar stations; measured hold-out coverage is in the evaluation block.",
            "Timetables come from a public dump and are not NTES-verified.",
            "Train position/delay inputs are simulated; no RTIS access.",
            "Row-level, day-by-day training needs a data collector or an official feed (roadmap)."],
    }
