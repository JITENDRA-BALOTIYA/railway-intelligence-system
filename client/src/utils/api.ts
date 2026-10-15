// All network access lives here. Same-origin by default; when the UI is hosted separately
// (Vercel) set VITE_API_BASE to the API origin (Render), e.g. https://railpulse-xxxx.onrender.com
const BASE = ((import.meta.env.VITE_API_BASE as string | undefined) || '').replace(/\/$/, '');

export interface ApiTrainSummary {
  train_id: string;
  train_name: string;
  train_class: string;
  origin: string;
  origin_name: string;
  destination: string;
  destination_name: string;
  stops_count: number;
  verified: boolean;
  typical_delay_min: number | null;
}

export interface ApiScheduleStop {
  station_code: string;
  station_name: string;
  scheduled_time: string;
  sequence: number;
  day_offset: number;
}

export interface ApiSchedule {
  train_id: string;
  train_name: string;
  train_class: string;
  verified: boolean;
  source?: string;
  corridor_from?: string;
  corridor_to?: string;
  route_partial: boolean;
  total_min?: number;
  stops: ApiScheduleStop[];
}

export interface ApiStationStat {
  station_code: string;
  station_name: string;
  average_delay_min: number;
  pct_right_time: number;
  model_prior_min: number;
  model_prior_low_min: number;
  model_prior_high_min: number;
}

export interface ApiScenario {
  preceding_train_delayed: boolean;
  preceding_train_delay_min: number;
  tsr_active: boolean;
  tsr_penalty_min: number;
  weather_override_active: boolean;
  weather_override_severity: number;
  injected_disruption_min: number;
}

export interface ApiCascadeRequest {
  train_id: string;
  current_station_index: number;
  current_delay_min: number;
  weather_severity_index: number;
  scenario: ApiScenario;
}

export interface ApiCascadeStation {
  station_code: string;
  station_name: string;
  scheduled_time: string;
  predicted_time: string;
  day_offset: number;
  predicted_delay_min: number;
  lower_bound_min: number;
  upper_bound_min: number;
  window_minutes: number;
  state: 'passed' | 'on_time' | 'minor_delay' | 'major_delay';
}

export interface ApiCascadeResponse {
  train_id: string;
  fallback_level: 'model' | 'schedule_only';
  scenario_flags: string[];
  weather_adjustment_min: number;
  scenario_adjustment_min: number;
  interval_widen_factor: number;
  stations: ApiCascadeStation[];
}

export interface ApiWeather {
  temperature_c: number;
  precipitation_mm: number;
  wind_speed_kmh: number;
  visibility_flag: string;
  severity_index: number;
  is_live: boolean;
  cached: boolean;
  stale: boolean;
  place_name?: string;
}

export interface ApiEval {
  what: string;
  data: string;
  trained_at: string;
  rows: number;
  trains: number;
  mae_xgboost_min: number;
  mae_baseline_global_median_min: number;
  mae_baseline_class_median_min: number;
  p10_p90_coverage: number;
  target_coverage: number;
  by_class: Record<string, { rows: number; mae_xgboost_min: number; mae_baseline_global_median_min: number }>;
  caveat: string;
}

export interface ApiMeta {
  counts: Record<string, number>;
  model: { version: string; type: string; available: boolean; evaluation?: ApiEval };
  layers: Array<{ layer: string; items: Array<{ name: string; status: string }> }>;
  assumptions: Record<string, unknown>;
  limitations: string[];
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit, timeoutMs = 90000): Promise<T> {
  const controller = new AbortController();
  // Render's free tier needs up to ~1 min to wake: be patient on the first call.
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(BASE + path, { ...options, signal: controller.signal });
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* non-JSON error body */
    }
    if (!res.ok) {
      const detail = (body as { detail?: string } | null)?.detail;
      throw new ApiError(detail || `HTTP ${res.status}`, res.status);
    }
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  trains: () => request<ApiTrainSummary[]>('/api/trains'),
  schedule: (id: string) => request<ApiSchedule>(`/api/schedule/${id}`),
  stats: (id: string) => request<{ stations: ApiStationStat[] }>(`/api/trains/${id}/stats`),
  evaluation: () => request<ApiEval>('/api/eval'),
  meta: () => request<ApiMeta>('/api/meta'),
  weather: (code: string) => request<ApiWeather>(`/api/weather/station/${code}`, undefined, 8000),
  cascade: (payload: ApiCascadeRequest) =>
    request<ApiCascadeResponse>('/api/cascade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 20000),
};
