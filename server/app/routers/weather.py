"""
REAL, LIVE weather (Open-Meteo, free, no key; MET Norway as automatic second provider).

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


MET_NO_URL = "https://api.met.no/weatherapi/locationforecast/2.0/compact"
MET_NO_HEADERS = {"User-Agent": "RailPulse/1.0 github.com/lokesh-kumar-khandelwal/railpulse"}


async def _from_open_meteo(lat: float, lon: float):
    params = {"latitude": lat, "longitude": lon,
              "current": "temperature_2m,precipitation,wind_speed_10m,cloud_cover", "timezone": "auto"}
    async with httpx.AsyncClient(timeout=6.0) as client:
        resp = await client.get(OPEN_METEO_URL, params=params)
        resp.raise_for_status()
        cur = resp.json().get("current", {})
    return (float(cur.get("temperature_2m", 0.0)), float(cur.get("precipitation", 0.0)),
            float(cur.get("wind_speed_10m", 0.0)), float(cur.get("cloud_cover", 0.0)), "open-meteo")


async def _from_met_no(lat: float, lon: float):
    """Second real provider (MET Norway). Used only when Open-Meteo fails, e.g. 429 on a shared host IP."""
    async with httpx.AsyncClient(timeout=8.0, headers=MET_NO_HEADERS) as client:
        resp = await client.get(MET_NO_URL, params={"lat": round(lat, 4), "lon": round(lon, 4)})
        resp.raise_for_status()
        first = resp.json()["properties"]["timeseries"][0]["data"]
    det = first["instant"]["details"]
    nxt = (first.get("next_1_hours") or first.get("next_6_hours") or {}).get("details", {})
    return (float(det.get("air_temperature", 0.0)), float(nxt.get("precipitation_amount", 0.0)),
            float(det.get("wind_speed", 0.0)) * 3.6, float(det.get("cloud_area_fraction", 0.0)), "met.no")


async def fetch_weather(lat: float, lon: float) -> WeatherData:
    key = (round(lat, 2), round(lon, 2))
    now = time.time()
    hit = _cache.get(key)
    if hit and now - hit[0] < CACHE_TTL_SECONDS:
        return hit[1].model_copy(update={"cached": True})
    result, errors = None, []
    for provider in (_from_open_meteo, _from_met_no):
        try:
            result = await provider(lat, lon)
            break
        except (httpx.HTTPError, httpx.TimeoutException, KeyError, IndexError, ValueError) as exc:
            errors.append(f"{provider.__name__}: {exc}")
    if result is None:
        if hit:
            return hit[1].model_copy(update={"cached": True, "stale": True})
        raise HTTPException(status_code=503, detail="Weather providers unreachable: " + " | ".join(errors))
    temp, precip, wind, cloud, source = result
    vis = _visibility_flag(precip, cloud)
    reading = WeatherData(
        temperature_c=temp, precipitation_mm=precip, wind_speed_kmh=wind,
        visibility_flag=vis, severity_index=_severity_index(precip, wind, vis), source=source,
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
