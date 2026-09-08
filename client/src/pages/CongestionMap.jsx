import { useState, useEffect } from 'react'
import { analyticsService } from '../services/analyticsService.js'
import { CongestionRadar } from '../components/analytics/CongestionRadar.jsx'
import { Card } from '../components/common/Card.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { AlertTriangle, Map } from 'lucide-react'

const CongestionMap = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await analyticsService.getCongestion()
        setData(result)
      } catch (e) {
        console.error('Failed to load congestion data:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loader message="Mapping corridor congestion levels..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Railway Congestion Map</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Interactive corridor congestion levels, bottleneck sections, and line saturation analysis
          </p>
        </div>
      </div>

      <CongestionRadar corridors={data?.corridors || []} />

      {/* High Risk Sections */}
      <Card>
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          High-Risk Bottleneck Sections
        </h3>
        <div className="space-y-3">
          {(data?.highRiskSections || []).map((section, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">{section.section}</div>
                <div className="text-[11px] text-rose-700 font-medium mt-0.5">{section.risk}</div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                {section.action}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default CongestionMap
