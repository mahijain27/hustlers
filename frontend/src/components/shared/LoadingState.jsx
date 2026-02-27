import React from 'react';

function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="inline-flex items-center gap-3 rounded-lg bg-surface-muted border border-border px-4 py-3">
        <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm font-medium text-muted">{label}</span>
      </div>
    </div>
  );
}

export default LoadingState;

