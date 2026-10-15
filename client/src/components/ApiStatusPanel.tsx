import React from 'react';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';

interface ApiStatusPanelProps {
  status: 'connecting' | 'error';
  message: string;
  onRetry: () => void;
  compact?: boolean;
}

/** Shown while the API wakes up (free hosting sleeps) or when it cannot be reached. */
export const ApiStatusPanel: React.FC<ApiStatusPanelProps> = ({ status, message, onRetry, compact }) => (
  <div
    role="status"
    className={`w-full bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col items-center justify-center text-center ${
      compact ? 'p-6' : 'p-10 sm:p-16'
    }`}
  >
    {status === 'connecting' ? (
      <>
        <Loader2 className="w-7 h-7 text-[#E8731A] animate-spin" />
        <h2 className="mt-3 text-base font-bold text-[#12386B]">Connecting to the forecast API…</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-md">
          The free server sleeps when idle and can take up to a minute to wake up. Nothing here is pre-baked, the
          numbers come from the live model.
        </p>
      </>
    ) : (
      <>
        <WifiOff className="w-7 h-7 text-rose-500" />
        <h2 className="mt-3 text-base font-bold text-[#12386B]">Forecast API not reachable</h2>
        <p className="mt-1 text-xs text-slate-600 max-w-md font-mono">{message || 'Unknown error'}</p>
        <p className="mt-2 text-[11px] text-slate-500 max-w-md">
          The UI never invents numbers. If the API is down, it says so. Check that the backend is running and that
          VITE_API_BASE points at it.
        </p>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E8731A] hover:bg-[#d66512] text-white text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </>
    )}
  </div>
);
