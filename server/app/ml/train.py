"""
Trains XGBoost on REAL station-wise delay statistics (etrain.info, 1-year aggregate scraped
2025-09-27) and evaluates on UNSEEN TRAINS (GroupKFold by train, so no train appears in both
the fit and the test fold).

Target: typical (average) delay at a station for a train, NOT a single day's delay.
Models: q10 / q50 / q90 quantile regression on log1p(delay).

    python scripts/build_data.py
    python -m app.ml.train
"""
import json
from datetime import datetime, timezone
from pathlib import Path
import numpy as np, pandas as pd
from sklearn.model_selection import GroupKFold
from xgboost import XGBRegressor
from app.ml.features import FEATURES, row

DATA = Path(__file__).parent.parent / "data"
ART = Path(__file__).parent / "artifacts"
PARAMS = dict(n_estimators=150, max_depth=3, learning_rate=0.05, subsample=0.8,
              min_child_weight=5, random_state=7)


def build_table():
    st = pd.read_csv(DATA / "delay_stats.csv")
    cls = {}
    for p in (DATA / "trains").glob("*.json"):
        t = json.load(open(p, encoding="utf-8"))
        cls[int(t["train_id"])] = t["train_class"]
    X = pd.DataFrame([row(r.elapsed_min, r.total_min, cls[r.train_number], r.train_number, r.hour)
                      for r in st.itertuples()])[FEATURES]
    return X, st, [cls[t] for t in st.train_number]


def fit(X, y, alpha):
    return XGBRegressor(objective="reg:quantileerror", quantile_alpha=alpha, **PARAMS).fit(X, y)


def main():
    X, st, classes = build_table()
    y = np.log1p(st.average_delay_minutes.values)
    # Group by SERVICE PAIR (up/down trains 12951/12952 share a group) so the reverse direction of a
    # train can never sit in the training fold while its twin is tested.
    g = ((st.train_number.values + 1) // 2)
    a = st.average_delay_minutes.values
    pred = {q: np.zeros(len(y)) for q in (0.1, 0.5, 0.9)}
    base_glob = np.zeros(len(y)); base_cls = np.zeros(len(y))
    for tr, te in GroupKFold(5).split(X, y, g):
        for q in pred:
            pred[q][te] = np.expm1(fit(X.iloc[tr], y[tr], q).predict(X.iloc[te]))
        base_glob[te] = np.median(a[tr])
        cm = pd.Series(a[tr]).groupby(X.class_code.values[tr]).median()
        base_cls[te] = pd.Series(X.class_code.values[te]).map(cm).fillna(np.median(a[tr])).values
    lo, med, hi = pred[0.1], pred[0.5], pred[0.9]
    lo, hi = np.minimum(lo, med), np.maximum(hi, med)
    mae = lambda p, m=slice(None): float(np.mean(np.abs(p[m] - a[m])))
    by_class = {}
    cl = np.array(classes)
    for c in sorted(set(classes)):
        m = cl == c
        by_class[c] = {"rows": int(m.sum()), "mae_xgboost_min": round(mae(med, m), 1),
                       "mae_baseline_global_median_min": round(mae(base_glob, m), 1)}
    final = {q: fit(X, y, q) for q in (0.1, 0.5, 0.9)}
    imp = dict(zip(FEATURES, (float(v) for v in final[0.5].feature_importances_)))
    ev = {
        "what": "Typical per-station delay, evaluated on unseen services (GroupKFold=5, grouped by up/down train pair)",
        "data": "etrain.info 1-year aggregate scraped 2025-09-27 (public Kaggle dump)",
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "rows": int(len(st)), "trains": int(st.train_number.nunique()),
        "service_pairs": int(len(set(g))),
        "features": FEATURES,
        "mae_xgboost_min": round(mae(med), 2),
        "mae_baseline_global_median_min": round(mae(base_glob), 2),
        "mae_baseline_class_median_min": round(mae(base_cls), 2),
        "p10_p90_coverage": round(float(np.mean((a >= lo) & (a <= hi))), 3),
        "target_coverage": 0.80,
        "by_class": by_class,
        "feature_importance": {k: round(v, 3) for k, v in imp.items()},
        "caveat": "Small data (~90 trains). Predicts the station-typical delay, not a specific day's delay; "
                  "interval = spread of typical delay across similar stations, not guaranteed day-level coverage.",
    }
    ART.mkdir(parents=True, exist_ok=True)
    for q, tag in ((0.1, "lower"), (0.5, "median"), (0.9, "upper")):
        final[q].save_model(str(ART / f"xgb_{tag}.json"))
    json.dump(ev, open(ART / "eval.json", "w"), indent=2)
    print(json.dumps(ev, indent=2))


if __name__ == "__main__":
    main()
