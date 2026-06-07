import React from 'react';
import { ExternalLink, GitPullRequest } from 'lucide-react';

/**
 * Github activity detail section displaying merged configurations or pull requests.
 */
export default function GithubActivity({ source }) {
  const prs = source?.data?.pull_requests || [];
  const hasData = source && prs.length > 0;

  // Format merge date UTC: June 07, 2026 10:00 UTC
  const formatMergeDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getUTCMonth()];
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${month} ${day} &bull; ${hours}:${minutes} UTC`;
  };

  return (
    <div className="w-full p-6 bg-brand-panel border border-brand-border rounded-lg flex flex-col h-[320px] justify-between">
      {/* Title Header (Always Visible) */}
      <div>
        <div className="flex items-center gap-2 mb-0.5 select-none">
          <GitPullRequest className="h-4 w-4 text-emerald-400" />
          <h4 className="text-white text-base md:text-lg font-bold tracking-wide">
            Related Activity
          </h4>
        </div>
        <span className="text-3xs font-mono tracking-widest text-brand-textDim uppercase block select-text">
          {source?.description || 'REPOSITORY LOG TIMELINES'}
        </span>
      </div>

      {/* Body Area */}
      {hasData ? (
        <div className="flex-1 my-4 overflow-y-auto space-y-4">
          {prs.map((pr, idx) => {
            // Parse lines additions/deletions out of diff summary text (e.g. +114 -42) if present
            const additionsMatch = pr.diff_summary?.match(/\+(\d+)/);
            const deletionsMatch = pr.diff_summary?.match(/-(\d+)/);
            
            const additions = additionsMatch ? additionsMatch[1] : null;
            const deletions = deletionsMatch ? deletionsMatch[1] : null;
            
            // Strip diff line suffix from description if it exists
            const cleanDesc = pr.diff_summary 
              ? pr.diff_summary.replace(/\+\d+\s*-\d+$/, '').trim() 
              : '';

            return (
              <div key={idx} className="space-y-3">
                {/* Badge row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">
                    PR #{pr.pr_number}
                  </span>

                  <span className="text-4xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 uppercase">
                    {pr.state || 'MERGED'}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h5 className="text-slate-100 text-sm font-medium tracking-wide mb-1 leading-snug select-text">
                    {pr.title}
                  </h5>
                  <p className="text-xs text-brand-textDim font-sans leading-relaxed select-text">
                    {cleanDesc}
                  </p>
                </div>

                {/* Stats & Merge Timestamp indicators */}
                <div className="flex items-center justify-between border-t border-brand-border/40 pt-2 text-2xs font-mono">
                  <div className="flex items-center gap-3">
                    {additions && (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        +{additions}
                      </span>
                    )}
                    {deletions && (
                      <span className="inline-flex items-center gap-1 text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        -{deletions}
                      </span>
                    )}
                  </div>

                  <span 
                    className="text-brand-textDim/80"
                    dangerouslySetInnerHTML={{ __html: formatMergeDate(pr.merge_date) }}
                  />
                </div>

                {/* Dynamic View Diff Button inside loop if present */}
                {pr.url && (
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 border border-brand-border text-brand-textDim hover:border-brand-accent/40 hover:bg-slate-900/10 hover:text-brand-accent transition-all text-2xs font-mono font-bold tracking-widest uppercase rounded cursor-pointer"
                  >
                    VIEW GITHUB DIFF
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border border-dashed border-brand-border/40 rounded bg-slate-900/10 my-4">
          <span className="text-xs font-mono text-brand-textDim uppercase tracking-widest">
            No data to display
          </span>
        </div>
      )}
    </div>
  );
}
