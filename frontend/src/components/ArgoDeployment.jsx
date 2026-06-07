import React from 'react';
import { Layers, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Renders deployment and rollout information from ArgoCD.
 */
export default function ArgoDeployment({ source }) {
  const data = source?.data || {};
  const hasData = source && (data.deployment || data.version || data.status);

  // Format Sync UTC time
  const formatSyncTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toUTCString().replace('GMT', 'UTC');
  };

  return (
    <div className="w-full p-6 bg-brand-panel border border-brand-border rounded-lg flex flex-col space-y-4">
      {/* Title (Always Visible) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <Layers className="h-4 w-4 text-cyan-400" />
          <h4 className="text-white text-base md:text-lg font-bold tracking-wide">
            Argo CD Rollout Status
          </h4>
        </div>
        
        {/* Dynamic Status badge */}
        {hasData && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-4xs font-mono font-bold tracking-wider uppercase border select-none ${
            data.status === 'Healthy'
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
              : 'bg-yellow-950/20 border-yellow-500/30 text-yellow-400'
          }`}>
            {data.status === 'Healthy' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {data.status || 'Syncing'}
          </span>
        )}
      </div>

      {/* Body Area */}
      {hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Parameter Panel */}
          <div className="p-4 bg-slate-900/40 border border-brand-border rounded font-mono text-xs text-white space-y-2 select-text">
            <div>
              <span className="text-4xs text-brand-textDim block uppercase mb-0.5">Application Deployment</span>
              <span className="font-semibold">{data.deployment}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-4xs text-brand-textDim block uppercase mb-0.5">Active Tag</span>
                <span className="text-cyan-400 font-semibold">{data.version}</span>
              </div>
              {data.sync_at && (
                <div>
                  <span className="text-4xs text-brand-textDim block uppercase mb-0.5">Last Synced</span>
                  <span className="text-slate-300 text-3xs font-medium">{formatSyncTime(data.sync_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Event Logs */}
          <div className="p-4 bg-slate-900/40 border border-brand-border rounded font-mono text-xs space-y-2 flex flex-col justify-center">
            <span className="text-4xs text-brand-textDim block uppercase mb-1.5 select-none">Sync Events Timeline</span>
            {data.events && data.events.length > 0 ? (
              <div className="space-y-1.5 select-text">
                {data.events.map((evt, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-1.5 bg-slate-950 rounded text-slate-300 text-3xs border border-slate-900 leading-normal">
                    <span className="text-emerald-400 select-none">&bull;</span>
                    {evt}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-brand-textDim text-3xs italic">No synchronization events logged</span>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full py-12 border border-dashed border-brand-border/40 rounded bg-slate-900/10 flex items-center justify-center">
          <span className="text-xs font-mono text-brand-textDim uppercase tracking-widest">
            No data to display
          </span>
        </div>
      )}
    </div>
  );
}
