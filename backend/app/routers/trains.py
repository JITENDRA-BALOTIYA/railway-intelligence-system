from typing import List
from fastapi import APIRouter, HTTPException
from app import registry
from app.ml import priors as pri
from app.schemas import Schedule, StationStat, TrainStats, TrainSummary

router = APIRouter(prefix="/api", tags=["registry"])


@router.get("/trains", response_model=List[TrainSummary])
async def list_trains():
    """Every train the backend knows. The UI builds its dropdown from this."""
    return registry.list_trains()


@router.get("/schedule/{train_id}", response_model=Schedule)
async def get_schedule(train_id: str):
    t = registry.get_train(train_id)
    if not t:
        raise HTTPException(404, f"No schedule data for train {train_id}")
    return Schedule(**{**t, "stops": [{k: v for k, v in s.items() if k != "elapsed_min"} for s in t["stops"]]})


@router.get("/trains/{train_id}/stats", response_model=TrainStats)
async def train_stats(train_id: str):
    """REAL historical per-station statistics (etrain.info aggregate) next to the model's prior."""
    t = registry.get_train(train_id)
    if not t:
        raise HTTPException(404, f"Train {train_id} not in registry")
    real = registry.train_stats(train_id)
    p = pri.train_priors(t)
    out = []
    for i, s in enumerate(t["stops"]):
        r = real.get(s["station_code"])
        if not r:
            continue
        lo, med, hi = (p[0][i], p[1][i], p[2][i]) if p is not None else (0.0, 0.0, 0.0)
        out.append(StationStat(station_code=s["station_code"], station_name=s["station_name"],
                               average_delay_min=r["average_delay_min"], pct_right_time=r["pct_right_time"],
                               pct_slight_delay=r["pct_slight_delay"], pct_significant_delay=r["pct_significant_delay"],
                               model_prior_min=round(float(med), 1), model_prior_low_min=round(float(lo), 1),
                               model_prior_high_min=round(float(hi), 1)))
    return TrainStats(train_id=train_id, source="etrain.info 1-year aggregate, scraped 2025-09-27 (public Kaggle dump)",
                      stations=out)


@router.post("/registry/reload")
async def reload_registry():
    registry.reload()
    pri.clear_cache()
    return {"trains": len(registry.list_trains())}
