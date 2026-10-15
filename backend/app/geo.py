"""
Station -> coordinates. Order: curated stations.json, then Open-Meteo geocoding by station name
(free, no key), cached in memory and in app/data/geocode_cache.json. Geocoded points are
APPROXIMATE (a place named like the station), and the API says so. Nothing is invented when
geocoding fails: the caller gets None and the UI shows 'weather unavailable'.
"""
import json
import re
from pathlib import Path
from typing import Optional
import httpx

GEO_URL = "https://geocoding-api.open-meteo.com/v1/search"
CACHE_FILE = Path(__file__).parent / "data" / "geocode_cache.json"
_mem: dict = {}
_loaded = False


def _load_disk():
    global _loaded
    if _loaded:
        return
    _loaded = True
    try:
        _mem.update(json.loads(CACHE_FILE.read_text(encoding="utf-8")))
    except Exception:
        pass


def _save_disk():
    try:
        CACHE_FILE.write_text(json.dumps({k: v for k, v in _mem.items() if v}, indent=1), encoding="utf-8")
    except Exception:
        pass  # read-only filesystems (some hosts) are fine; memory cache still works


def _candidates(name: str):
    base = re.sub(r"\s+", " ", name).strip()
    stripped = re.sub(r"\b(jn|junction|jct|central|cantt|city|nrth|north|south|h)\b\.?", "", base, flags=re.I).strip()
    seen = []
    for c in (base, stripped):
        if c and c not in seen:
            seen.append(c)
    return seen


async def locate(name: str) -> Optional[dict]:
    _load_disk()
    key = name.strip().lower()
    if key in _mem:
        return _mem[key]
    for cand in _candidates(name):
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                r = await client.get(GEO_URL, params={"name": cand, "count": 5, "language": "en", "countryCode": "IN"})
                r.raise_for_status()
                results = r.json().get("results") or []
        except (httpx.HTTPError, httpx.TimeoutException, ValueError):
            return None            # network problem: do NOT cache a negative result
        results = [x for x in results if x.get("country_code", "IN") == "IN"]
        if results:
            x = results[0]
            hit = {"lat": float(x["latitude"]), "lon": float(x["longitude"]),
                   "place_name": x.get("name", cand), "admin": x.get("admin1")}
            _mem[key] = hit
            _save_disk()
            return hit
    _mem[key] = None               # searched successfully, nothing found
    return None
