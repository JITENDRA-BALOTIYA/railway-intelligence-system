"""
REAL, LIVE weather (Open-Meteo, free, no key).

Scaling: readings are cached per ~1 km cell for CACHE_TTL_SECONDS, so many trains sharing stations
do not multiply upstream calls. If Open-Meteo fails and an older reading exists it is served with
stale=True (fallback level "last valid observation"); with no reading at all we return 503.
We never fabricate a "clear" reading on failure.
"""
import time
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException, Query

from app import geo, registry
from app.schemas import WeatherData

router = APIRouter(prefix="/api/weather", tags=["weather"])

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
CACHE_TTL_SECONDS = 600

_cache: dict = {}  # (lat, lon) rounded -> (timestamp, WeatherData)


def _severity_index(precip_mm: float, wind_kmh: float, visibility_flag: str) -> float:
    """First-order heuristic 0..1 (NOT calibrated)."""
    score = min(precip_mm / 20.0, 0.5) + min(wind_kmh / 80.0, 0.2)
    score += 0.3 if visibility_flag == "fog" else (0.1 if visibility_flag == "reduced" else 0.0)
    return round(min(score, 1.0), 3)


def _visibility_flag(precip_mm: float, cloud_cover_pct: float) -> str:
    if precip_mm > 2 and cloud_cover_pct > 85:
        return "fog"
    if cloud_cover_pct > 60:
        return "reduced"
    return "clear"


async def fetch_weather(lat: float, lon: float) -> WeatherData:
    key = (round(lat, 2), round(lon, 2))
    now = time.time()
    hit = _cache.get(key)
    if hit and now - hit[0] < CACHE_TTL_SECONDS:
        return hit[1].model_copy(update={"cached": True})
    params = {"latitude": lat, "longitude": lon,
              "current": "temperature_2m,precipitation,wind_speed_10m,cloud_cover", "timezone": "auto"}
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(OPEN_METEO_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
    except (httpx.HTTPError, httpx.TimeoutException) as exc:
        if hit:
            return hit[1].model_copy(update={"cached": True, "stale": True})
        raise HTTPException(status_code=503, detail=f"Open-Meteo unreachable: {exc}")
    cur = data.get("current", {})
    precip, wind, cloud = (float(cur.get(k, 0.0)) for k in ("precipitation", "wind_speed_10m", "cloud_cover"))
    vis = _visibility_flag(precip, cloud)
    reading = WeatherData(
        temperature_c=float(cur.get("temperature_2m", 0.0)), precipitation_mm=precip, wind_speed_kmh=wind,
        visibility_flag=vis, severity_index=_severity_index(precip, wind, vis), source="open-meteo",
        is_live=True, cached=False, stale=False, fetched_at=datetime.now(timezone.utc).isoformat(),
        location_source="coordinates")
    _cache[key] = (now, reading)
    return reading


@router.get("", response_model=WeatherData)
async def get_weather(lat: float = Query(..., ge=-90, le=90), lon: float = Query(..., ge=-180, le=180)):
    return await fetch_weather(lat, lon)


@router.get("/station/{code}", response_model=WeatherData)
async def get_station_weather(code: str):
    st = registry.curated_station(code)
    if st:
        w = await fetch_weather(st["lat"], st["lon"])
        return w.model_copy(update={"place_name": st["name"], "location_source": "curated", "approximate_location": True})
    name = registry.station_name(code)
    if not name:
        raise HTTPException(404, f"Unknown station {code}")
    loc = await geo.locate(name)
    if not loc:
        raise HTTPException(404, f"No coordinates found for {name} ({code}); weather unavailable")
    w = await fetch_weather(loc["lat"], loc["lon"])
    return w.model_copy(update={"place_name": loc["place_name"], "location_source": "geocoded", "approximate_location": True})
