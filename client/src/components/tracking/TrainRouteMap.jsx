import { useState } from 'react'
import { Plus, Minus, Maximize2, MapPin } from 'lucide-react'

export const TrainRouteMap = ({ train }) => {
  const [zoom, setZoom] = useState(1)

  // Default coordinate path representing West to North India corridor
  const stops = [
    { name: 'Mumbai', x: 70, y: 155, code: 'MMCT' },
    { name: 'Surat', x: 80, y: 130, code: 'ST' },
    { name: 'Vadodara', x: 85, y: 110, code: 'BRC' },
    { name: 'Ratlam', x: 95, y: 90, code: 'RTM' },
    { name: 'Kota', x: 110, y: 65, code: 'KOTA' },
    { name: 'New Delhi', x: 135, y: 30, code: 'NDLS' },
  ]

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          Route Map
        </h4>
        <button
          type="button"
          className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          View Full Map
        </button>
      </div>

      {/* Map Canvas */}
      <div className="relative h-44 w-full bg-[#f1f5f9] rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
        {/* Subtle grid background to simulate GIS mapping */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(#94a3b8 1px, transparent 1px), radial-gradient(#94a3b8 1px, #f1f5f9 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
          }}
        />

        {/* Map SVG */}
        <svg
          viewBox="0 0 200 180"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Subtle India boundary silhouette curve */}
          <path
            d="M 40,20 Q 90,10 160,20 Q 180,70 170,120 Q 130,170 80,160 Q 40,110 40,20 Z"
            fill="#e2e8f0"
            opacity="0.6"
          />

          {/* Railway track route line */}
          <path
            d="M 70,155 Q 85,110 110,65 T 135,30"
            fill="none"
            stroke="#059669"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="none"
          />

          {/* Secondary branch tracks */}
          <path
            d="M 85,110 Q 120,115 145,130"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />

          {/* Station node dots */}
          {stops.map((s, idx) => {
            const isTerminus = idx === 0 || idx === stops.length - 1
            return (
              <g key={s.code}>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={isTerminus ? 4 : 2.5}
                  fill={isTerminus ? '#059669' : '#0f172a'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={s.x + 6}
                  y={s.y + 3}
                  fontSize="7"
                  fontWeight={isTerminus ? 'bold' : '500'}
                  fill="#1e293b"
                >
                  {s.name}
                </text>
              </g>
            )
          })}

          {/* Additional geographical landmarks */}
          <circle cx="130" cy="95" r="2.5" fill="#64748b" />
          <text x="135" y="98" fontSize="6.5" fill="#64748b">
            Bhopal
          </text>
          <circle cx="145" cy="130" r="2.5" fill="#64748b" />
          <text x="150" y="133" fontSize="6.5" fill="#64748b">
            Nagpur
          </text>
        </svg>

        {/* Zoom Controls */}
        <div className="absolute right-2.5 bottom-2.5 flex flex-col gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.2, 1.8))}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            title="Zoom In"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
