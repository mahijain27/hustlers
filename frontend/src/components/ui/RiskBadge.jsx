import React from 'react';

const levelStyles = {
  high: 'bg-danger/10 text-danger border border-danger/20',
  medium: 'bg-warning/10 text-warning border border-warning/20',
  low: 'bg-success/10 text-success border border-success/20',
};

function RiskBadge({ level = 'high', children, className = '' }) {
  const base =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider uppercase';
  const variant = levelStyles[level] ?? levelStyles.high;

  return <span className={`${base} ${variant} ${className}`}>{children}</span>;
}

export default RiskBadge;

