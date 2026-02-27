import React from 'react';

function AlertCard({ tone = 'danger', title, subtitle, patient, actionLabel }) {
  const borderTone =
    tone === 'danger'
      ? 'border-danger'
      : tone === 'warning'
      ? 'border-warning'
      : 'border-primary';

  return (
    <div
      className={`p-4 rounded-lg bg-surface-muted border-l-4 ${borderTone}`}
    >
      <p className="text-xs font-bold text-muted uppercase">{title}</p>
      <p className="text-sm font-semibold mt-1 text-foreground">{subtitle}</p>
      {patient ? (
        <p className="text-xs text-muted mt-2">Patient: {patient}</p>
      ) : null}
      {actionLabel ? (
        <button
          type="button"
          className="mt-3 text-xs font-bold text-primary hover:underline"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default AlertCard;

