import React from 'react';
import { Terminal } from 'lucide-react';

/**
 * Scrollable code-style diagnostics trace log block for Kibana outputs.
 */
export default function KibanaStackTrace({ source }) {
  const hits = source?.data?.hits || [];
  const hasData = source && hits.length > 0;

  return (
    <div className="w-full p-6 bg-brand-panel border border-brand-border rounded-lg flex flex-col space-y-4">
      {/* Title Header (Always Visible) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-amber-400" />
          <h4 className="text-white text-base md:text-lg font-bold tracking-wide">
            Stack Trace (Kibana)
          </h4>
        </div>
        <span className="text-4xs font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-slate-900 border border-brand-border text-brand-textDim uppercase select-none">
          {source?.description || 'cluster: us-east-1 / pod: log-aggregator'}
        </span>
      </div>

      {/* Code Block log container or empty state placeholder */}
      {hasData ? (
        <div className="w-full bg-slate-950 rounded border border-brand-border overflow-hidden shadow-inner">
          <div className="max-h-72 overflow-y-auto overflow-x-auto p-4 flex flex-col space-y-4 select-text">
            {hits.map((hit, idx) => (
              <div key={idx} className="font-mono text-2xs md:text-xs text-red-300/95 leading-relaxed whitespace-pre font-medium">
                {/* Highlight log line details */}
                <div className="flex items-center flex-wrap gap-2 text-red-400 mb-1 border-b border-red-500/10 pb-1.5 font-semibold">
                  <span>{hit.timestamp}</span>
                  <span className="px-1.5 py-0.2 bg-red-950/40 text-red-400 border border-red-900/50 rounded text-3xs tracking-wider">
                    [{hit.log_level || 'ERROR'}]
                  </span>
                  <span className="text-slate-300 break-all">{hit.message}</span>
                </div>
                
                {/* Scrollable trace content */}
                {hit.stack_trace && (
                  <div className="text-slate-300 pl-4 py-1 border-l-2 border-red-500/20 break-all select-text whitespace-pre overflow-x-auto">
                    {hit.stack_trace}
                  </div>
                )}
              </div>
            ))}
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
