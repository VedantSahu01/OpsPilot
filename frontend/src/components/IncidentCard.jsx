import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Renders a clickable historical incident card mapping to details view.
 */
export default function IncidentCard({ incident }) {
  const idStr = incident.id || incident._id || '';
  const shortId = `...${idStr.substring(Math.max(0, idStr.length - 5)).toUpperCase()}`;
  
  // Format creation date: Jun 07, 2026
  const formatDate = (dateString) => {
    if (!dateString) return 'Date unknown';
    const date = new Date(dateString);
    // Format in UTC to keep consistent with OpsPilot system logs
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getUTCMonth()];
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formattedDate = formatDate(incident.createdAt);

  return (
    <Link
      to={`/incidents/${incident.id || incident._id}`}
      className="w-full flex items-center justify-between p-6 bg-brand-panel border border-brand-border rounded-lg transition-all duration-300 hover:border-brand-accent/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] group"
    >
      <div className="flex items-center gap-6 md:gap-8 flex-1 min-w-0">
        {/* Incident truncated ID */}
        <span className="font-mono text-sm tracking-wider text-brand-textDim/70 font-semibold select-none">
          #{shortId}
        </span>

        {/* Title and Metadata */}
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-white text-base md:text-lg font-medium tracking-wide mb-1 transition-colors group-hover:text-brand-accent truncate">
            {incident.heading}
          </h3>
          <p className="text-xs text-brand-textDim font-mono tracking-wider">
            {formattedDate} &bull; Root Cause Analysis Generated
          </p>
        </div>
      </div>

      {/* Interactive transition arrow */}
      <div className="flex-shrink-0 text-brand-textDim/50 transition-all duration-300 group-hover:text-brand-accent group-hover:translate-x-1 pl-2">
        <ArrowRight className="h-5 w-5 stroke-[1.5]" />
      </div>
    </Link>
  );
}
