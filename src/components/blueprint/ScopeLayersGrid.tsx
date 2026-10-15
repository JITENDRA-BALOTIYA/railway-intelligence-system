import React from 'react';
import { ArchitectureLayer } from './BlueprintHeroFlow';
import { BlueprintBadge } from './BlueprintBadge';

interface ScopeLayersGridProps {
  layers: ArchitectureLayer[];
}

export const ScopeLayersGrid: React.FC<ScopeLayersGridProps> = ({ layers }) => {
  return (
    <section className="space-y-3">
      <div>
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#E8731A] block mb-0.5">
          COMPLETE IMPLEMENTATION SCOPE
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Every layer, honestly labelled.
        </h2>
      </div>

      <div className="space-y-2.5">
        {layers.map((layer) => (
          <div
            key={layer.step}
            className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
          >
            {/* Left Step Meta */}
            <div className="flex items-center gap-3 lg:w-72 shrink-0">
              <span className="font-mono text-sm font-black text-[#E8731A] w-6 shrink-0">
                {layer.step}
              </span>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/80 text-[#E8731A] shrink-0">
                {layer.icon}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {layer.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  {layer.subtitle}
                </p>
              </div>
            </div>

            {/* Right 4 Sub-Components Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 flex-1">
              {layer.items.map((it, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-lg bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-medium text-slate-800 truncate">
                    {it.name}
                  </span>
                  <BlueprintBadge type={it.status} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
