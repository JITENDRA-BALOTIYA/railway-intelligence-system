import React, { useState } from 'react';
import { Database, Layers, Cpu, Code, Monitor } from 'lucide-react';
import { BlueprintHeroFlow, ArchitectureLayer } from './blueprint/BlueprintHeroFlow';
import { ScopeLayersGrid } from './blueprint/ScopeLayersGrid';
import { TwoLoopIntelligence } from './blueprint/TwoLoopIntelligence';
import { FailSafeAndDeployment } from './blueprint/FailSafeAndDeployment';
import { CorePrinciplesStrip } from './blueprint/CorePrinciplesStrip';
import { OfflineValidationBanner } from './blueprint/OfflineValidationBanner';
import { MeasuredResults } from './blueprint/MeasuredResults';
import { BlueprintFooter } from './blueprint/BlueprintFooter';

export const HowItWorksPage: React.FC = () => {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(2); // Default to Step 03 (ETA Intelligence Engine)

  const architectureLayers: ArchitectureLayer[] = [
    {
      step: '01',
      title: 'Data acquisition',
      subtitle: 'Every signal enters through one contract',
      icon: <Database className="w-4 h-4 text-[#E8731A]" />,
      items: [
        { name: 'Open-Meteo weather', status: 'PROTOTYPE' },
        { name: 'Historical datasets', status: 'PROTOTYPE' },
        { name: 'RTIS / NTES position', status: 'SIMULATED' },
        { name: 'Signals, TSR, crossings', status: 'SIMULATED' },
      ],
    },
    {
      step: '02',
      title: 'Processing and feature store',
      subtitle: 'Validate, align and make route context',
      icon: <Layers className="w-4 h-4 text-[#E8731A]" />,
      items: [
        { name: 'Schema validation', status: 'PROTOTYPE' },
        { name: 'Section feature pipeline', status: 'PROTOTYPE' },
        { name: 'Registry (JSON + CSV)', status: 'PROTOTYPE' },
        { name: 'PostgreSQL + Redis', status: 'PLANNED' },
      ],
    },
    {
      step: '03',
      title: 'ETA intelligence engine',
      subtitle: 'Predict sections, propagate delay, quantify range',
      icon: <Cpu className="w-4 h-4 text-[#E8731A]" />,
      items: [
        { name: 'XGBoost section model', status: 'PROTOTYPE' },
        { name: 'Cascade coefficient', status: 'SIMULATED' },
        { name: 'Prediction range (quantile)', status: 'PROTOTYPE' },
        { name: 'Drift monitoring', status: 'PLANNED' },
      ],
    },
    {
      step: '04',
      title: 'Service and delivery',
      subtitle: 'One forecast contract for every consumer',
      icon: <Code className="w-4 h-4 text-[#E8731A]" />,
      items: [
        { name: 'Prediction function', status: 'PROTOTYPE' },
        { name: 'FastAPI REST', status: 'PROTOTYPE' },
        { name: 'WebSocket push', status: 'PLANNED' },
        { name: 'Redis forecast cache', status: 'PLANNED' },
      ],
    },
    {
      step: '05',
      title: 'Decision interfaces',
      subtitle: 'Shape the same answer for each railway role',
      icon: <Monitor className="w-4 h-4 text-[#E8731A]" />,
      items: [
        { name: 'Passenger app', status: 'PROTOTYPE' },
        { name: 'Station display', status: 'PROTOTYPE' },
        { name: 'Control room', status: 'PROTOTYPE' },
        { name: 'Partner integrations', status: 'PLANNED' },
      ],
    },
  ];

  return (
    <div className="min-h-full bg-slate-50 text-slate-800 py-6 px-3 sm:px-6 lg:px-8 font-sans selection:bg-[#E8731A]/20 selection:text-[#12386B]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Hero, KPI Metrics & Horizontal Flow Diagram */}
        <BlueprintHeroFlow
          layers={architectureLayers}
          selectedLayerIndex={selectedLayerIndex}
          onSelectLayer={setSelectedLayerIndex}
        />

        {/* Complete Implementation Scope: 5 Layers Breakdown */}
        <ScopeLayersGrid layers={architectureLayers} />

        {/* Two-Loop Intelligence Widget */}
        <TwoLoopIntelligence />

        {/* Fail-Safe Forecasting & Deployment Path Side-by-Side */}
        <FailSafeAndDeployment />

        {/* 4 Core Engineering Principles */}
        <CorePrinciplesStrip />

        {/* Measured results straight from the API */}
        <MeasuredResults />

        {/* Offline Model Validation Pipeline Banner */}
        <OfflineValidationBanner />

        {/* Research Basis Citations & Attribution Footer */}
        <BlueprintFooter />
      </div>
    </div>
  );
};
