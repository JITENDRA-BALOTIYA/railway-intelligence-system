"""
Data-driven registry. Trains live in app/data/trains/<no>.json, delay statistics in
app/data/delay_stats.csv, both produced by scripts/build_data.py from public datasets.
Adding a train = adding a JSON file (+ its delay rows); no code change.
"""
import csv
import json
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional

DATA_DIR = Path(__file__).parent / "data"
TRAINS_DIR = DATA_DIR / "trains"
STATIONS_FILE = DATA_DIR / "stations.json"
STATS_FILE = DATA_DIR / "delay_stats.csv"


@lru_cache(maxsize=1)
def _load_stations() -> Dict[str, dict]:
    if not STATIONS_FILE.exists():
        return {}
    with open(STATIONS_FILE, encoding="utf-8") as f:
        return json.load(f).get("stations", {})


@lru_cache(maxsize=1)
def _load_trains() -> Dict[str, dict]:
    trains: Dict[str, dict] = {}
    if TRAINS_DIR.exists():
        for path in sorted(TRAINS_DIR.glob("*.json")):
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            trains[str(data["train_id"])] = data
    return trains


@lru_cache(maxsize=1)
def _load_stats() -> Dict[str, Dict[str, dict]]:
    """train_id -> station_code -> real stats row."""
    out: Dict[str, Dict[str, dict]] = {}
    if not STATS_FILE.exists():
        return out
    with open(STATS_FILE, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            out.setdefault(str(r["train_number"]), {})[r["station_code"]] = {
                "average_delay_min": float(r["average_delay_minutes"]),
                "pct_right_time": float(r["pct_right_time"]),
                "pct_slight_delay": float(r["pct_slight_delay"]),
                "pct_significant_delay": float(r["pct_significant_delay"]),
            }
    return out


@lru_cache(maxsize=1)
def _station_names() -> Dict[str, str]:
    names: Dict[str, str] = {}
    for t in _load_trains().values():
        for s in t.get("stops", []):
            names.setdefault(s["station_code"], s["station_name"])
    return names


def reload() -> None:
    for fn in (_load_stations, _load_trains, _load_stats, _station_names):
        fn.cache_clear()


def get_train(train_id: str) -> Optional[dict]:
    return _load_trains().get(str(train_id))


def train_stats(train_id: str) -> Dict[str, dict]:
    return _load_stats().get(str(train_id), {})


def typical_delay(train_id: str) -> Optional[float]:
    st = train_stats(train_id)
    if not st:
        return None
    return round(sum(v["average_delay_min"] for v in st.values()) / len(st), 1)


def list_trains() -> List[dict]:
    out = []
    for t in _load_trains().values():
        stops = t.get("stops", [])
        if not stops:
            continue
        out.append({
            "train_id": str(t["train_id"]),
            "train_name": t.get("train_name", ""),
            "train_class": t.get("train_class", "express"),
            "origin": stops[0]["station_code"],
            "origin_name": stops[0]["station_name"],
            "destination": stops[-1]["station_code"],
            "destination_name": stops[-1]["station_name"],
            "stops_count": len(stops),
            "verified": bool(t.get("verified", False)),
            "typical_delay_min": typical_delay(str(t["train_id"])),
        })
    return out


def curated_station(code: str) -> Optional[dict]:
    return _load_stations().get(code)


def station_name(code: str) -> Optional[str]:
    return _station_names().get(code)


def stop_count() -> int:
    return sum(len(t.get("stops", [])) for t in _load_trains().values())
