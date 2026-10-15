"""Pydantic contracts. Field names are what the frontend reads."""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class WeatherData(BaseModel):
    temperature_c: float
    precipitation_mm: float
    wind_speed_kmh: float
    visibility_flag: str            # clear | reduced | fog
    severity_index: float           # 0..1 heuristic, NOT calibrated
    source: str = "open-meteo"
    is_live: bool = True
    cached: bool = False
    stale: bool = False             # True when Open-Meteo failed and an older reading was served
    fetched_at: Optional[str] = None
    place_name: Optional[str] = None
    location_source: Optional[str] = None   # curated | geocoded | coordinates
    approximate_location: bool = False


class ScheduleStop(BaseModel):
    station_code: str
    station_name: str
    scheduled_time: str             # HH:MM
    sequence: int
    zone: str = "NA"
    day_offset: int = 0             # 1 = arrives next calendar day


class Schedule(BaseModel):
    train_id: str
    train_name: str
    train_class: str = "express"
    verified: bool = False
    source: Optional[str] = None
    corridor_from: Optional[str] = None
    corridor_to: Optional[str] = None
    route_partial: bool = False
    total_min: Optional[int] = None
    stops: List[ScheduleStop]


class TrainSummary(BaseModel):
    train_id: str
    train_name: str
    train_class: str
    origin: str
    origin_name: str
    destination: str
    destination_name: str
    stops_count: int
    verified: bool
    typical_delay_min: Optional[float] = None   # mean of real per-station average delays


class PredictRequest(BaseModel):
    train_id: str
    station_code: str
    current_delay_min: float = Field(0.0, ge=-30, le=720,
                                     description="Delay at the previous stop (min)")


class PredictionResult(BaseModel):
    station_code: str
    point_estimate_min: float
    lower_bound_min: float
    upper_bound_min: float
    window_minutes: float
    model_version: str
    is_real_model: bool = True
    fallback_level: str = "model"   # model | schedule_only


class ScenarioInput(BaseModel):
    """Simulated inputs (no public RTIS/COIS/TSR feed). Sent by the client, so the API is stateless."""
    preceding_train_delayed: bool = False
    preceding_train_delay_min: float = Field(12.0, ge=0, le=120)
    tsr_active: bool = False
    tsr_penalty_min: float = Field(10.0, ge=0, le=60)
    weather_override_active: bool = False
    weather_override_severity: float = Field(0.85, ge=0, le=1)
    injected_disruption_min: float = Field(0.0, ge=0, le=120)


class CascadeRequest(BaseModel):
    train_id: str
    current_station_index: int = Field(0, ge=0)
    current_delay_min: float = Field(0.0, ge=-30, le=720)
    weather_severity_index: float = Field(0.0, ge=0, le=1)
    scenario: ScenarioInput = ScenarioInput()


class CascadeStationResult(BaseModel):
    station_code: str
    station_name: str
    scheduled_time: str
    predicted_time: str
    day_offset: int = 0
    predicted_delay_min: float
    lower_bound_min: float
    upper_bound_min: float
    window_minutes: float
    state: str                      # passed | on_time | minor_delay | major_delay


class CascadeResponse(BaseModel):
    train_id: str
    fallback_level: str             # model | schedule_only
    scenario_flags: List[str] = []
    weather_adjustment_min: float = 0.0
    scenario_adjustment_min: float = 0.0
    interval_widen_factor: float = 1.0
    stations: List[CascadeStationResult]


class StationStat(BaseModel):
    station_code: str
    station_name: str
    average_delay_min: float
    pct_right_time: float
    pct_slight_delay: float
    pct_significant_delay: float
    model_prior_min: float
    model_prior_low_min: float
    model_prior_high_min: float


class TrainStats(BaseModel):
    train_id: str
    source: str
    stations: List[StationStat]
