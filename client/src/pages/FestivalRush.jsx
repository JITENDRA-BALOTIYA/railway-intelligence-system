import { Sparkles, Users, AlertTriangle, TrainFront, ArrowRight, ShieldCheck } from 'lucide-react'
import { Card } from '../components/common/Card.jsx'
import { Badge } from '../components/common/Badge.jsx'

const festivalSpecials = [
  {
    number: '04055',
    name: 'Anand Vihar - Patna Festival Special',
    type: 'Festival Special',
    frequency: 'Daily (Diwali / Chhath Rush)',
    coaches: '22 (All Sleeper & 3AC)',
    surgeLoad: '185% Demand Index',
    route: 'ANVT → PNBE',
    status: 'Operational',
  },
  {
    number: '02394',
    name: 'New Delhi - Howrah Superfast Special',
    type: 'Durga Puja Special',
    frequency: 'Tri-weekly',
    coaches: '24 (High Capacity)',
    surgeLoad: '160% Demand Index',
    route: 'NDLS → HWH',
    status: 'Operational',
  },
  {
    number: '01027',
    name: 'Mumbai CSMT - Gorakhpur Special',
    type: 'Holiday Special',
    frequency: '4 days/week',
    coaches: '20 (General + Sleeper)',
    surgeLoad: '210% Surge Expected',
    route: 'CSMT → GKP',
    status: 'High Rush',
  },
]

const FestivalRush = () => {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="hero-gradient-bg rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-3 border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Seasonal Surge Operations
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Festival Rush & Special Train Operations
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            Real-time monitoring of festival surge passenger capacity, crowd marshaling, and seasonal clone train routes.
          </p>
        </div>

        <div className="w-64 h-32 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center p-4">
          <Users className="w-10 h-10 text-emerald-600" />
          <div className="text-sm font-bold text-slate-900 mt-1.5">+350 Special Trains</div>
          <div className="text-[10px] text-emerald-700 font-bold">Mobilized Across 18 Zones</div>
        </div>
      </div>

      {/* Special Trains Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrainFront className="w-5 h-5 text-emerald-600" />
          Active Festival Clone & Surge Trains
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {festivalSpecials.map((train) => (
            <Card key={train.number} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    #{train.number}
                  </span>
                  <Badge variant={train.status === 'High Rush' ? 'orange' : 'green'} size="sm">
                    {train.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{train.name}</h3>
                <div className="text-xs text-slate-500 font-medium mt-1">{train.route}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{train.frequency}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{train.coaches}</span>
                <span className="font-bold text-emerald-700">{train.surgeLoad}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Crowd Protocols */}
      <Card>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Terminal Crowd Protocol Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="font-bold text-slate-900">Separate Entry & Exit Corridors</div>
            <p className="text-[11px] text-slate-500 mt-1">One-way unidirectional passenger flow at NDLS, CSMT, and HWH.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="font-bold text-slate-900">Holding Enclosures</div>
            <p className="text-[11px] text-slate-500 mt-1">Designated circulating area tents with giant display boards & drinking water.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="font-bold text-slate-900">RPF Special Marshals</div>
            <p className="text-[11px] text-slate-500 mt-1">Round-the-clock physical queue regulation for unreserved coaches.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default FestivalRush
