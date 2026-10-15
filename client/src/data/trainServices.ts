import { StationData } from '../types';
import type { ApiSchedule, ApiTrainSummary } from '../utils/api';

/** Lightweight entry for the train picker (one per train in the API registry). */
export interface TrainListItem {
  id: string;
  number: string;
  name: string;
  category: string;
  route: string;
  typicalDelayMin: number | null;
}

/** Full profile of the selected train, built from the API schedule plus the simulated position. */
export interface TrainServiceProfile {
  id: string;
  number: string;
  name: string;
  category: string;
  route: string;
  destination: string;
  zone: string; // train class label (zone is not in the public dataset)
  heroStationCode: string;
  heroStationName: string;
  heroScheduledTime: string;
  heroPlatform: string;
  activeSection: string;
  stationCount: number;
  currentIndex: number; // simulated position: last stop reached
  stations: StationData[]; // 6-node window shown on the route strip
  routePartial: boolean;
  verified: boolean;
  typicalDelayMin: number | null;
}

const CLASS_LABEL: Record<string, string> = {
  rajdhani: 'RAJDHANI EXPRESS',
  shatabdi: 'SHATABDI EXPRESS',
  vande_bharat: 'VANDE BHARAT EXPRESS',
  duronto: 'DURONTO EXPRESS',
  mail: 'MAIL / EXPRESS',
  express: 'EXPRESS SERVICE',
};

export const classLabel = (c: string) => CLASS_LABEL[c] || c.toUpperCase();

export function toListItem(t: ApiTrainSummary): TrainListItem {
  return {
    id: t.train_id,
    number: t.train_id,
    name: t.train_name,
    category: classLabel(t.train_class),
    route: `${t.origin_name} → ${t.destination_name}`,
    typicalDelayMin: t.typical_delay_min,
  };
}

/** Default simulated position: about a third of the way along, with at least one stop ahead. */
export function defaultPosition(stopCount: number): number {
  return Math.max(0, Math.min(stopCount - 2, Math.floor((stopCount - 1) * 0.35)));
}

const toMin = (hhmm: string, dayOffset: number) =>
  dayOffset * 1440 + parseInt(hhmm.slice(0, 2), 10) * 60 + parseInt(hhmm.slice(3, 5), 10);

export const WINDOW = 6;

export function windowStart(currentIndex: number, n: number): number {
  return Math.max(0, Math.min(currentIndex - 2, n - WINDOW));
}

export function buildProfile(schedule: ApiSchedule, currentIndex: number, listItem?: TrainListItem): TrainServiceProfile {
  const stops = schedule.stops;
  const n = stops.length;
  const c = Math.min(Math.max(currentIndex, 0), n - 2);
  const start = windowStart(c, n);
  const stations: StationData[] = stops.slice(start, start + WINDOW).map((s, k) => {
    const idx = start + k;
    return {
      code: s.station_code,
      name: s.station_name,
      index: idx,
      scheduledTime: s.scheduled_time,
      scheduledMinutes: toMin(s.scheduled_time, s.day_offset),
      status: idx < c ? 'passed' : idx === c ? 'approaching' : idx === c + 1 ? 'next' : 'downstream',
    };
  });
  const hero = stops[c + 1];
  const corridor =
    schedule.corridor_from && schedule.corridor_to
      ? `${schedule.corridor_from} → ${schedule.corridor_to}`
      : listItem?.route || '';
  return {
    id: schedule.train_id,
    number: schedule.train_id,
    name: schedule.train_name,
    category: classLabel(schedule.train_class),
    route: schedule.route_partial ? `${corridor} (partial route in dataset)` : corridor,
    destination: stops[n - 1].station_name,
    zone: schedule.train_class.replace('_', ' ').toUpperCase(),
    heroStationCode: hero.station_code,
    heroStationName: hero.station_name,
    heroScheduledTime: hero.scheduled_time,
    heroPlatform: '—', // platform allocation is not in any public dataset
    activeSection: `${stops[c].station_code}–${hero.station_code}`,
    stationCount: n,
    currentIndex: c,
    stations,
    routePartial: schedule.route_partial,
    verified: schedule.verified,
    typicalDelayMin: listItem?.typicalDelayMin ?? null,
  };
}
