"""
Model inference. For each registry train the model's per-stop priors (q10/q50/q90 typical
delay, minutes) are computed once and cached; propagation is then simple arithmetic, so a
100-stop cascade costs 3 batch predictions, not 300 single ones.
"""
from functools import lru_cache
from pathlib import Path
from typing import Optional, Tuple
import numpy as np
import pandas as pd
import xgboost as xgb
from app.ml.features import FEATURES, row

ART = Path(__file__).parent / "artifacts"
MODEL_VERSION = "xgb-station-prior-v3"
_models: dict = {}


def models_available() -> bool:
    return all((ART / f"xgb_{t}.json").exists() for t in ("lower", "median", "upper"))


def _load():
    if _models:
        return
    for tag in ("lower", "median", "upper"):
        m = xgb.XGBRegressor()
        m.load_model(str(ART / f"xgb_{tag}.json"))
        _models[tag] = m


def clear_cache():
    _models.clear()
    priors_for.cache_clear()


@lru_cache(maxsize=512)
def priors_for(train_id: str, stops_key: tuple, train_class: str):
    """Returns (lo, med, hi) numpy arrays aligned with the stops, or None if no model.
    stops_key = tuple of (elapsed_min, total_min, hour) per stop (hashable cache key)."""
    if not models_available():
        return None
    _load()
    X = pd.DataFrame([row(e, tm, train_class, int(train_id), h) for e, tm, h in stops_key])[FEATURES]
    lo, med, hi = (np.expm1(_models[t].predict(X)).astype(np.float64) for t in ("lower", "median", "upper"))
    lo, hi = np.minimum(lo, med), np.maximum(hi, med)
    return np.maximum(lo, 0.0), np.maximum(med, 0.0), np.maximum(hi, 0.0)


def train_priors(train: dict) -> Optional[Tuple[np.ndarray, np.ndarray, np.ndarray]]:
    key = tuple((s["elapsed_min"], train["total_min"], int(s["scheduled_time"][:2])) for s in train["stops"])
    return priors_for(str(train["train_id"]), key, train.get("train_class", "express"))
