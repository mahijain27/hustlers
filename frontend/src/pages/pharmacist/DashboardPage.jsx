import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import LoadingState from '../../components/shared/LoadingState.jsx';
import ErrorState from '../../components/shared/ErrorState.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import RiskBadge from '../../components/ui/RiskBadge.jsx';
import AlertCard from '../../components/ui/AlertCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table.jsx';
import Icon from '../../components/ui/Icon.jsx';

const mockDashboardData = {
  stats: {
    totalScans: { value: '1,284', trend: '+12%' },
    highRiskAlerts: { value: '12', trend: '+5%' },
    pendingReviews: { value: '45', trend: '-8%' },
    ocrAccuracy: { value: '99.2%', trend: '+0.1%' },
  },
  recentPrescriptions: [
    {
      id: '#RX-9921',
      date: '2023-10-24',
      patient: 'John Doe',
      risk: 'High Risk',
      riskLevel: 'high',
      status: 'Pending',
    },
  ],
  criticalAlerts: [
    {
      tone: 'danger',
      title: 'Interaction Detected',
      subtitle: 'Warfarin + Aspirin',
      patient: 'John Doe (#RX-9921)',
      actionLabel: 'Review interaction',
    },
    {
      tone: 'primary',
      title: 'Dosage Warning',
      subtitle: 'Lisinopril 80mg (High)',
      patient: 'Jane Smith (#RX-9920)',
      actionLabel: 'Verify dosage',
    },
    {
      tone: 'warning',
      title: 'Duplicate Therapy',
      subtitle: 'Statin overlap detected',
      patient: 'Robert Brown (#RX-9919)',
      actionLabel: 'Manage conflict',
    },
  ],
};

function PharmacistDashboardPage() {
  const [loading] = useState(false);
  const [error] = useState(null);
  const [data] = useState(mockDashboardData);
  const navigate = useNavigate();

  let content;
  if (loading) {
    content = <LoadingState label="Loading pharmacist dashboard…" />;
  } else if (error) {
    content = (
      <ErrorState
        message="We couldn't load the latest prescription activity."
        onRetry={null}
      />
    );
  } else if (!data) {
    content = (
      <EmptyState
        title="No dashboard data yet"
        description="Once RxGuard AI is connected to your pharmacy system, real-time prescription and risk summaries will appear here."
      />
    );
  } else {
    content = (
      <div className="space-y-8">
        {/* Header & actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Dashboard overview</h2>
            <p className="text-sm text-muted mt-1">
              Welcome back. Here is what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon="history" onClick={() => navigate(ROUTES.PHARMACIST.AUDIT)}>
              View audit log
            </Button>
            <Button variant="primary" icon="add_circle" onClick={() => navigate(ROUTES.PHARMACIST.SCAN)}>
              Start new scan
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon="receipt_long"
            label="Total scans"
            value={data.stats.totalScans.value}
            chipLabel={data.stats.totalScans.trend}
            tone="info"
          />
          <StatCard
            icon="warning"
            label="High risk alerts"
            value={data.stats.highRiskAlerts.value}
            chipLabel={data.stats.highRiskAlerts.trend}
            tone="danger"
          />
          <StatCard
            icon="pending_actions"
            label="Pending reviews"
            value={data.stats.pendingReviews.value}
            chipLabel={data.stats.pendingReviews.trend}
            tone="warning"
          />
          <StatCard
            icon="verified"
            label="OCR accuracy"
            value={data.stats.ocrAccuracy.value}
            chipLabel={data.stats.ocrAccuracy.trend}
            tone="primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent prescriptions table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                Recent prescriptions
              </h3>
              <button
                type="button"
                className="text-primary text-sm font-semibold hover:underline"
              >
                View all
              </button>
            </div>
            <Table>
              <TableHead>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Patient</TableHeaderCell>
                <TableHeaderCell>Risk level</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableHead>
              <TableBody>
                {data.recentPrescriptions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-bold text-foreground">{row.id}</TableCell>
                    <TableCell className="text-muted">{row.date}</TableCell>
                    <TableCell className="font-medium text-foreground">{row.patient}</TableCell>
                    <TableCell>
                      <RiskBadge level={row.riskLevel}>{row.risk}</RiskBadge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-warning font-bold text-xs uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                        {row.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Alerts and system status */}
          <div className="space-y-6">
            <Card noPadding>
              <div className="p-4 md:p-6 border-b border-border bg-danger/5">
                <h3 className="font-bold flex items-center gap-2 text-danger">
                  <Icon name="notification_important" size={20} />
                  Critical alerts
                </h3>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                {data.criticalAlerts.map((alert) => (
                  <AlertCard
                    key={alert.subtitle}
                    tone={alert.tone}
                    title={alert.title}
                    subtitle={alert.subtitle}
                    patient={alert.patient}
                    actionLabel={alert.actionLabel}
                  />
                ))}
              </div>
              <div className="px-4 md:px-6 pb-4 md:pb-6">
                <Button variant="secondary" className="w-full">
                  View all alerts
                </Button>
              </div>
            </Card>

            <Card className="bg-deep-purple !border-transparent text-surface shadow-xl">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Icon name="check_circle" size={20} className="text-success" />
                AI engine status
              </h4>
              <div className="space-y-3 text-sm font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-muted">OCR engine</span>
                  <span className="text-success">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Interaction DB</span>
                  <span className="text-success">Synced</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Response time</span>
                  <span className="text-surface">240ms</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6 px-4 py-6 md:px-8">
      {content}
    </section>
  );
}

export default PharmacistDashboardPage;

