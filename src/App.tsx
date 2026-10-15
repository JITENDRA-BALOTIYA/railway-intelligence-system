import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TrainServiceBar } from './components/TrainServiceBar';
import { CockpitDashboard } from './components/CockpitDashboard';
import { SystemPerspectivesTabs, BoardRow } from './components/SystemPerspectivesTabs';
import { StationNode } from './components/PredictedArrivalHero';
import { HowItWorksPage } from './components/HowItWorksPage';
import { ApiStatusPanel } from './components/ApiStatusPanel';
import { NetworkConditions, WeatherInfo, LogEntry } from './types';
import { toPrediction, toRouteRows } from './utils/prediction';
import { fetchStationWeather, WEATHER_UNAVAILABLE } from './utils/weather';
import { toApiScenario, SCENARIO_IMPACT_MIN } from './utils/scenario';
import { api, ApiCascadeResponse, ApiEval, ApiSchedule, ApiStationStat } from './utils/api';
import { TrainListItem, buildProfile, defaultPosition, toListItem, windowStart, WINDOW } from './data/trainServices';

const NO_CONDITIONS: NetworkConditions = {
  severeWeather: false,
  precedingTrainDelayed: false,
  tsrActive: false,
  unscheduledDisruption: false,
};

const PREFERRED_BOARD = ['12951', '12002', '12954', '12301', '12952'];

/** Real average delay (etrain.info, 1 year) at a stop; used as the starting "observed" delay. */
function typicalAt(stats: ApiStationStat[] | null, code: string): number {
  const s = stats?.find((x) => x.station_code === code);
  return s ? Math.max(0, Math.round(s.average_delay_min)) : 0;
}

