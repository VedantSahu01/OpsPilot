import React from 'react';

/**
 * System status banner calculating if there's an active incident (<= 30 minutes old).
 */
export default function StatusBanner({ incidents = [] }) {
  const latestIncident = incidents[0];
  
  let isIncidentLive = false;
  if (latestIncident && latestIncident.createdAt) {
    const latestTime = new Date(latestIncident.createdAt).getTime();
    const currentTime = Date.now();
    const diffMin = (currentTime - latestTime) / (1000 * 60);
    // Incident is live if it was created within the last 30 minutes
    isIncidentLive = diffMin >= 0 && diffMin <= 30;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 max-w-3xl mx-auto">
      {/* Dynamic Status Badge */}
      <div className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-full border tracking-widest text-xs font-mono font-bold transition-all duration-500 uppercase ${
        isIncidentLive
          ? 'bg-red-950/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
          : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
      }`}>
        <span className={`h-2 w-2 rounded-full relative flex ${
          isIncidentLive ? 'bg-red-500' : 'bg-emerald-400'
        }`}>
          {isIncidentLive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          )}
        </span>
        {isIncidentLive ? 'INCIDENT LIVE' : 'ALL SYSTEMS NOMINAL'}
      </div>

      {/* Dynamic Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mt-8 mb-6 transition-all duration-500">
        {isIncidentLive ? 'Live Incident Intelligence' : 'Vigilant Monitoring'}
      </h1>

      {/* Dynamic Description */}
      <p className="text-base md:text-lg text-brand-textDim leading-relaxed max-w-2xl transition-all duration-500">
        {isIncidentLive
          ? 'OpsPilot AI has detected an active incident and is currently performing autonomous root cause analysis.'
          : 'OpsPilot AI is currently overseeing all monitored systems. No active incidents detected.'}
      </p>
    </div>
  );
}
