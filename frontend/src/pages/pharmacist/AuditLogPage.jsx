import React, { useState } from 'react';
import LoadingState from '../../components/shared/LoadingState.jsx';
import ErrorState from '../../components/shared/ErrorState.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';
import Icon from '../../components/ui/Icon.jsx';

const mockAuditLog = {
  filters: {
    risk: 'All',
    range: 'Last 30 days',
  },
  rows: [
    {
      date: 'Oct 24, 2023',
      time: '09:42 AM',
      initials: 'SC',
      pharmacist: 'Sarah Chen, PharmD',
      patientId: 'PT-8829-X',
      riskScore: 92,
      riskLevel: 'High',
      outcome: 'Flagged',
    },
  ],
};

function PharmacistAuditLogPage() {
  const [loading] = useState(false);
  const [error] = useState(null);
  const [data] = useState(mockAuditLog);

  let content;
  if (loading) {
    content = <LoadingState label="Loading pharmacist audit log…" />;
  } else if (error) {
    content = (
      <ErrorState
        message="We couldn't load recent pharmacist interventions."
        onRetry={null}
      />
    );
  } else if (!data) {
    content = (
      <EmptyState
        title="No audit entries yet"
        description="When pharmacists review AI recommendations, a detailed audit trail will be available here."
      />
    );
  } else {
    content = (
      <main className="space-y-6">
        {/* Filters bar */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center justify-center">
                <Icon name="search" size={18} />
              </span>
              <input
                type="text"
                placeholder="Search pharmacist or patient ID..."
                className="w-full pl-10 pr-4 py-2 bg-surface-muted border-none rounded-lg focus:ring-2 focus:ring-primary text-sm text-foreground"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 bg-surface-muted rounded-lg text-sm font-medium border border-border hover:bg-surface transition-colors"
            >
              <Icon name="calendar_today" size={16} />
              <span>{data.filters.range}</span>
              <Icon name="expand_more" size={16} />
            </button>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="flex bg-surface-muted p-1 rounded-lg">
              <button
                type="button"
                className="px-3 py-1 text-xs font-bold rounded-md bg-surface shadow-sm text-foreground"
              >
                All
              </button>
              <button
                type="button"
                className="px-3 py-1 text-xs font-medium text-danger"
              >
                High risk
              </button>
              <button
                type="button"
                className="px-3 py-1 text-xs font-medium text-warning"
              >
                Medium
              </button>
              <button
                type="button"
                className="px-3 py-1 text-xs font-medium text-success"
              >
                Low
              </button>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 bg-surface-muted rounded-lg text-sm font-medium border border-border hover:bg-surface transition-colors"
            >
              <span>Status: {data.filters.risk}</span>
              <Icon name="expand_more" size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">
                    Date &amp; time
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">
                    Pharmacist
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">
                    Patient ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-center">
                    Risk score
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">
                    Outcome
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr
                    key={`${row.patientId}-${row.time}`}
                    className="border-t border-border/40 hover:bg-surface-muted transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {row.date}
                      </div>
                      <div className="text-xs text-muted">{row.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-surface-muted flex items-center justify-center text-xs font-bold text-muted">
                          {row.initials}
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {row.pharmacist}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-muted">
                      {row.patientId}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center size-8 rounded-full border-2 border-danger text-danger text-xs font-bold">
                        {row.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-danger/10 text-danger">
                        {row.riskLevel} risk
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-danger">
                        <Icon name="flag" size={18} />
                        <span className="text-sm font-semibold">{row.outcome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="text-muted hover:text-primary transition-colors p-1"
                      >
                        <Icon name="more_vert" size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-surface-muted border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted">
              Showing 1 to {data.rows.length} of 1,248 entries
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-surface text-muted disabled:opacity-30"
                disabled
              >
                <Icon name="chevron_left" size={18} />
              </button>
              <button
                type="button"
                className="size-8 flex items-center justify-center rounded-lg bg-primary text-surface text-xs font-bold"
              >
                1
              </button>
              <button
                type="button"
                className="size-8 flex items-center justify-center rounded-lg hover:bg-surface text-xs font-medium text-muted"
              >
                2
              </button>
              <button
                type="button"
                className="size-8 flex items-center justify-center rounded-lg hover:bg-surface text-xs font-medium text-muted"
              >
                3
              </button>
              <span className="px-2 text-muted">…</span>
              <button
                type="button"
                className="size-8 flex items-center justify-center rounded-lg hover:bg-surface text-xs font-medium text-muted"
              >
                125
              </button>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-surface text-muted"
              >
                <Icon name="chevron_right" size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer mini-bar */}
        <footer className="px-0 py-2 border-t border-border flex justify-between items-center">
          <div className="flex gap-6 overflow-x-auto">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-success" />
              <span className="text-xs font-semibold text-muted">842 auto‑approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-danger" />
              <span className="text-xs font-semibold text-muted">
                12 flagged high risk
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-warning" />
              <span className="text-xs font-semibold text-muted">
                24 pending review
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-[10px] text-muted uppercase tracking-widest font-bold">
              System status: optimal
            </span>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <section className="space-y-6 px-4 py-6 md:px-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Pharmacist audit log</h1>
        <p className="text-sm text-muted">
          Traceable history of high‑risk prescriptions, overrides, and approvals.
        </p>
      </header>
      {content}
    </section>
  );
}

export default PharmacistAuditLogPage;

