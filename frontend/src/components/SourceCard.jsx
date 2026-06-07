import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Server, GitBranch, Layers } from 'lucide-react';

/**
 * A beautiful, syntax-colored JSON formatter for nested payloads.
 */
function JsonViewer({ data }) {
  if (!data) return null;
  
  // Syntax highlighting logic for JSON text
  const formatJson = (obj) => {
    const jsonStr = JSON.stringify(obj, null, 2);
    // Escape HTML special characters
    const escaped = jsonStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    // Replace keys and values with colored span tags
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-sky-300'; // Default string color
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-teal-400 font-semibold'; // Key color
          } else {
            cls = 'text-emerald-300'; // String value color
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-amber-400'; // Boolean
        } else if (/null/.test(match)) {
          cls = 'text-slate-500'; // Null
        } else {
          cls = 'text-purple-400'; // Number
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  const highlightedHtml = formatJson(data);

  return (
    <pre className="font-mono text-xs bg-slate-950 p-4 rounded border border-brand-border overflow-x-auto leading-relaxed max-w-full shadow-inner select-text">
      <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
    </pre>
  );
}

/**
 * Expandable card showing data from individual incident telemetry systems.
 */
export default function SourceCard({ source }) {
  const [isOpen, setIsOpen] = useState(false);
  const { name, description, data = {} } = source;

  // Icon selector based on name
  const getIcon = () => {
    switch (name) {
      case 'PROMETHEUS':
        return <Cpu className="h-5 w-5 text-purple-400" />;
      case 'KIBANA':
        return <Server className="h-5 w-5 text-amber-400" />;
      case 'GITHUB':
        return <GitBranch className="h-5 w-5 text-sky-400" />;
      case 'ARGO':
        return <Layers className="h-5 w-5 text-cyan-400" />;
      default:
        return <Server className="h-5 w-5 text-brand-accent" />;
    }
  };

  // Helper formatting for each system
  const renderPrometheus = () => {
    const query = data.query || data.metric || 'node_cpu_seconds_total';
    const value = data.value !== undefined ? data.value : 'N/A';
    const threshold = data.threshold !== undefined ? data.threshold : 'N/A';
    const labels = data.labels || data.filters || {};

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">Metric Query</span>
            <span className="text-white font-mono text-sm break-all font-semibold">{query}</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border flex items-center justify-between">
            <div>
              <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">Observed Value</span>
              <span className="text-red-400 font-mono text-lg font-bold">{value}</span>
            </div>
            {threshold !== 'N/A' && (
              <div className="text-right">
                <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">Limit Threshold</span>
                <span className="text-slate-400 font-mono text-sm">{threshold}</span>
              </div>
            )}
          </div>
        </div>
        {Object.keys(labels).length > 0 && (
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-2 font-mono uppercase tracking-wider">Active Labels / Filters</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(labels).map(([key, val]) => (
                <span key={key} className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                  {key}: <strong className="text-white">{String(val)}</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderKibana = () => {
    const searchString = data.query || data.searchString || data.search_string || 'service:checkout-service';
    const hits = data.hits !== undefined ? data.hits : 'N/A';
    const logs = data.logs || (data.message ? [data.message] : []);
    const stackTraces = data.stack_trace || data.stack_traces || data.stackTraces || [];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">Search String</span>
            <span className="text-white font-mono text-sm font-semibold">{searchString}</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">Query Hits Count</span>
            <span className="text-amber-400 font-mono text-lg font-bold">{hits} matches</span>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-2 font-mono uppercase tracking-wider">Captured Log Entries</span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {logs.map((log, idx) => (
                <div key={idx} className="p-2 bg-slate-950 text-xs text-slate-300 font-mono rounded border border-slate-900 whitespace-pre-wrap select-text">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {stackTraces.length > 0 && (
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-2 font-mono uppercase tracking-wider">Active Stack Traces</span>
            <div className="p-3 bg-slate-950 rounded border border-slate-900 overflow-x-auto">
              <pre className="font-mono text-2xs text-red-300 leading-relaxed select-text">
                {Array.isArray(stackTraces) ? stackTraces.join('\n') : stackTraces}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGithub = () => {
    const prNumber = data.pr_number || data.pr_id || 'N/A';
    const title = data.title || data.pr_title || 'Update Configuration';
    const diffSummary = data.changes || data.diff_summary || data.diff || {};
    const mergeDate = data.merged_at || data.merge_date || 'N/A';
    const author = data.author || 'system';

    const formattedMerge = mergeDate !== 'N/A' 
      ? new Date(mergeDate).toLocaleString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC' 
      : 'N/A';

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">Pull Request Title</span>
            <span className="text-white text-sm font-semibold">{title}</span>
          </div>
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">PR Number</span>
              <span className="text-sky-400 font-mono text-base font-bold">#{prNumber}</span>
            </div>
            <div>
              <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">Author</span>
              <span className="text-slate-300 font-mono text-sm">{author}</span>
            </div>
          </div>
        </div>

        {Object.keys(diffSummary).length > 0 && (
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-2 font-mono uppercase tracking-wider">Diff Summary</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {diffSummary.files && (
                <div className="col-span-full mb-1">
                  <span className="text-2xs text-brand-textDim block mb-1">Files Affected</span>
                  <div className="flex flex-wrap gap-1">
                    {diffSummary.files.map((file) => (
                      <span key={file} className="text-2xs font-mono bg-slate-950 px-2 py-0.5 rounded text-white border border-slate-900">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {diffSummary.additions !== undefined && (
                <div className="p-2 bg-emerald-950/20 border border-emerald-900/40 rounded text-center">
                  <span className="text-3xs text-emerald-500 uppercase font-mono block">Additions</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">+{diffSummary.additions} lines</span>
                </div>
              )}
              {diffSummary.deletions !== undefined && (
                <div className="p-2 bg-red-950/20 border border-red-900/40 rounded text-center">
                  <span className="text-3xs text-red-500 uppercase font-mono block">Deletions</span>
                  <span className="text-red-400 font-mono font-bold text-sm">-{diffSummary.deletions} lines</span>
                </div>
              )}
            </div>
          </div>
        )}

        {mergeDate !== 'N/A' && (
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">Merged Timestamp</span>
            <span className="text-slate-300 font-mono text-sm">{formattedMerge}</span>
          </div>
        )}
      </div>
    );
  };

  const renderArgo = () => {
    const deployment = data.deployment_data || data.deployment || {};
    const rollback = data.rollback_data || data.rollback || {};
    const syncEvents = data.sync_events || data.sync || [];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">Deployment Version Details</span>
            {Object.keys(deployment).length > 0 ? (
              <div className="space-y-1.5 font-mono text-xs text-white">
                <div>App: <strong className="text-cyan-400">{deployment.app || 'N/A'}</strong></div>
                <div>Revision: <strong className="text-slate-300">{deployment.revision || 'N/A'}</strong></div>
                <div>Replicas: <strong>{deployment.replicas || 'N/A'}</strong></div>
              </div>
            ) : (
              <span className="text-slate-400 font-mono text-xs">No active deployment parameters specified</span>
            )}
          </div>

          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-1 font-mono uppercase tracking-wider">Rollback Trigger Parameters</span>
            {Object.keys(rollback).length > 0 ? (
              <div className="space-y-1.5 font-mono text-xs text-white">
                <div>Required: <strong className={rollback.required ? 'text-red-400' : 'text-emerald-400'}>{rollback.required ? 'YES' : 'NO'}</strong></div>
                {rollback.target_version && <div>Target Version: <strong className="text-yellow-400">{rollback.target_version}</strong></div>}
                {rollback.reason && <div>Reason: <strong className="text-slate-300">{rollback.reason}</strong></div>}
              </div>
            ) : (
              <span className="text-slate-400 font-mono text-xs">No rollback actions recorded</span>
            )}
          </div>
        </div>

        {syncEvents.length > 0 && (
          <div className="p-3 bg-slate-900/40 rounded border border-brand-border">
            <span className="text-xs text-brand-textDim block mb-2 font-mono uppercase tracking-wider">ArgoCD Sync Events</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {syncEvents.map((event, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-900 font-mono text-2xs">
                  <span className="text-slate-300 truncate mr-2">{event.message || event.description || 'Synced successfully'}</span>
                  <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
                    event.status === 'Synced' || event.status === 'Healthy'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                      : 'bg-yellow-950 text-yellow-400 border border-yellow-900'
                  }`}>
                    {event.status || 'SUCCESS'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDetails = () => {
    switch (name) {
      case 'PROMETHEUS':
        return renderPrometheus();
      case 'KIBANA':
        return renderKibana();
      case 'GITHUB':
        return renderGithub();
      case 'ARGO':
        return renderArgo();
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-brand-panel border border-brand-border rounded-lg overflow-hidden transition-all duration-300">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-900/20 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="p-2 bg-slate-900 rounded border border-brand-border">
            {getIcon()}
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest text-white uppercase font-mono block mb-0.5">
              {name}
            </span>
            <span className="text-xs text-brand-textDim font-sans">
              {description}
            </span>
          </div>
        </div>
        <div className="text-brand-textDim/50">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-brand-border bg-brand-bg/20 space-y-6 pt-6">
          {/* Formatted metrics/data cards */}
          {renderDetails()}

          {/* Raw JSON block */}
          <div className="space-y-2">
            <span className="text-xs text-brand-textDim font-mono uppercase tracking-wider block">
              Raw Payload Diagnostics
            </span>
            <JsonViewer data={data} />
          </div>
        </div>
      )}
    </div>
  );
}
