import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';

/**
 * Visual bar chart rendering Prometheus time-series values.
 */
export default function PrometheusChart({ source }) {
  const values = source?.data?.result?.[0]?.values || [];
  const hasData = source && values.length > 0;

  // Parse time series values: ["1780811474: 82", "1780811594: 245", ...]
  const chartData = values.map((item, index, arr) => {
    const parts = item.split(':');
    const rawTimestamp = parts[0]?.trim() || '';
    const rawValue = Number(parts[1]?.trim() || 0);

    // Format UNIX seconds to HH:MM format
    let displayTime = '';
    if (rawTimestamp) {
      const date = new Date(Number(rawTimestamp) * 1000);
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      displayTime = `${hours}:${minutes}`;
      
      // Append CURRENT tag to the latest index item
      if (index === arr.length - 1) {
        displayTime += ' (CURRENT)';
      }
    }

    return {
      timestamp: displayTime,
      value: rawValue,
    };
  });

  const valuesOnly = chartData.map(d => d.value);
  const maxVal = valuesOnly.length > 0 ? Math.max(...valuesOnly) : 0;
  const chartMax = maxVal > 0 ? maxVal * 1.15 : 100;

  const latestMetric = hasData ? (source.data.value || `${chartData[chartData.length - 1]?.value || 0} req/s`) : 'N/A';
  const metricSubtitle = source?.description || 'namespace: production / svc: telemetry-api';

  return (
    <div className="w-full p-6 bg-brand-panel border border-brand-border rounded-lg flex flex-col h-[320px] justify-between">
      {/* Header section with titles and prominent latest value (always visible) */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-white text-base md:text-lg font-bold tracking-wide">
            Error Rate (Prometheus)
          </h4>
          <span className="text-3xs font-mono tracking-widest text-brand-textDim uppercase mt-0.5 block select-text">
            {metricSubtitle}
          </span>
        </div>

        {hasData && (
          <div className="text-right select-text">
            <div className="text-white text-xl md:text-2xl font-mono font-bold tracking-tight">
              {latestMetric}
            </div>
            {/* Subtle percentage variance mock indicator matching screenshot */}
            <span className="text-red-400 font-mono text-3xs font-bold tracking-wider mt-0.5 block">
              &bull;&nbsp;&nbsp;~ +312%
            </span>
          </div>
        )}
      </div>

      {/* Recharts Bar Chart Area or Empty State Box */}
      {hasData ? (
        <div className="w-full h-[180px] min-h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 18, right: 10, left: 10, bottom: 0 }}>
              <XAxis 
                dataKey="timestamp" 
                stroke="#1b253b"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8b9bb4', fontSize: 10, fontFamily: 'monospace', dy: 10 }}
              />
              {/* Using static domain to guarantee proper scaling */}
              <YAxis hide domain={[0, chartMax]} />
              <Bar 
                dataKey="value" 
                fill="rgba(239, 68, 68, 0.25)" 
                stroke="rgba(239, 68, 68, 0.6)"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                barSize={90}
              >
                {/* Metric values centered directly on top of bars */}
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  fill="#ffffff" 
                  style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 w-full flex items-center justify-center border border-dashed border-brand-border/40 rounded bg-slate-900/10 min-h-[160px]">
          <span className="text-xs font-mono text-brand-textDim uppercase tracking-widest">
            No data to display
          </span>
        </div>
      )}
    </div>
  );
}
