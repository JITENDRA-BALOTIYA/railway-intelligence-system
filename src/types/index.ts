export type DisruptionType = 'none' | 'signal_failure' | 'preceding_train' | 'tsr' | 'level_crossing' | 'severe_weather';

export interface NetworkConditions {
  severeWeather: boolean;
  precedingTrainDelayed: boolean;
  tsrActive: boolean;
  unscheduledDisruption: boolean;
}

export interface DisruptionConfig {
  id: DisruptionType;
  label: string;
  shortLabel: string;
  delayMin: number;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

export interface StationData {
  code: string;
  name: string;
  index: number; // position in the full route (0-based)
  scheduledTime: string; // "HH:MM"
  scheduledMinutes: number; // minutes from start of day
  status: 'passed' | 'approaching' | 'next' | 'downstream';
}

export interface TrainService {
  id: string;
  number: string;
  name: string;
  route: string;
  zone: string;
  scheduledArrival: string;
  scheduledMinutes: number;
  currentStation: string;
  nextStation: string;
  platform: string;
  status: 'On Time' | 'Delayed' | 'Critical';
}

export interface ControlRoomTrain extends TrainService {
  disruption: string;
  delayMinutes: number;
  rangeMinutes: number;
  section: string;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  location: string;
  isLive: boolean;
  severity: number; // 0..1 heuristic from Open-Meteo, fed to the API
  stale: boolean;
  available: boolean;
}

export interface LogEntry {
  id: string;
  time: string;
  type: 'info' | 'warn' | 'success';
  message: string;
}
