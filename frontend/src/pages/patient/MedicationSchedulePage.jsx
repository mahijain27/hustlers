import React, { useState } from 'react';
import LoadingState from '../../components/shared/LoadingState.jsx';
import ErrorState from '../../components/shared/ErrorState.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';

function PatientMedicationSchedulePage() {
  const [loading] = useState(false);
  const [error] = useState(null);
  const [data] = useState(null);

  let content;
  if (loading) {
    content = <LoadingState label="Loading today&apos;s schedule…" />;
  } else if (error) {
    content = (
      <ErrorState
        message="We couldn't load your medication schedule."
        onRetry={null}
      />
    );
  } else if (!data) {
    content = (
      <EmptyState
        title="No schedule configured"
        description="Once your prescriptions are synced, your day‑by‑day schedule will show here."
      />
    );
  } else {
    content = <div className="text-sm text-muted">Medication schedule placeholder.</div>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Medication schedule</h1>
        <p className="text-sm text-muted">
          View and confirm doses throughout your day.
        </p>
      </header>
      <div className="rounded-xl bg-surface border border-border p-6">{content}</div>
    </section>
  );
}

export default PatientMedicationSchedulePage;

