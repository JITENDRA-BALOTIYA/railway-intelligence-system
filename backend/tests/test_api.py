"""Run:  python -m pytest -q     (or)   python tests/test_api.py"""
import json, sys
from pathlib import Path
import httpx
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.main import app                      # noqa: E402
from app import geo, registry                 # noqa: E402
from app.ml import priors as pri              # noqa: E402
from app.routers import weather as weather_mod  # noqa: E402

client = TestClient(app)
BASE = {"train_id": "12951", "current_station_index": 3, "current_delay_min": 4.0}


def kota(resp):
    return next(s for s in resp.json()["stations"] if s["station_code"] == "KOTA")


# ------------------------------------------------------------------ registry / data integrity
def test_health_and_registry():
    h = client.get("/api/health").json()
    assert h["status"] == "ok" and h["model_loaded"] and h["trains"] >= 80
    trains = client.get("/api/trains").json()
    assert len(trains) == h["trains"]
    assert {"12951", "12952", "12301", "22221"} <= {t["train_id"] for t in trains}
    assert all(not t["verified"] for t in trains)       # nothing is claimed NTES-verified


def test_every_train_file_is_consistent():
    for t in registry._load_trains().values():
        stops = t["stops"]
        assert len(stops) >= 3, t["train_id"]
        codes = [s["station_code"] for s in stops]
        assert len(codes) == len(set(codes)), f"duplicate stop in {t['train_id']}"
        el = [s["elapsed_min"] for s in stops]
        assert el == sorted(el), f"stops out of time order in {t['train_id']}"
        assert all(s["day_offset"] >= 0 for s in stops)
        assert t["total_min"] >= el[-1] > -1


def test_schedule_endpoint_and_404():
    r = client.get("/api/schedule/12951")
    assert r.status_code == 200 and r.json()["stops"][0]["station_code"] == "MMCT"
    assert client.get("/api/schedule/00000").status_code == 404


# ------------------------------------------------------------------ model / prediction
def test_eval_beats_baseline_and_is_honest():
    ev = client.get("/api/eval").json()
    assert ev["mae_xgboost_min"] < ev["mae_baseline_global_median_min"]
    assert 0 < ev["p10_p90_coverage"] <= 1 and ev["service_pairs"] < ev["trains"]


def test_predict_endpoint():
    r = client.post("/api/predict", json={"train_id": "12951", "station_code": "KOTA", "current_delay_min": 8})
    j = r.json()
    assert r.status_code == 200 and j["fallback_level"] == "model" and j["is_real_model"]
    assert j["lower_bound_min"] <= j["point_estimate_min"] <= j["upper_bound_min"]
    assert client.post("/api/predict", json={"train_id": "12951", "station_code": "XXXX"}).status_code == 404
    assert client.post("/api/predict", json={"train_id": "99999", "station_code": "KOTA"}).status_code == 404


def test_stats_endpoint_returns_real_rows():
    j = client.get("/api/trains/12951/stats").json()
    assert len(j["stations"]) == 8 and all(s["average_delay_min"] >= 0 for s in j["stations"])


# ------------------------------------------------------------------ cascade
def test_cascade_basic_invariants():
    r = client.post("/api/cascade", json=BASE)
    assert r.status_code == 200
    j = r.json()
    assert j["fallback_level"] == "model" and j["scenario_flags"] == []
    for i, s in enumerate(j["stations"]):
        if i < 3:
            assert s["state"] == "passed"
        else:
            assert 0 <= s["lower_bound_min"] <= s["predicted_delay_min"] <= s["upper_bound_min"]
    assert j["stations"][3]["predicted_delay_min"] == 4.0        # current stop = observed input


@pytest.mark.parametrize("sc,flag", [
    ({"tsr_active": True}, "tsr"),
    ({"preceding_train_delayed": True}, "preceding_train"),
    ({"weather_override_active": True}, "weather_override"),
    ({"injected_disruption_min": 15}, "disruption_injected"),
])
def test_each_scenario_raises_downstream_delay_and_widens_range(sc, flag):
    base = client.post("/api/cascade", json=BASE)
    r = client.post("/api/cascade", json={**BASE, "scenario": sc})
    assert flag in r.json()["scenario_flags"]
    assert kota(r)["predicted_delay_min"] > kota(base)["predicted_delay_min"]
    assert kota(r)["window_minutes"] > kota(base)["window_minutes"]


def test_api_is_stateless_between_requests():
    client.post("/api/cascade", json={**BASE, "scenario": {"tsr_active": True}})
    again = client.post("/api/cascade", json=BASE)
    assert again.json()["scenario_flags"] == []


def test_live_weather_severity_adds_delay():
    a = kota(client.post("/api/cascade", json=BASE))
    b = kota(client.post("/api/cascade", json={**BASE, "weather_severity_index": 0.5}))
    assert b["predicted_delay_min"] == pytest.approx(a["predicted_delay_min"] + 5.0, abs=0.2)


