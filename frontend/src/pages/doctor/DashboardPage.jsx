import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import LoadingState from '../../components/shared/LoadingState.jsx';
import ErrorState from '../../components/shared/ErrorState.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table.jsx';
import RiskBadge from '../../components/ui/RiskBadge.jsx';
import Icon from '../../components/ui/Icon.jsx';

const mockDoctorData = {
  stats: {
    totalPatients: { value: '412', trend: '+3' },
    prescriptions: { value: '89', trend: '-2' },
    highRisk: { value: '4', trend: '+1' },
    refills: { value: '12', trend: '0' },
  },
  recentPatients: [
    { id: 'PT-8829-X', name: 'John Doe', lastVisit: 'Today, 09:30 AM', risk: 'High', status: 'Review Needed' },
    { id: 'PT-8830-Y', name: 'Jane Smith', lastVisit: 'Yesterday', risk: 'Low', status: 'Stabilized' },
    { id: 'PT-8831-Z', name: 'Robert Brown', lastVisit: 'Oct 21, 2023', risk: 'Medium', status: 'Monitoring' },
  ]
};

function DoctorDashboardPage() {
  const [loading] = useState(false);
  const [error] = useState(null);
  const [data] = useState(mockDoctorData);
  const navigate = useNavigate();

  let content;
  if (loading) {
    content = <LoadingState label="Loading clinical dashboard…" />;
  } else if (error) {
    content = (
      <ErrorState
        message="We couldn't load current patient and risk metrics."
        onRetry={null}
      />
    );
  } else if (!data) {
    content = (
      <EmptyState
        title="No clinical analytics yet"
        description="Once connected to your EMR, real‑time prescribing and risk trends will appear here."
      />
    );
  } else {
    content = (
      <div className="space-y-8">
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clinical dashboard</h1>
            <p className="text-sm text-muted mt-1">
              Overview of patients, prescriptions, and high‑risk alerts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon="person" onClick={() => navigate(ROUTES.DOCTOR.PATIENTS)}>
              Find Patient
            </Button>
            <Button variant="primary" icon="medical_services" onClick={() => navigate(ROUTES.DOCTOR.CHECKER)}>
              New Prescription
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon="group"
            label="Active Patients"
            value={data.stats.totalPatients.value}
            chipLabel={data.stats.totalPatients.trend}
            tone="info"
          />
          <StatCard
            icon="receipt_long"
            label="Prescriptions Written"
            value={data.stats.prescriptions.value}
            chipLabel={data.stats.prescriptions.trend}
            tone="primary"
          />
          <StatCard
            icon="warning"
            label="High Risk Alerts"
            value={data.stats.highRisk.value}
            chipLabel={data.stats.highRisk.trend}
            tone="danger"
          />
          <StatCard
            icon="refresh"
            label="Refill Requests"
            value={data.stats.refills.value}
            chipLabel={data.stats.refills.trend}
            tone="warning"
          />
        </div>

        {/* Recent Patients Table */}
        <Card noPadding>
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Icon name="history" size={20} className="text-muted" />
              Recent Patient Activity
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
              <TableHeaderCell>Patient ID</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Last Visit</TableHeaderCell>
              <TableHeaderCell>Risk Profile</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableHead>
            <TableBody>
              {data.recentPatients.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-muted text-sm">{row.id}</TableCell>
                  <TableCell className="font-bold text-foreground">{row.name}</TableCell>
                  <TableCell className="text-muted">{row.lastVisit}</TableCell>
                  <TableCell>
                    <RiskBadge level={row.risk === 'High' ? 'high' : row.risk === 'Medium' ? 'medium' : 'low'}>
                      {row.risk} Risk
                    </RiskBadge>
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider ${row.status === 'Review Needed' ? 'text-warning' : 'text-success'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Review Needed' ? 'bg-warning' : 'bg-success'}`} />
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  return (
    <section className="px-4 py-6 md:px-8">
      {content}
    </section>
  );
}

export default DoctorDashboardPage;

