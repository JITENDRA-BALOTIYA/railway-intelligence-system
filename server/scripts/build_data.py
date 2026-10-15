"""
Builds the registry + training table from two public datasets (see data_raw/).
    python scripts/build_data.py
Outputs: app/data/trains/<no>.json (one per train) and app/data/delay_stats.csv

Rules (kept deliberately conservative):
 * A train is kept only if it is in BOTH datasets and >= 3 stops match by station name.
 * A stop is kept only if it has real delay statistics (cancelled/unknown <= 50% and a
   non-null average) AND a matching timetable entry.
 * Elapsed time is measured from the timetable's true origin departure, so partial routes
   (origin without delay stats) are still positioned correctly. Such trains get route_partial=true.
"""
import argparse, difflib, json, re
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "app" / "data"
PAT = re.compile(r"(.+?) \(arr=([^,]+),dep=([^)]+)\)")
TIME = re.compile(r"\d{1,2}:\d{2}")


def norm(s: str) -> str:
    s = s.lower()
    s = re.sub(r"^(rl|pq|rt)\s+", "", s)
    s = re.sub(r"\b(jn|junction|jct|city|central|cantt|h)\b\.?", "", s)
    return re.sub(r"[^a-z0-9]", "", s)


def train_class(name: str) -> str:
    n = name.lower()
    for k, v in [("vande", "vande_bharat"), ("rajdhani", "rajdhani"), ("shatabdi", "shatabdi"),
                 ("duronto", "duronto"), ("gatimaan", "shatabdi"), ("mail", "mail")]:
        if k in n:
            return v
    return "express"


def mins(t: str) -> int:
    h, m = t.split(":")
    return int(h) * 60 + int(m)


def parse_route(text: str):
    """-> list of (name, arr_abs_min, dep_abs_min) with day rollover resolved from origin dep."""
    raw = []
    for s in text.split(" | "):
        m = PAT.match(s)
        if m:
            raw.append(m.groups())
    out, day, last = [], 0, -1

    def absolute(t):
        nonlocal day, last
        v = mins(t) + day * 1440
        if v < last:
            day += 1
            v += 1440
        last = v
        return v

    for name, arr, dep in raw:
        a = absolute(dep) if arr == "First" and TIME.fullmatch(dep) else (absolute(arr) if TIME.fullmatch(arr) else None)
        d = absolute(dep) if TIME.fullmatch(dep) and arr != "First" else (a if arr == "First" else None)
        if a is None:
            continue
        out.append((name.strip(), a, d if d is not None else a))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timetable", default=str(ROOT / "data_raw" / "IRCTC_cleaned.csv"))
    ap.add_argument("--delays", default=str(ROOT / "data_raw" / "etrain_delays.csv"))
    a = ap.parse_args()

    tt = pd.read_csv(a.timetable).set_index("train_no")
    dl = pd.read_csv(a.delays)
    dl = dl[(dl.pct_cancelled_unknown <= 50) & dl.average_delay_minutes.notna()].copy()

    (DATA / "trains").mkdir(parents=True, exist_ok=True)
    for f in (DATA / "trains").glob("*.json"):
        f.unlink()

    rows, kept, tot, matched, partial = [], 0, 0, 0, 0
    for tno, g in dl.groupby("train_number", sort=False):
        if tno not in tt.index:
            continue
        route = parse_route(tt.loc[tno, "intermediate_stops"])
        if len(route) < 2:
            continue
        origin_dep = route[0][2]
        total_min = route[-1][1] - origin_dep
        if total_min <= 0:
            continue
        keys = {norm(n): i for i, (n, _, _) in enumerate(route)}
        seq = []
        for _, r in g.iterrows():
            tot += 1
            k = norm(r.station_name)
            i = keys.get(k)
            if i is None:
                c = difflib.get_close_matches(k, list(keys), n=1, cutoff=0.8)
                i = keys[c[0]] if c else None
            if i is not None:
                matched += 1
                seq.append((i, r))
        seq = sorted({i: r for i, r in seq}.items())      # unique, timetable order
        if len(seq) < 3:
            continue
        is_partial = seq[0][0] != 0 or seq[-1][0] != len(route) - 1
        partial += is_partial
        stops = []
        for n_, (i, r) in enumerate(seq):
            arr_abs = route[i][1] if i > 0 else route[i][2]
            stops.append({
                "station_code": r.station_code, "station_name": r.station_name.title(),
                "scheduled_time": f"{(arr_abs % 1440) // 60:02d}:{arr_abs % 1440 % 60:02d}",
                "sequence": n_ + 1, "zone": "NA", "day_offset": arr_abs // 1440,
                "elapsed_min": arr_abs - origin_dep,
            })
            rows.append({"train_number": tno, "train_name": r.train_name, "station_code": r.station_code,
                         "elapsed_min": arr_abs - origin_dep, "total_min": total_min,
                         "hour": (arr_abs % 1440) // 60,
                         "average_delay_minutes": r.average_delay_minutes,
                         "pct_right_time": r.pct_right_time, "pct_slight_delay": r.pct_slight_delay,
                         "pct_significant_delay": r.pct_significant_delay})
        name = str(seq[0][1].train_name)
        with open(DATA / "trains" / f"{tno}.json", "w", encoding="utf-8") as f:
            json.dump({
                "train_id": str(tno), "train_name": name, "train_class": train_class(name),
                "corridor_from": route[0][0].replace("RL ", "").replace("PQ ", ""),
                "corridor_to": route[-1][0].replace("RL ", "").replace("PQ ", ""),
                "total_min": total_min, "route_partial": bool(is_partial),
                "verified": False,
                "source": "Timetable: IRCTC_cleaned.csv (public dump, date unknown, NOT NTES-verified). "
                          "Delay stats: etrain.info scrape 2025-09-27 (public Kaggle dump). "
                          "Stops = intersection of both datasets.",
                "stops": stops}, f, indent=1)
        kept += 1
    pd.DataFrame(rows).to_csv(DATA / "delay_stats.csv", index=False)
    print(f"trains written: {kept} ({partial} with partial route); stop rows kept: {len(rows)}; "
          f"name-match rate: {matched}/{tot} = {matched / max(tot, 1):.0%}")


if __name__ == "__main__":
    main()
