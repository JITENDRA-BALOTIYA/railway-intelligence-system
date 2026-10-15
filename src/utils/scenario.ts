import type { ApiScenario } from './api';
import type { NetworkConditions } from '../types';

/**
 * SIMULATED scenario inputs. There is no public RTIS / COIS / TSR feed, so the four switches are
 * assumptions. The numbers are chosen so each switch adds the minutes shown on its label, and they
 * are sent to the API (the API owns the rules: 0.4 cascade coefficient, 10 min x weather severity).
 */
export const SCENARIO_ASSUMPTIONS = {
  weatherSeverity: 0.5, // x 10 min per severity unit (API rule) = +5 min
  precedingTrainDelayMin: 20, // x 0.4 cascade coefficient (API rule) = +8 min
  tsrPenaltyMin: 6,
  disruptionMin: 14,
} as const;

export const SCENARIO_IMPACT_MIN = {
  severeWeather: 5,
  precedingTrainDelayed: 8,
  tsrActive: 6,
  unscheduledDisruption: 14,
} as const;

export function toApiScenario(c: NetworkConditions): ApiScenario {
  return {
    preceding_train_delayed: c.precedingTrainDelayed,
    preceding_train_delay_min: SCENARIO_ASSUMPTIONS.precedingTrainDelayMin,
    tsr_active: c.tsrActive,
    tsr_penalty_min: SCENARIO_ASSUMPTIONS.tsrPenaltyMin,
    weather_override_active: c.severeWeather,
    weather_override_severity: SCENARIO_ASSUMPTIONS.weatherSeverity,
    injected_disruption_min: c.unscheduledDisruption ? SCENARIO_ASSUMPTIONS.disruptionMin : 0,
  };
}

export function cumulativeImpactMin(c: NetworkConditions): number {
  return (
    (c.severeWeather ? SCENARIO_IMPACT_MIN.severeWeather : 0) +
    (c.precedingTrainDelayed ? SCENARIO_IMPACT_MIN.precedingTrainDelayed : 0) +
    (c.tsrActive ? SCENARIO_IMPACT_MIN.tsrActive : 0) +
    (c.unscheduledDisruption ? SCENARIO_IMPACT_MIN.unscheduledDisruption : 0)
  );
}

export const FLAG_REASON: Record<string, string> = {
  disruption_injected: 'Injected signal-failure hold (simulated)',
  weather_override: 'Severe-weather override (simulated, replaces live weather)',
  tsr: 'Temporary speed restriction (simulated)',
  preceding_train: 'Preceding-train cascade, 0.4 x its delay (simulated)',
};
