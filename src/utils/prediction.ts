import { StationData } from '../types';
import type { ApiCascadeResponse, ApiCascadeStation } from './api';
import { FLAG_REASON } from './scenario';

// Thresholds mirror the API (see /api/meta -> assumptions).
export const ON_TIME_MAX_MIN = 5;

/** Convert "HH:MM" string to minutes from 00:00 */
export function timeToMinutes(timeStr: string): number {
  const [hh, mm] = timeStr.split(':').map(Number);
  return (hh || 0) * 60 + (mm || 0);
}

/** Convert minutes from 00:00 to "HH:MM" string */
export function minutesToTime(totalMinutes: number): string {
  const norm = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hh = Math.floor(norm / 60).toString().padStart(2, '0');
  const mm = Math.floor(norm % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export interface PredictionResult {
  scheduledEta: string;
  predictedEta: string;
  delayMinutes: number;
  rangeMinutes: number; // half-width of the P10-P90 interval
  rangeLower: string;
  rangeUpper: string;
  rangeText: string;
  reason: string;
  isDisrupted: boolean; // at least one simulated scenario is active
  isDelayed: boolean; // beyond the on-time threshold
  fallback: 'model' | 'schedule_only';
}

export type RouteStationWithPrediction = StationData & {
  predictedTime: string;
  delayMin: number;
  rangeMin: number;
  rangeLower: string;
  rangeUpper: string;
  windowText: string;
  stateText: 'ON TIME' | 'DELAYED' | 'PASSED';
};

export function reasonFor(resp: ApiCascadeResponse): string {
  if (resp.scenario_flags.length) return resp.scenario_flags.map((f) => FLAG_REASON[f] || f).join(' • ');
  if (resp.fallback_level === 'schedule_only') return 'Model files unavailable · schedule-only fallback';
  return 'No scenario active · delay propagated from route history (XGBoost priors)';
}

/** Hero card values for one station of the cascade response. */
export function toPrediction(st: ApiCascadeStation, resp: ApiCascadeResponse): PredictionResult {
  const sched = timeToMinutes(st.scheduled_time);
  const lower = minutesToTime(sched + st.lower_bound_min);
  const upper = minutesToTime(sched + st.upper_bound_min);
  const delay = Math.round(st.predicted_delay_min);
  return {
    scheduledEta: st.scheduled_time,
    predictedEta: st.predicted_time,
    delayMinutes: delay,
    rangeMinutes: Math.round(st.window_minutes / 2),
    rangeLower: lower,
    rangeUpper: upper,
    rangeText: `${lower} – ${upper}`,
    reason: reasonFor(resp),
    isDisrupted: resp.scenario_flags.length > 0,
    isDelayed: st.predicted_delay_min > ON_TIME_MAX_MIN,
    fallback: resp.fallback_level,
  };
}

/** Station-by-station table rows (from the API cascade, nothing computed locally). */
export function toRouteRows(resp: ApiCascadeResponse, currentIndex: number, fromIndex: number): RouteStationWithPrediction[] {
  return resp.stations
    .map((st, i) => ({ st, i }))
    .filter(({ i }) => i >= fromIndex)
    .map(({ st, i }) => {
      const passed = st.state === 'passed';
      const delay = Math.round(st.predicted_delay_min);
      const half = Math.round(st.window_minutes / 2);
      const sched = timeToMinutes(st.scheduled_time);
      return {
        code: st.station_code,
        name: st.station_name,
        index: i,
        scheduledTime: st.scheduled_time,
        scheduledMinutes: sched,
        status: i < currentIndex ? 'passed' : i === currentIndex ? 'approaching' : i === currentIndex + 1 ? 'next' : 'downstream',
        predictedTime: st.predicted_time,
        delayMin: delay,
        rangeMin: half,
        rangeLower: minutesToTime(sched + st.lower_bound_min),
        rangeUpper: minutesToTime(sched + st.upper_bound_min),
        windowText: passed ? '—' : `±${half} min`,
        stateText: passed ? 'PASSED' : st.state === 'on_time' ? 'ON TIME' : 'DELAYED',
      } as RouteStationWithPrediction;
    });
}