export default function App() {
  const [activePage, setActivePage] = useState<'see-it-work' | 'how-it-works'>('see-it-work');
  const [activeTab, setActiveTab] = useState<'cockpit' | 'passenger' | 'station' | 'control'>('cockpit');

  // ---- API-backed state -------------------------------------------------------------------
  const [apiStatus, setApiStatus] = useState<'connecting' | 'ready' | 'error'>('connecting');
  const [apiError, setApiError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [trains, setTrains] = useState<TrainListItem[]>([]);
  const [evalInfo, setEvalInfo] = useState<ApiEval | null>(null);
  const [selectedTrainId, setSelectedTrainId] = useState<string>('12951');
  const [schedule, setSchedule] = useState<ApiSchedule | null>(null);
  const [stats, setStats] = useState<ApiStationStat[] | null>(null);
  const [position, setPosition] = useState<number>(0); // SIMULATED: last stop reached
  const [currentDelay, setCurrentDelay] = useState<number>(0); // SIMULATED input: observed delay at that stop
  const [weather, setWeather] = useState<WeatherInfo>(WEATHER_UNAVAILABLE);
  const [cascade, setCascade] = useState<ApiCascadeResponse | null>(null);
  const [cascadeError, setCascadeError] = useState<string>('');
  const [board, setBoard] = useState<Record<string, BoardRow>>({});

  const [conditions, setConditions] = useState<NetworkConditions>(NO_CONDITIONS);
  const [isProofRunning, setIsProofRunning] = useState<boolean>(false);
  const proofTimers = useRef<number[]>([]);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const lastLog = useRef<string>('');
  const addLog = useCallback((message: string, type: 'info' | 'warn' | 'success' = 'info') => {
    if (message === lastLog.current) return;
    lastLog.current = message;
    const now = new Date();
    const timeStr = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => n.toString().padStart(2, '0')).join(':');
    setLogs((prev) => [{ id: Math.random().toString(), time: timeStr, type, message }, ...prev.slice(0, 24)]);
  }, []);

  // ---- 1. Load registry + evaluation ------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    setApiStatus('connecting');
    Promise.all([api.trains(), api.evaluation().catch(() => null)])
      .then(([list, ev]) => {
        if (cancelled) return;
        const items = list.map(toListItem);
        setTrains(items);
        setEvalInfo(ev);
        setSelectedTrainId((prev) => (items.some((t) => t.id === prev) ? prev : items[0]?.id ?? prev));
        setApiStatus('ready');
        addLog(`Registry loaded from API · ${items.length} trains (public timetable, not NTES-verified)`, 'success');
        if (ev) {
          addLog(
            `XGBoost backtest on unseen services · MAE ${ev.mae_xgboost_min} vs ${ev.mae_baseline_global_median_min} min baseline · P10–P90 coverage ${Math.round(ev.p10_p90_coverage * 100)}%`,
            'info'
          );
        }
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setApiError(e.name === 'AbortError' ? 'API did not respond in time (a free server can take ~1 minute to wake up).' : e.message);
        setApiStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey, addLog]);

  // ---- 2. Load schedule + real stats for the selected train -------------------------------
  useEffect(() => {
    if (apiStatus !== 'ready') return;
    let cancelled = false;
    setCascade(null);
    Promise.all([api.schedule(selectedTrainId), api.stats(selectedTrainId).catch(() => null)])
      .then(([sch, st]) => {
        if (cancelled) return;
        const c = defaultPosition(sch.stops.length);
        setSchedule(sch);
        setStats(st?.stations ?? null);
        setPosition(c);
        setCurrentDelay(typicalAt(st?.stations ?? null, sch.stops[c].station_code));
        addLog(`Route loaded · ${sch.train_id} ${sch.train_name} · ${sch.stops.length} stops${sch.route_partial ? ' (partial route in dataset)' : ''}`, 'info');
      })
      .catch((e: Error) => {
        if (!cancelled) setCascadeError(`Could not load train ${selectedTrainId}: ${e.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, [apiStatus, selectedTrainId, addLog]);

  const listItem = useMemo(() => trains.find((t) => t.id === selectedTrainId), [trains, selectedTrainId]);
  const profile = useMemo(
    () => (schedule && schedule.train_id === selectedTrainId ? buildProfile(schedule, position, listItem) : null),
    [schedule, selectedTrainId, position, listItem]
  );

  // ---- 3. Live weather for the next station -----------------------------------------------
  const heroCode = profile?.heroStationCode;
  const heroName = profile?.heroStationName;
  useEffect(() => {
    if (!heroCode || !heroName) return;
    let cancelled = false;
    fetchStationWeather(heroCode, heroName).then((w) => {
      if (cancelled) return;
      setWeather(w);
      addLog(
        w.available
          ? `Open-Meteo · ${w.location}: ${w.condition} · severity ${w.severity.toFixed(2)}${w.stale ? ' (stale cache)' : ''}`
          : `Open-Meteo unreachable for ${heroName} · weather not applied`,
        w.available ? 'info' : 'warn'
      );
    });
    return () => {
      cancelled = true;
    };
  }, [heroCode, heroName, addLog]);

  // ---- 4. Cascade from the API (debounced; the API owns every rule) ------------------------
  const weatherSeverity = weather.available ? weather.severity : 0;
  const reqToken = useRef(0);
  useEffect(() => {
    if (!schedule || schedule.train_id !== selectedTrainId) return;
    const token = ++reqToken.current;
    const timer = window.setTimeout(() => {
      const t0 = performance.now();
      api
        .cascade({
          train_id: schedule.train_id,
          current_station_index: position,
          current_delay_min: currentDelay,
          weather_severity_index: weatherSeverity,
          scenario: toApiScenario(conditions),
        })
        .then((resp) => {
          if (token !== reqToken.current) return;
          setCascade(resp);
          setCascadeError('');
          const hero = resp.stations[position + 1];
          if (hero) {
            addLog(
              `POST /api/cascade · ${hero.station_code} ${hero.predicted_time} (+${Math.round(hero.predicted_delay_min)} min, P10–P90 ${Math.round(hero.lower_bound_min)}–${Math.round(hero.upper_bound_min)}) · ${Math.round(performance.now() - t0)} ms${resp.fallback_level === 'schedule_only' ? ' · SCHEDULE-ONLY FALLBACK' : ''}`,
              resp.fallback_level === 'schedule_only' ? 'warn' : 'success'
            );
          }
        })
        .catch((e: Error) => {
          if (token !== reqToken.current) return;
          setCascadeError(e.message);
          addLog(`Cascade request failed · ${e.message}`, 'warn');
        });
    }, 140);
    return () => window.clearTimeout(timer);
  }, [schedule, selectedTrainId, position, currentDelay, weatherSeverity, conditions, addLog]);

  // ---- 5. Other trains for the Station Board / Control Room (default scenario) -------------
  const featuredIds = useMemo(() => {
    const present = PREFERRED_BOARD.filter((id) => trains.some((t) => t.id === id));
    const rest = trains.map((t) => t.id).filter((id) => !present.includes(id));
    return [...present, ...rest].slice(0, 5);
  }, [trains]);

  const boardRequested = useRef<Set<string>>(new Set());
  const isBoardTab = activeTab === 'station' || activeTab === 'control';
  useEffect(() => {
    if (apiStatus !== 'ready' || !isBoardTab) return;
    const missing = featuredIds.filter((id) => !boardRequested.current.has(id));
    missing.forEach(async (id) => {
      boardRequested.current.add(id);
      try {
        const [sch, st] = await Promise.all([api.schedule(id), api.stats(id).catch(() => null)]);
        const c = defaultPosition(sch.stops.length);
        const resp = await api.cascade({
          train_id: id,
          current_station_index: c,
          current_delay_min: typicalAt(st?.stations ?? null, sch.stops[c].station_code),
          weather_severity_index: 0,
          scenario: toApiScenario(NO_CONDITIONS),
        });
        const p = toPrediction(resp.stations[c + 1], resp);
        const item = trains.find((t) => t.id === id);
        setBoard((prev) => ({
          ...prev,
          [id]: {
            id,
            number: id,
            name: sch.train_name,
            dest: sch.stops[sch.stops.length - 1].station_name,
            classLabel: sch.train_class.replace('_', ' ').toUpperCase(),
            section: `${sch.stops[c].station_code}–${sch.stops[c + 1].station_code}`,
            nextStation: sch.stops[c + 1].station_name,
            scheduled: p.scheduledEta,
            predicted: p.predictedEta,
            delayMin: p.delayMinutes,
            rangeText: `±${p.rangeMinutes} min`,
            isDelayed: p.isDelayed,
            note: item?.route ?? '',
          },
        }));
      } catch {
        boardRequested.current.delete(id); // allow a retry next time the tab opens
      }
    });
  }, [apiStatus, isBoardTab, featuredIds, trains]);

  // ---- Derived values for the existing components -----------------------------------------
  const cascadeReady = !!(cascade && profile && cascade.train_id === profile.id && cascade.stations[profile.currentIndex + 1]);

  const heroPrediction = useMemo(
    () => (cascadeReady && cascade && profile ? toPrediction(cascade.stations[profile.currentIndex + 1], cascade) : null),
    [cascadeReady, cascade, profile]
  );

  const routeRows = useMemo(
    () => (cascadeReady && cascade && profile ? toRouteRows(cascade, profile.currentIndex, Math.max(0, profile.currentIndex - 1)) : []),
    [cascadeReady, cascade, profile]
  );

  const heroStations: StationNode[] = useMemo(() => {
    if (!profile) return [];
    return profile.stations.map((st) => ({
      code: st.code,
      name: st.name,
      index: st.index,
      scheduledTime: st.scheduledTime,
      predictedTime: cascade?.stations[st.index]?.predicted_time ?? st.scheduledTime,
      status: st.status,
    }));
  }, [profile, cascade]);

  const trainPositionPercent = useMemo(() => {
    if (!profile) return 0;
    const m = profile.stations.length;
    const start = windowStart(profile.currentIndex, profile.stationCount);
    return m > 1 ? ((profile.currentIndex - start) / (m - 1)) * 100 : 0;
  }, [profile]);

  const typicalAtCurrent = useMemo(
    () => (schedule ? typicalAt(stats, schedule.stops[position]?.station_code ?? '') : 0),
    [schedule, stats, position]
  );

  // ---- Handlers -----------------------------------------------------------------------------
  const clearProof = () => {
    proofTimers.current.forEach((t) => window.clearTimeout(t));
    proofTimers.current = [];
    setIsProofRunning(false);
  };
  useEffect(() => clearProof, []);

  const handleTrainChange = (newTrainId: string) => {
    if (newTrainId === selectedTrainId) return;
    clearProof();
    setConditions(NO_CONDITIONS);
    setSelectedTrainId(newTrainId);
    const t = trains.find((x) => x.id === newTrainId);
    if (t) addLog(`Service changed to ${t.number} · ${t.name}`, 'info');
  };

  const handlePickPosition = (index: number) => {
    if (!schedule || index === position || index > schedule.stops.length - 2) return;
    setPosition(index);
    setCurrentDelay(typicalAt(stats, schedule.stops[index].station_code));
    addLog(`Simulated position set to ${schedule.stops[index].station_name} (no live GPS feed available)`, 'info');
  };

  const handleToggleCondition = (key: keyof NetworkConditions) => {
    setConditions((prev) => ({ ...prev, [key]: !prev[key] }));
    const on = !conditions[key];
    const label: Record<keyof NetworkConditions, string> = {
      severeWeather: `Severe-weather override (simulated) · +${SCENARIO_IMPACT_MIN.severeWeather} min`,
      precedingTrainDelayed: `Preceding train delayed (simulated) · +${SCENARIO_IMPACT_MIN.precedingTrainDelayed} min via 0.4× cascade`,
      tsrActive: `Temporary speed restriction (simulated) · +${SCENARIO_IMPACT_MIN.tsrActive} min`,
      unscheduledDisruption: `Unscheduled disruption injected (simulated) · +${SCENARIO_IMPACT_MIN.unscheduledDisruption} min`,
    };
    addLog(on ? `${label[key]} · ON` : `${label[key].split(' (')[0]} · cleared`, on ? 'warn' : 'info');
  };

  const handleInjectUnscheduled = () => handleToggleCondition('unscheduledDisruption');

  // 8-second guided scenario: every step still goes through the API.
  const handleStartProof = () => {
    if (isProofRunning || !profile) return;
    setIsProofRunning(true);
    setConditions(NO_CONDITIONS);
    addLog(`8-second scenario on ${profile.number} ${profile.name}: baseline`, 'info');
    const later = (ms: number, fn: () => void) => proofTimers.current.push(window.setTimeout(fn, ms));
    later(2000, () => {
      setConditions({ ...NO_CONDITIONS, precedingTrainDelayed: true, unscheduledDisruption: true });
      addLog(`Simulated disruption injected on ${profile.activeSection}: hold + cascade`, 'warn');
    });
    later(5500, () => {
      setConditions({ ...NO_CONDITIONS, tsrActive: true });
      addLog(`Hold cleared: TSR recovery on ${profile.activeSection}`, 'info');
    });
    later(8000, () => {
      setConditions(NO_CONDITIONS);
      setIsProofRunning(false);
      addLog(`Scenario complete: ${profile.number} back to model baseline`, 'success');
    });
  };

  const coveragePct = evalInfo ? Math.round(evalInfo.p10_p90_coverage * 100) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-[#E8731A]/20 selection:text-[#12386B]">
      <Header activeTab={activePage} onTabChange={setActivePage} apiStatus={apiStatus} />

      {activePage === 'see-it-work' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col gap-4">
          {apiStatus !== 'ready' || !profile ? (
            <ApiStatusPanel
              status={apiStatus === 'ready' ? (cascadeError ? 'error' : 'connecting') : apiStatus}
              message={apiStatus === 'ready' ? cascadeError : apiError}
              onRetry={() => {
                setCascadeError('');
                setRetryKey((k) => k + 1);
              }}
            />
          ) : (
            <>
              <TrainServiceBar
                trains={trains}
                selectedTrain={profile}
                selectedTrainId={selectedTrainId}
                onSelectTrain={handleTrainChange}
                isProofRunning={isProofRunning}
              />

              {cascadeError && (
                <div role="alert" className="text-xs font-mono bg-rose-50 border border-rose-300 text-rose-800 rounded-lg px-3 py-2">
                  API error: {cascadeError} · showing the last successful forecast
                </div>
              )}

              {heroPrediction ? (
                <CockpitDashboard
                  selectedTrain={profile}
                  heroPrediction={heroPrediction}
                  trainPositionPercent={trainPositionPercent}
                  heroStations={heroStations}
                  conditions={conditions}
                  onToggleCondition={handleToggleCondition}
                  onInjectUnscheduled={handleInjectUnscheduled}
                  onStartProof={handleStartProof}
                  isProofRunning={isProofRunning}
                  routeStationsWithPrediction={routeRows}
                  logs={logs}
                  currentStopName={schedule!.stops[position].station_name}
                  currentDelay={currentDelay}
                  typicalDelay={typicalAtCurrent}
                  onCurrentDelayChange={setCurrentDelay}
                  onPickPosition={handlePickPosition}
                  coveragePct={coveragePct}
                />
              ) : (
                <ApiStatusPanel status="connecting" message="" onRetry={() => setRetryKey((k) => k + 1)} compact />
              )}

              {heroPrediction && (
                <SystemPerspectivesTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  selectedTrain={profile}
                  heroPrediction={heroPrediction}
                  onSelectTrain={handleTrainChange}
                  board={featuredIds.map((id) => board[id]).filter(Boolean)}
                  boardLoading={isBoardTab && featuredIds.some((id) => !board[id])}
                />
              )}
            </>
          )}
        </main>
      ) : (
        <main className="flex-1">
          <HowItWorksPage />
        </main>
      )}

      <Footer weather={weather} evalInfo={evalInfo} />
    </div>
  );
}
