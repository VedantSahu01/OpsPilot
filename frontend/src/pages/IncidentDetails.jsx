import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useIncident } from '../hooks/useIncident';
import StatusBadge from '../components/StatusBadge';
import ResolveButton from '../components/ResolveButton';
import PrometheusChart from '../components/PrometheusChart';
import GithubActivity from '../components/GithubActivity';
import KibanaStackTrace from '../components/KibanaStackTrace';
import ArgoDeployment from '../components/ArgoDeployment';
import Footer from '../components/Footer';
import { ArrowLeft, Loader2, AlertCircle, AlertOctagon } from 'lucide-react';

/**
 * Enhanced Incident detailed RCA root cause analysis view.
 */
export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useIncident(id);

  const incident = data?.data;

  // Handle back button navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Safe data extraction lookups
  const prometheusSource = incident?.sources?.find(s => s.name === 'PROMETHEUS');
  const githubSource = incident?.sources?.find(s => s.name === 'GITHUB');
  const kibanaSource = incident?.sources?.find(s => s.name === 'KIBANA');
  const argoSource = incident?.sources?.find(s => s.name === 'ARGO');

  // Short ID parser: last 5 characters
  const getShortId = (idString) => {
    if (!idString) return '';
    return idString.substring(Math.max(0, idString.length - 5)).toUpperCase();
  };

  const shortId = getShortId(incident?.id || incident?._id);

  return (
    <div className="bg-brand-bg min-h-screen text-slate-100 flex flex-col antialiased select-none">
      {/* Navbar with Functional Back Button */}
      <header className="w-full border-b border-brand-border py-4 md:py-6 px-6 bg-brand-bg/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-extrabold text-xl md:text-2xl tracking-tight text-white font-sans">
              Ops<span className="text-brand-accent">Pilot</span>
            </span>
          </Link>
          
          <button 
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-brand-textDim uppercase transition-colors hover:text-brand-accent group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
        </div>
      </header>

      {/* Page Body Container */}
      <main className="max-w-6xl mx-auto w-full px-6 flex flex-col flex-1 py-8 md:py-12">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 flex-1">
            <Loader2 className="h-10 w-10 animate-spin text-brand-accent mb-4" />
            <p className="text-xs font-mono text-brand-textDim tracking-widest uppercase">
              Analyzing Telemetry Diagnostics...
            </p>
          </div>
        )}

        {/* Error Callout */}
        {isError && (
          <div className="w-full py-16 px-6 bg-brand-panel border border-red-500/20 rounded-lg text-center flex flex-col items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.02)] flex-1 my-auto max-w-2xl mx-auto">
            <AlertOctagon className="h-10 w-10 text-red-400 mb-4" />
            <p className="text-red-400 font-mono text-sm tracking-wider mb-2">
              Unable to locate incident diagnostics.
            </p>
            <p className="text-xs text-brand-textDim mb-6 max-w-sm">
              The service could be offline or the requested incident ID format is invalid.
            </p>
            <button 
              onClick={refetch} 
              className="px-5 py-2.5 border border-red-500/40 text-red-400 font-mono text-xs rounded transition-all hover:bg-red-500/10 uppercase tracking-widest font-semibold cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* RCA Diagnostics Report Grid */}
        {!isLoading && !isError && incident && (
          <article className="space-y-10">
            {/* Header section with Alert Level, Title, Badge, and Action Button */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-3 flex-1">
                {/* Dynamic Critical Alert Label */}
                <div className={`text-xs font-mono font-bold tracking-wider flex items-center gap-2 select-text ${
                  incident.resolved ? 'text-emerald-400' : 'text-red-500'
                }`}>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {incident.resolved ? 'RESOLVED INCIDENT' : 'CRITICAL ALERT'} &bull; ID-{shortId}
                  </span>
                </div>

                {/* Heading */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight select-text">
                  {incident.heading}
                </h1>
              </div>

              {/* Dynamic Status Badging and CTA block */}
              <div className="flex items-center gap-4 flex-shrink-0 self-start md:self-auto">
                <StatusBadge resolved={incident.resolved} />
                
                {/* Show resolve button only if unresolved */}
                {!incident.resolved && (
                  <ResolveButton incidentId={incident.id || incident._id} onSuccess={refetch} />
                )}
              </div>
            </div>

            {/* Summary Block */}
            <section className="p-6 bg-brand-panel border border-brand-border rounded-lg select-text shadow-[0_0_20px_rgba(16,185,129,0.01)] whitespace-pre-wrap leading-relaxed text-slate-300 font-sans">
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-brand-accent mb-3 select-none">
                Autonomous Executive Summary
              </h3>
              <p className="text-sm md:text-base">
                {incident.summary}
              </p>
            </section>

            {/* Telemetry Metrics Area (Archive section removed entirely) */}
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  RCA Telemetry Diagnostics
                </h3>
                <p className="text-3xs font-mono tracking-widest text-brand-textDim uppercase mt-0.5 select-none">
                  CROSS-PLATFORM INTEGRATED TELEMETRY WIDGETS
                </p>
              </div>

              {/* Layout grid containing telemetry integrations */}
              <div className="space-y-6">
                {/* Row 1: Prometheus and GitHub timeline widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PrometheusChart source={prometheusSource} />
                  <GithubActivity source={githubSource} />
                </div>

                {/* Row 2: Kibana stack trace query hits logs */}
                <KibanaStackTrace source={kibanaSource} />

                {/* Row 3: Argo rollout synchronization */}
                <ArgoDeployment source={argoSource} />
              </div>
            </section>
          </article>
        )}
      </main>

      {/* Centered copyright Footer */}
      <Footer />
    </div>
  );
}
