import React, { useState } from 'react';
import LoadingState from '../../components/shared/LoadingState.jsx';
import ErrorState from '../../components/shared/ErrorState.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';

function PatientPrescriptionHistoryPage() {
  const [loading] = useState(false);
  const [error] = useState(null);
  const [data] = useState(null);

  let content;
  if (loading) {
    content = <LoadingState label="Loading your prescription history…" />;
  } else if (error) {
    content = (
      <ErrorState
        message="We couldn't load your historical prescriptions."
        onRetry={null}
      />
    );
  } else if (!data) {
    content = (
      <EmptyState
        title="No prescription history yet"
        description="Past prescriptions and refills will be listed here when data is available."
      />
    );
  } else {
    content = <div className="text-sm text-muted">Prescription history placeholder.</div>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Prescription history</h1>
        <p className="text-sm text-muted">
          Download and review your historical records.
        </p>
      </header>
      <div className="rounded-xl bg-surface border border-border p-6">{content}</div>
    </section>
  );
}

export default PatientPrescriptionHistoryPage;

