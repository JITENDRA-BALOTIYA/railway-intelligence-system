import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BlueprintBadge, ScopeStatus } from './BlueprintBadge';

export interface ArchitectureLayer {
  step: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: Array<{ name: string; status: ScopeStatus }>;
}

interface BlueprintHeroFlowProps {
  layers: ArchitectureLayer[];
  selectedLayerIndex: number;
  onSelectLayer: (index: number) => void;
}

export const BlueprintHeroFlow: React.FC<BlueprintHeroFlowProps> = ({
  layers,
  selectedLayerIndex,
  onSelectLayer,
}) => {
  const activeLayer = layers[selectedLayerIndex];

  return (
    <section className="space-y-4">
      {/* Title, Legend & KPI Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#E8731A] block mb-1">
            END-TO-END SYSTEM BLUEPRINT
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            From network signal <br className="hidden sm:inline" />
            to <span className="text-[#E8731A]">trusted arrival.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Five layers. Two learning loops. One forecast contract.
          </p>

          {/* Status Chips Legend */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>PROTOTYPE</span>
              </span>
              <span className="text-slate-500 font-medium">Implemented in this prototype (API + UI)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-50 text-[#C95E0E] border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8731A]" />
                <span>SIMULATED</span>
              </span>
              <span className="text-slate-500 font-medium">No public feed exists, simulated</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-dashed border-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>PLANNED</span>
              </span>
              <span className="text-slate-500 font-medium">Production roadmap</span>
            </div>
          </div>
        </div>

        {/* Top-Right KPI Box: 3 Metrics in Light Theme */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3 sm:p-4 grid grid-cols-3 divide-x divide-slate-100 text-center shrink-0 min-w-[280px]">
          <div className="px-3">
            <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 block">30 sec</span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 uppercase tracking-wider block mt-0.5">
              Refresh cadence
            </span>
          </div>
          <div className="px-3">
            <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 block">5 layers</span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 uppercase tracking-wider block mt-0.5">
              System coverage
            </span>
          </div>
          <div className="px-3">
            <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 block">4 levels</span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 uppercase tracking-wider block mt-0.5">
              Fallback chain
            </span>
          </div>
        </div>
      </div>

      {/* 5-Step Horizontal Flow Diagram Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {layers.map((layer, idx) => {
            const isSelected = selectedLayerIndex === idx;

            return (
              <div key={layer.step} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onSelectLayer(idx)}
                  className={`w-full flex-1 p-3.5 rounded-xl border text-left transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E8731A] ${
                    isSelected
                      ? 'border-[#E8731A] ring-2 ring-[#E8731A]/20 bg-amber-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[#E8731A]">
                      {layer.icon}
                    </div>
                    <span className="font-mono text-xs font-bold text-[#E8731A]">
                      {layer.step}
                    </span>
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                    {layer.title}
                  </h2>
                </button>

                {/* Arrow between horizontal items */}
                {idx < layers.length - 1 && (
                  <ArrowRight className="hidden md:block w-3.5 h-3.5 text-slate-400 mx-1.5 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Layer Expanded Details Box */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-start gap-4">
            <span className="font-mono text-4xl sm:text-5xl font-black text-[#E8731A] leading-none shrink-0">
              {activeLayer.step}
            </span>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                SELECTED ARCHITECTURE LAYER
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                {activeLayer.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {activeLayer.subtitle}
              </p>
            </div>
          </div>

          {/* 4 Feature capability cards for selected layer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 max-w-2xl">
            {activeLayer.items.map((item, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between"
              >
                <span className="text-[11px] font-semibold text-slate-800 leading-tight block mb-2">
                  {item.name}
                </span>
                <div>
                  <BlueprintBadge type={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
