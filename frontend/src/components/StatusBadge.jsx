import React from 'react';

/**
 * Small indicator badge showing current incident state (LIVE vs RESOLVED).
 */
export default function StatusBadge({ resolved }) {
  if (resolved) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold tracking-wider rounded border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 no-select select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        RESOLVED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold tracking-wider rounded border border-red-500/50 bg-red-950/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)] no-select select-none">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500 relative flex">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      </span>
      INCIDENT LIVE
    </span>
  );
}
