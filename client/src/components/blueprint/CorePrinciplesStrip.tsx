import React from 'react';
import { ShieldCheck, Server, Code, Users } from 'lucide-react';

export const CorePrinciplesStrip: React.FC = () => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-50 text-[#E8731A] shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            RESILIENT
          </span>
          <h4 className="text-xs font-bold text-slate-800">Fallback on data gaps</h4>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-50 text-[#E8731A] shrink-0">
          <Server className="w-4 h-4" />
        </div>
        <div>
          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SCALABLE
          </span>
          <h4 className="text-xs font-bold text-slate-800">Zone-isolated services</h4>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-50 text-[#E8731A] shrink-0">
          <Code className="w-4 h-4" />
        </div>
        <div>
          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            INTEGRABLE
          </span>
          <h4 className="text-xs font-bold text-slate-800">API-first delivery</h4>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-50 text-[#E8731A] shrink-0">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            USEFUL
          </span>
          <h4 className="text-xs font-bold text-slate-800">Three decision channels</h4>
        </div>
      </div>
    </section>
  );
};
