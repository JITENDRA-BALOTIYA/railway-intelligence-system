export const ConfidenceScore = ({ confidence = 85, label = 'High confidence' }) => {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (confidence / 100) * circumference

  const strokeColor =
    confidence >= 85 ? '#059669' : confidence >= 70 ? '#d97706' : '#e11d48'

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col items-center">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
        Prediction Confidence
      </h3>

      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold font-mono text-slate-900">
            {confidence}%
          </span>
        </div>
      </div>

      <span className="mt-3 text-xs font-bold text-slate-700">{label}</span>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[10px]">
        {['Position', 'Timetable', 'Signals', 'Weather'].map((f) => (
          <span
            key={f}
            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}
