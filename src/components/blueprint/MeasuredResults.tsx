import React, { useEffect, useState } from 'react';
import { api, ApiEval } from '../../utils/api';
import { BlueprintBadge } from './BlueprintBadge';

const CLASS_NAME: Record<string, string> = {
  vande_bharat: 'Vande Bharat',
  shatabdi: 'Shatabdi',
  rajdhani: 'Rajdhani',
  duronto: 'Duronto',
  mail: 'Mail',
  express: 'Express',
};

/** Numbers come straight from /api/eval (written by the training script), never typed by hand. */
export const MeasuredResults: React.FC = () => {
  const [ev, setEv] = useState<ApiEval | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.evaluation().then(setEv).catch(() => setFailed(true));
  }, []);

  const gain = ev ? Math.round((1 - ev.mae_xgboost_min / ev.mae_baseline_global_median_min) * 100) : 0;

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E8731A] block mb-0.5">
            MEASURED RESULTS · FROM THE API
          </span>
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            Does the XGBoost model beat a naive baseline on trains it has never seen?
          </h3>
        </div>
        <BlueprintBadge type="PROTOTYPE" label="MEASURED" />
      </div>

      {failed && <p className="mt-3 text-xs text-slate-500 font-mono">Evaluation not reachable right now (API offline).</p>}
      {!ev && !failed && <p className="mt-3 text-xs text-slate-500 font-mono">Loading evaluation…</p>}

      {ev && (
        <>
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="XGBoost MAE" value={`${ev.mae_xgboost_min} min`} sub="unseen services" />
            <Stat label="Baseline MAE" value={`${ev.mae_baseline_global_median_min} min`} sub="global median" />
            <Stat label="Improvement" value={`${gain}%`} sub="vs baseline" />
            <Stat
              label="P10–P90 coverage"
              value={`${Math.round(ev.p10_p90_coverage * 100)}%`}
              sub={`target ${Math.round(ev.target_coverage * 100)}% · under-covers`}
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono min-w-[420px]">
              <thead>
                <tr className="text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-1.5 px-2">Train class</th>
                  <th className="py-1.5 px-2 text-right">Rows</th>
                  <th className="py-1.5 px-2 text-right">XGBoost</th>
                  <th className="py-1.5 px-2 text-right">Baseline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(ev.by_class).map(([c, v]) => {
                  const better = v.mae_xgboost_min < v.mae_baseline_global_median_min - 0.5;
                  return (
                    <tr key={c}>
                      <td className="py-1.5 px-2 font-semibold text-slate-800">{CLASS_NAME[c] || c}</td>
                      <td className="py-1.5 px-2 text-right text-slate-500">{v.rows}</td>
                      <td className={`py-1.5 px-2 text-right font-bold ${better ? 'text-[#1E8A3C]' : 'text-slate-700'}`}>
                        {v.mae_xgboost_min}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-500">{v.mae_baseline_global_median_min}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[11px] leading-snug text-slate-600">
            <strong className="text-slate-800">Honest scope: </strong>
            {ev.caveat} Held out whole up/down service pairs (GroupKFold=5), so a train is never tested against its own
            twin. Data: {ev.data}. No gain on Duronto.
          </p>
        </>
      )}
    </section>
  );
};

const Stat: React.FC<{ label: string; value: string; sub: string }> = ({ label, value, sub }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">{label}</div>
    <div className="text-xl font-black font-mono text-[#12386B] mt-0.5">{value}</div>
    <div className="text-[10px] text-slate-500 font-medium">{sub}</div>
  </div>
);
