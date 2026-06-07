import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

/**
 * Outline button to flag an incident as resolved in the database.
 */
export default function ResolveButton({ incidentId, onSuccess }) {
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    if (isResolving) return;
    setIsResolving(true);
    try {
      // Connects to Node Express backend API using base URL overrides
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      await axios.patch(`${API_BASE_URL}/api/v1/incidents/${incidentId}/resolve`);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to resolve incident:', err);
      alert('Failed to resolve incident. Please verify database connection and try again.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <button
      onClick={handleResolve}
      disabled={isResolving}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-accent/40 text-brand-accent hover:border-brand-accent hover:bg-brand-accent/10 transition-all text-xs font-mono font-bold tracking-widest uppercase rounded disabled:opacity-50 select-none cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.02)] font-semibold"
    >
      {isResolving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {isResolving ? 'RESOLVING...' : 'MARK AS RESOLVED'}
    </button>
  );
}
