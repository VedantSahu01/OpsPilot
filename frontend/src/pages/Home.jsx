import React, { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { incidentsApi } from '../services/incidentsApi';
import StatusBanner from '../components/StatusBanner';
import IncidentList from '../components/IncidentList';
import Footer from '../components/Footer';
import { Download, Asterisk, Loader2 } from 'lucide-react';

/**
 * Main Incident Monitoring Dashboard Page.
 */
export default function Home() {
  const { data, isLoading, isError, refetch } = useIncidents();
  const [isExporting, setIsExporting] = useState(false);

  const incidents = data?.data || [];
  const latestIncident = incidents[0];

  // Format dynamic UTC last refresh: Jun 07, 2026 08:50 UTC
  const formatLastRefresh = (incident) => {
    if (!incident || !incident.createdAt) {
      return 'Last Refresh: No incidents recorded';
    }
    const date = new Date(incident.createdAt);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getUTCMonth()];
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `Last Refresh: ${month} ${day}, ${year} ${hours}:${minutes} UTC`;
  };

  // Trigger browser download of all incidents
  const handleExportLogs = () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const downloadLink = document.createElement('a');
      downloadLink.href = `${baseUrl}/api/v1/incidents/export`;
      downloadLink.setAttribute('download', 'opspilot-incidents.json');
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Failed to export incidents:', err);
      alert('Unable to export logs. Please check connection to OpsPilot services.');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
      }, 600);
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen text-slate-100 flex flex-col select-none antialiased">
      {/* Top Navigation / Header */}
      <header className="w-full border-b border-brand-border py-4 md:py-6 px-6 bg-brand-bg/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl md:text-2xl tracking-tight text-white font-sans">
              Ops<span className="text-brand-accent">Pilot</span>
            </span>
          </div>

          {/* Last Refresh Display */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-brand-textDim font-mono tracking-wider font-medium select-text">
              {isLoading && incidents.length === 0 
                ? 'Last Refresh: Syncing...' 
                : formatLastRefresh(latestIncident)
              }
            </span>
            <Asterisk className="h-4 w-4 text-brand-textDim/40 animate-[spin_8s_linear_infinite]" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-6 flex flex-col flex-1 py-8 md:py-12">
        {/* Dynamic Status Section */}
        <StatusBanner incidents={incidents} />

        {/* Horizontal Divider */}
        <hr className="border-brand-border my-12 w-full" />

        {/* Incident Archive Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white">
              Incident Archive
            </h2>
            <p className="text-3xs tracking-widest text-brand-textDim uppercase font-mono mt-1 font-semibold">
              HISTORICAL INCIDENT RESOLUTIONS
            </p>
          </div>

          {/* Export Logs Button */}
          <button
            onClick={handleExportLogs}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-brand-panel border border-brand-accent/30 text-brand-accent text-xs font-mono font-bold tracking-widest uppercase rounded transition-all duration-300 hover:bg-brand-accent/10 hover:border-brand-accent/60 disabled:opacity-50 select-none shadow-[0_0_15px_rgba(16,185,129,0.02)]"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {isExporting ? 'EXPORTING...' : 'EXPORT LOGS'}
          </button>
        </div>

        {/* Incident Cards list */}
        <IncidentList 
          incidents={incidents} 
          isLoading={isLoading && incidents.length === 0} 
          isError={isError} 
          onRetry={refetch} 
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
