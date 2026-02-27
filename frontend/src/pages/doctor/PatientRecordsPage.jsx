import React, { useState } from 'react';
import LoadingState from '../../components/shared/LoadingState.jsx';
import ErrorState from '../../components/shared/ErrorState.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';

function DoctorPatientRecordsPage() {
  const [loading] = useState(false);
  const [error] = useState(null);
  const [data] = useState(null);

  let content;
  if (loading) {
    content = <LoadingState label="Loading patient registry…" />;
  } else if (error) {
    content = (
      <ErrorState
        message="We couldn't load patient records."
        onRetry={null}
      />
    );
  } else if (!data) {
    content = (
      <EmptyState
        title="No patients loaded"
        description="Once connected to your practice system, patient cards and medication summaries will appear here."
      />
    );
  } else {
    content = <div className="text-sm text-muted">Patient grid placeholder.</div>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Patient records</h1>
        <p className="text-sm text-muted">
          Browse patients with quick access to risk flags and current medications.
        </p>
      </header>
      <div className="rounded-xl bg-surface border border-border p-6">{content}</div>
    </section>
  );
}

export default DoctorPatientRecordsPage;

