import React from 'react';
import { Compass, GitMerge } from 'lucide-react';

interface HeaderProps {
  activeTab: 'see-it-work' | 'how-it-works';
  onTabChange: (tab: 'see-it-work' | 'how-it-works') => void;
  apiStatus?: 'connecting' | 'ready' | 'error';
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, apiStatus = 'connecting' }) => {
  const ui = {
    ready: { label: 'API ONLINE', wrap: 'border-emerald-200 bg-emerald-50 text-[#1E8A3C]', dot: 'bg-[#1E8A3C] animate-pulse' },
    connecting: { label: 'CONNECTING', wrap: 'border-amber-200 bg-amber-50 text-[#E8731A]', dot: 'bg-[#E8731A] animate-pulse' },
    error: { label: 'API OFFLINE', wrap: 'border-rose-200 bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  }[apiStatus];
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Product title + CATHODE */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs sm:text-sm tracking-tight text-[#12386B]">
            Rail Intelligence System
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#E8731A] text-white shadow-xs">
            CATHODE
          </span>
        </div>

        {/* Center / Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80"
        >
          <button
            onClick={() => onTabChange('see-it-work')}
            aria-current={activeTab === 'see-it-work' ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'see-it-work'
                ? 'bg-white text-[#12386B] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#E8731A]" />
            <span>See it work</span>
          </button>

          <button
            onClick={() => onTabChange('how-it-works')}
            aria-current={activeTab === 'how-it-works' ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'how-it-works'
                ? 'bg-white text-[#12386B] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5 text-[#12386B]" />
            <span className="hidden sm:inline">How it works</span>
            <span className="sm:hidden">Architecture</span>
          </button>
        </nav>

        {/* Right side system status badge */}
        <div className="hidden md:flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${ui.wrap}`}>
            <span className={`w-2 h-2 rounded-full ${ui.dot}`} />
            <span>{ui.label}</span>
          </span>
        </div>
      </div>
    </header>
  );
};
