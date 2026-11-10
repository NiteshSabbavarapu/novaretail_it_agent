import React from 'react';

const VARIANTS = {
  purple: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
  blue: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  gray: 'bg-dark-800 text-dark-300 border-dark-700',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  dark: 'bg-dark-800 text-dark-300 border-dark-700',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export default function Badge({ children, variant = 'dark', className = '', size = 'sm' }) {
  const sizeClasses = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${VARIANTS[variant] || VARIANTS.dark} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
}

