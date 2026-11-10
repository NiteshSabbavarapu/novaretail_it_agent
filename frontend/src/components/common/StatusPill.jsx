import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

export default function StatusPill({ status = 'completed', size = 'sm' }) {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'completed':
    case 'success':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Completed
        </span>
      );
    case 'running':
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
          <Clock className="w-3 h-3 animate-spin" />
          Running
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-dark-800 text-dark-400 border border-dark-700">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case 'skipped':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-dark-800/60 text-dark-400 border border-dark-700/60">
          <ArrowRight className="w-3 h-3" />
          Skipped
        </span>
      );
    case 'failed':
    case 'error':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    case 'warning':
    case 'fallback':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" />
          Fallback
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-dark-800 text-dark-400 border border-dark-700">
          {status}
        </span>
      );
  }
}

