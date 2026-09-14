const STATUS_STYLES = {
  Departed: 'text-slate-400',
  Arriving: 'text-amber-600 font-bold animate-pulse',
  Upcoming: 'text-slate-600',
  Predicted: 'text-emerald-600 font-bold',
}

const DELAY_COLOR = (d) =>
  d === 0 ? 'text-emerald-600' : d <= 5 ? 'text-amber-500' : d <= 10 ? 'text-orange-500' : 'text-rose-600'

const STATUS_DOT = {
  Departed: 'bg-slate-300',
  Arriving: 'bg-amber-500',
  Upcoming: 'bg-slate-200',
  Predicted: 'bg-emerald-500',
}

export const StationEtaTimeline = ({ stations = [], onViewFull }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-base">🗓</span>
          <span className="text-sm font-bold text-slate-800">Station-wise ETA Timeline</span>
        </div>
        <button
          type="button"
          onClick={onViewFull}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          View Full Schedule →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 px-3 text-slate-400 font-semibold w-6">#</th>
              <th className="text-left py-2 px-3 text-slate-400 font-semibold">Station</th>
              <th className="text-right py-2 px-3 text-slate-400 font-semibold">Scheduled</th>
              <th className="text-right py-2 px-3 text-slate-400 font-semibold">Predicted</th>
              <th className="text-right py-2 px-3 text-slate-400 font-semibold">Delay</th>
              <th className="text-right py-2 px-3 text-slate-400 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((stn, idx) => (
              <tr
                key={stn.stationCode || idx}
                className={`border-b border-slate-50 transition-colors hover:bg-slate-50 ${
                  stn.status === 'Arriving' ? 'bg-amber-50/50' : ''
                }`}
              >
                <td className="py-2.5 px-3 text-slate-400 font-mono">{stn.seq}</td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[stn.status] || 'bg-slate-200'}`}
                    />
                    <div>
                      <div className="font-semibold text-slate-800 leading-tight">{stn.stationCode}</div>
                      <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[100px]">
                        {stn.station.replace(/^[A-Z]+ - /, '')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-500">{stn.scheduled}</td>
                <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">{stn.predicted}</td>
                <td className={`py-2.5 px-3 text-right font-mono font-bold ${DELAY_COLOR(stn.delayMin)}`}>
                  {stn.delayMin === 0 ? '–' : `+${stn.delayMin}m`}
                </td>
                <td className={`py-2.5 px-3 text-right ${STATUS_STYLES[stn.status] || ''}`}>
                  {stn.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
