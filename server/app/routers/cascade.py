"""
Cascade: propagates delay across the downstream stops using the trained model's route priors,
then applies the SIMULATED scenario rules on top.

Layers (kept separate so the UI can label each honestly):
  1. MODEL      : expected extra delay between consecutive stops = prior(j) - prior(j-1)   [real data]
  2. WEATHER    : severity (live Open-Meteo or override) x WEATHER_MIN_PER_SEVERITY         [assumed rule]
  3. SCENARIO   : TSR penalty, preceding-train effect (0.4 x its delay), injected disruption [simulated]
Scenario inputs arrive in the request, so the API is stateless (safe for many simultaneous viewers).
The delay at the current stop is OBSERVED/simulated input; only downstream stops are predicted.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from app import registry
from app.ml import priors as pri
from app.schemas import CascadeRequest, CascadeResponse, CascadeStationResult

router = APIRouter(prefix="/api/cascade", tags=["cascade"])

# ---- Assumptions: named, exposed at /api/meta, NOT learned from data -------------------------------
CASCADE_COEFFICIENT = 0.4          # share of a preceding train's delay that spills onto this train
DISRUPTION_WIDEN_FACTOR = 2.5      # interval half-widths scale up while a scenario is active
WEATHER_MIN_PER_SEVERITY = 10.0    # extra minutes at severity 1.0 (training data has no weather)
ON_TIME_MAX_MIN = 5.0              # state thresholds (assumed)
MINOR_DELAY_MAX_MIN = 15.0

_BASE = datetime(2000, 1, 1)


def classify(delay_min: float) -> str:
    if delay_min <= ON_TIME_MAX_MIN:
        return "on_time"
    return "minor_delay" if delay_min <= MINOR_DELAY_MAX_MIN else "major_delay"


@router.post("", response_model=CascadeResponse)
async def compute_cascade(req: CascadeRequest):
    train = registry.get_train(req.train_id)
    if not train:
        raise HTTPException(404, f"Train {req.train_id} not in registry")
    stops = train["stops"]
    if req.current_station_index >= len(stops):
        raise HTTPException(422, f"current_station_index must be < {len(stops)}")
    sc = req.scenario

    flags, delay_in = [], req.current_delay_min
    if sc.injected_disruption_min > 0:
        delay_in += sc.injected_disruption_min
        flags.append("disruption_injected")
    weather_sev = req.weather_severity_index
    if sc.weather_override_active:
        weather_sev = sc.weather_override_severity
        flags.append("weather_override")
    adjust = 0.0
    if sc.tsr_active:
        adjust += sc.tsr_penalty_min
        flags.append("tsr")
    if sc.preceding_train_delayed:
        adjust += CASCADE_COEFFICIENT * sc.preceding_train_delay_min
        flags.append("preceding_train")
    weather_adj = WEATHER_MIN_PER_SEVERITY * weather_sev
    widen = DISRUPTION_WIDEN_FACTOR if flags else 1.0

    priors = pri.train_priors(train)
    fallback = "model" if priors is not None else "schedule_only"
    idx0 = req.current_station_index
    results, running = [], delay_in

    for i, stop in enumerate(stops):
        sched = _BASE + timedelta(days=stop["day_offset"], hours=int(stop["scheduled_time"][:2]),
                                  minutes=int(stop["scheduled_time"][3:]))
        if i < idx0:
            results.append(CascadeStationResult(
                station_code=stop["station_code"], station_name=stop["station_name"],
                scheduled_time=stop["scheduled_time"], predicted_time=stop["scheduled_time"],
                day_offset=stop["day_offset"], predicted_delay_min=0, lower_bound_min=0,
                upper_bound_min=0, window_minutes=0, state="passed"))
            continue

        if priors is None:                      # fallback: carry the delay forward unchanged
            point, lower, upper = running, running, running
        else:
            lo, med, hi = priors
            point = running if i == idx0 else max(0.0, running + float(med[i] - med[i - 1]))
            lower, upper = max(point - float(med[i] - lo[i]), 0.0), point + float(hi[i] - med[i])
        if i == idx0 and (adjust or weather_adj):
            point, lower, upper = point + adjust + weather_adj, lower + adjust + weather_adj, upper + adjust + weather_adj
        if widen != 1.0 and fallback == "model":
            lower, upper = point - (point - lower) * widen, point + (upper - point) * widen
        lower = max(lower, 0.0)
        running = point

        pred_dt = sched + timedelta(minutes=point)
        results.append(CascadeStationResult(
            station_code=stop["station_code"], station_name=stop["station_name"],
            scheduled_time=stop["scheduled_time"], predicted_time=pred_dt.strftime("%H:%M"),
            day_offset=(pred_dt.date() - _BASE.date()).days,
            predicted_delay_min=round(point, 1), lower_bound_min=round(lower, 1),
            upper_bound_min=round(upper, 1), window_minutes=round(upper - lower, 1),
            state=classify(point)))

    return CascadeResponse(train_id=req.train_id, fallback_level=fallback, scenario_flags=flags,
                           weather_adjustment_min=round(weather_adj, 1),
                           scenario_adjustment_min=round(adjust, 1),
                           interval_widen_factor=widen, stations=results)
