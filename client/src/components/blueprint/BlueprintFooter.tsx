import React from 'react';
import { ExternalLink } from 'lucide-react';

export const BlueprintFooter: React.FC = () => {
  return (
    <footer className="pt-3 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
          RESEARCH BASIS
        </span>
        <a
          href="https://arxiv.org/abs/1603.02754"
          target="_blank"
          rel="noreferrer"
          className="text-slate-600 hover:text-[#E8731A] flex items-center gap-1 underline decoration-slate-300"
        >
          <span>Chen & Guestrin 2016</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
        <span className="text-slate-300">•</span>
        <a
          href="https://projecteuclid.org/journals/annals-of-statistics/volume-29/issue-5/Greedy-function-approximation-A-gradient-boosting-machine/10.1214/aos/1013203451.full"
          target="_blank"
          rel="noreferrer"
          className="text-slate-600 hover:text-[#E8731A] flex items-center gap-1 underline decoration-slate-300"
        >
          <span>Friedman 2001</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
        <span className="text-slate-300">•</span>
        <a
          href="https://doi.org/10.1016/j.trb.2009.10.007"
          target="_blank"
          rel="noreferrer"
          className="text-slate-600 hover:text-[#E8731A] flex items-center gap-1 underline decoration-slate-300"
        >
          <span>Goverde 2010</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      <div className="text-[11px] text-slate-400 text-center sm:text-right">
        RAILPULSE · TEAM CATHODE | SMART INDIA HACKATHON 2026 · PS 26028 · TEAM ID 134659
      </div>
    </footer>
  );
};