def test_cascade_validation_and_overnight():
    assert client.post("/api/cascade", json={**BASE, "current_station_index": 99}).status_code == 422
    assert client.post("/api/cascade", json={**BASE, "train_id": "nope"}).status_code == 404
    j = client.post("/api/cascade", json={**BASE, "current_delay_min": 60}).json()
    nd = j["stations"][-1]
    assert nd["day_offset"] >= 1 and nd["predicted_time"] != nd["scheduled_time"]


def test_schedule_only_fallback_without_model(monkeypatch):
    monkeypatch.setattr(pri, "ART", Path("/nonexistent"))
    pri.clear_cache()
    try:
        j = client.post("/api/cascade", json=BASE).json()
        assert j["fallback_level"] == "schedule_only"
        assert all(s["predicted_delay_min"] == 4.0 for s in j["stations"][3:])
        assert client.post("/api/predict", json={"train_id": "12951", "station_code": "KOTA"}).json()["fallback_level"] == "schedule_only"
    finally:
        monkeypatch.undo()
        pri.clear_cache()


# ------------------------------------------------------------------ meta
def test_meta_reflects_reality():
    m = client.get("/api/meta").json()
    status = {i["name"]: i["status"] for l in m["layers"] for i in l["items"]}
    assert status["RTIS GPS feed"] == "simulated" and status["XGBoost station-delay model"] == "real_data"
    assert m["counts"]["trains"] >= 80 and m["model"]["evaluation"]


# ------------------------------------------------------------------ weather + geocoding (offline, fake HTTP)
class _Resp:
    def __init__(self, data): self._d = data
    def raise_for_status(self): pass
    def json(self): return self._d


def _install_fake(monkeypatch, state):
    class Fake:
        def __init__(self, *a, **k): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): return False
        async def get(self, url, params=None):
            state["calls"].append(url)
            if state.get("fail"):
                raise httpx.ConnectError("boom")
            if "geocoding" in url:
                return _Resp({"results": [{"name": "Testpur", "latitude": 26.1, "longitude": 80.2, "country_code": "IN"}]})
            return _Resp({"current": {"temperature_2m": 29.0, "precipitation": 0.0, "wind_speed_10m": 10.0, "cloud_cover": 10.0}})
    monkeypatch.setattr(httpx, "AsyncClient", Fake)


def test_weather_cache_stale_and_503(monkeypatch):
    st = {"calls": [], "fail": False}
    _install_fake(monkeypatch, st)
    weather_mod._cache.clear()
    a = client.get("/api/weather/station/KOTA").json()
    b = client.get("/api/weather/station/KOTA").json()
    assert a["cached"] is False and a["is_live"] and a["location_source"] == "curated"
    assert b["cached"] is True and len(st["calls"]) == 1
    for k in list(weather_mod._cache):
        ts, d = weather_mod._cache[k]
        weather_mod._cache[k] = (ts - 10_000, d)
    st["fail"] = True
    c = client.get("/api/weather/station/KOTA")
    assert c.status_code == 200 and c.json()["stale"] is True
    weather_mod._cache.clear()
    assert client.get("/api/weather/station/KOTA").status_code == 503     # never fabricated


def test_falls_back_to_met_no_when_open_meteo_rate_limited(monkeypatch):
    calls = []

    class Fake:
        def __init__(self, *a, **k): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): return False
        async def get(self, url, params=None):
            calls.append(url)
            if "open-meteo" in url:
                raise httpx.HTTPStatusError("429", request=httpx.Request("GET", url),
                                            response=httpx.Response(429))
            return _Resp({"properties": {"timeseries": [{"data": {
                "instant": {"details": {"air_temperature": 31.0, "wind_speed": 5.0, "cloud_area_fraction": 20.0}},
                "next_1_hours": {"details": {"precipitation_amount": 1.5}}}}]}})
    monkeypatch.setattr(httpx, "AsyncClient", Fake)
    weather_mod._cache.clear()
    j = client.get("/api/weather/station/KOTA").json()
    assert j["source"] == "met.no" and j["is_live"] and j["stale"] is False
    assert j["temperature_c"] == 31.0 and abs(j["wind_speed_kmh"] - 18.0) < 1e-6 and j["precipitation_mm"] == 1.5
    weather_mod._cache.clear()


def test_geocoded_station_weather_is_flagged_approximate(monkeypatch, tmp_path):
    st = {"calls": [], "fail": False}
    _install_fake(monkeypatch, st)
    monkeypatch.setattr(geo, "CACHE_FILE", tmp_path / "g.json")
    geo._mem.clear(); geo._loaded = True
    weather_mod._cache.clear()
    code = next(c for c in registry._station_names() if registry.curated_station(c) is None)
    j = client.get(f"/api/weather/station/{code}").json()
    assert j["location_source"] == "geocoded" and j["approximate_location"] and j["place_name"] == "Testpur"
    assert client.get("/api/weather/station/NOPE").status_code == 404
    geo._mem.clear()


def test_geocode_failure_is_not_cached(monkeypatch, tmp_path):
    st = {"calls": [], "fail": True}
    _install_fake(monkeypatch, st)
    monkeypatch.setattr(geo, "CACHE_FILE", tmp_path / "g.json")
    geo._mem.clear(); geo._loaded = True
    import asyncio
    assert asyncio.run(geo.locate("Someplace")) is None and "someplace" not in geo._mem


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-q"]))
