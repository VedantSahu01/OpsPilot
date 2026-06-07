import React from 'react';
import IncidentCard from './IncidentCard';

/**
 * Skeleton loaders mimicking the card layout for smooth loading state representation.
 */
export function IncidentListSkeleton() {
  return (
    <div className="w-full space-y-4">
      {[1, 2, 3].map((val) => (
        <div 
          key={val} 
          className="w-full flex items-center justify-between p-6 bg-brand-panel border border-brand-border rounded-lg animate-pulse"
        >
          <div className="flex items-center gap-6 md:gap-8 flex-1">
            {/* Short ID placeholder */}
            <div className="h-4 w-12 bg-slate-800 rounded"></div>
            {/* Title & Metadata placeholders */}
            <div className="flex-1 space-y-2.5 pr-4">
              <div className="h-4 w-2/3 bg-slate-800 rounded"></div>
              <div className="h-3.5 w-1/3 bg-slate-800 rounded"></div>
            </div>
          </div>
          {/* Arrow placeholder */}
          <div className="h-5 w-5 bg-slate-800 rounded"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * List manager component coordinating multiple incidents.
 */
export default function IncidentList({ incidents = [], isLoading, isError, onRetry }) {
  if (isLoading) {
    return <IncidentListSkeleton />;
  }

  if (isError) {
    return (
      <div className="w-full py-16 px-6 bg-brand-panel border border-red-500/20 rounded-lg text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-[0_0_20px_rgba(239,68,68,0.02)]">
        <p className="text-red-400 font-mono text-sm tracking-wider mb-4">
          Unable to reach OpsPilot Intelligence Services.
        </p>
        <button 
          onClick={onRetry} 
          className="px-5 py-2 border border-red-500/40 text-red-400 font-mono text-xs rounded transition-all hover:bg-red-500/10 uppercase tracking-widest font-semibold hover:shadow-[0_0_10px_rgba(239,68,68,0.1)]"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="w-full py-16 px-6 bg-brand-panel border border-brand-border rounded-lg text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
        <h4 className="text-white font-medium text-lg mb-2">
          No incidents recorded.
        </h4>
        <p className="text-brand-textDim text-sm font-mono tracking-wide">
          OpsPilot has not detected any incidents yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id || incident._id} incident={incident} />
      ))}
    </div>
  );
}
