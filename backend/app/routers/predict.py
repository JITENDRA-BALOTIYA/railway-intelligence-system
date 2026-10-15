"""
Single-station prediction + model evaluation.

Honest scope: the model estimates the typical delay at a station (from a 1-year aggregate).
A live delay is carried forward with a data-grounded delta:
    predicted(j) = max(0, delay(j-1) + prior(j) - prior(j-1))
Interval half-widths = spread of typical delay across similar stations (q10..q90), NOT a
guaranteed day-level interval.
"""
import json
from fastapi import APIRouter, HTTPException
from app import registry
from app.ml import priors as pri
from app.schemas import PredictRequest, PredictionResult

router = APIRouter(prefix="/api", tags=["predict"])


@router.post("/predict", response_model=PredictionResult)
async def predict(req: PredictRequest):
    train = registry.get_train(req.train_id)
    if not train:
        raise HTTPException(404, f"Train {req.train_id} not in registry")
    codes = [s["station_code"] for s in train["stops"]]
    if req.station_code not in codes:
        raise HTTPException(404, f"{req.station_code} is not a modelled stop of {req.train_id}")
    j = codes.index(req.station_code)
    p = pri.train_priors(train)
    if p is None:  # fallback level 2: schedule only (no model artifacts)
        d = max(req.current_delay_min, 0.0)
        return PredictionResult(station_code=req.station_code, point_estimate_min=round(d, 1),
                                lower_bound_min=round(d, 1), upper_bound_min=round(d, 1), window_minutes=0.0,
                                model_version="none", is_real_model=False, fallback_level="schedule_only")
    lo, med, hi = p
    point = req.current_delay_min if j == 0 else max(0.0, req.current_delay_min + float(med[j] - med[j - 1]))
    lower, upper = max(point - float(med[j] - lo[j]), 0.0), point + float(hi[j] - med[j])
    return PredictionResult(station_code=req.station_code, point_estimate_min=round(point, 1),
                            lower_bound_min=round(lower, 1), upper_bound_min=round(upper, 1),
                            window_minutes=round(upper - lower, 1), model_version=pri.MODEL_VERSION,
                            is_real_model=True, fallback_level="model")


@router.get("/eval")
async def evaluation():
    p = pri.ART / "eval.json"
    if not p.exists():
        raise HTTPException(503, "No evaluation file. Run: python -m app.ml.train")
    return json.load(open(p))
