import React, { useState } from 'react';
import LoadingState from '../../components/shared/LoadingState.jsx';
import ErrorState from '../../components/shared/ErrorState.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';

function SystemSettingsPage() {
  const [loading] = useState(false);
  const [error] = useState(null);
  const [data] = useState(null);

  let content;
  if (loading) {
    content = <LoadingState label="Loading AI preferences…" />;
  } else if (error) {
    content = (
      <ErrorState
        message="We couldn't load your current AI and notification settings."
        onRetry={null}
      />
    );
  } else if (!data) {
    content = (
      <EmptyState
        title="No preferences configured"
        description="Configure OCR thresholds, auto‑flag rules, and notification channels here."
      />
    );
  } else {
    content = <div className="text-sm text-muted">System settings placeholder.</div>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">System preferences</h1>
        <p className="text-sm text-muted">
          Control how RxGuard AI analyzes prescriptions and surfaces alerts.
        </p>
      </header>
      <div className="rounded-xl bg-surface border border-border p-6">{content}</div>
    </section>
  );
}

export default SystemSettingsPage;

