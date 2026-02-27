import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import LoadingState from '../../components/shared/LoadingState.jsx';
import ErrorState from '../../components/shared/ErrorState.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';
import Card from '../../components/ui/Card.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';

const mockPatientData = {
  stats: {
    activeMeds: { value: '3', trend: 'Current' },
    adherence: { value: '96%', trend: 'Excellent' },
    nextDose: { value: '8:00 PM', trend: 'In 2h' },
  },
  medications: [
    { name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', remaining: 14, icon: 'pill' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily (Morning)', remaining: 22, icon: 'medication' },
    { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (Evening)', remaining: 30, icon: 'favorite' },
  ]
};

function PatientDashboardPage() {
  const [loading] = useState(false);
  const [error] = useState(null);
  const [data] = useState(mockPatientData);
  const navigate = useNavigate();

  let content;
  if (loading) {
    content = <LoadingState label="Loading your medication overview…" />;
  } else if (error) {
    content = (
      <ErrorState
        message="We couldn't load your latest medication summary."
        onRetry={null}
      />
    );
  } else if (!data) {
    content = (
      <EmptyState
        title="No dashboard data yet"
        description="When prescriptions are linked to your profile, adherence and risk insights will show here."
      />
    );
  } else {
    content = (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Welcome to RxGuard AI</h1>
            <p className="text-sm text-muted">
              Track your medications, upcoming doses, and safety alerts.
            </p>
          </header>
          <Button variant="primary" icon="add" onClick={() => navigate(ROUTES.PATIENT.PRESCRIPTIONS)}>
            Add Medication
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            icon="pill"
            label="Active Medications"
            value={data.stats.activeMeds.value}
            chipLabel={data.stats.activeMeds.trend}
            tone="primary"
          />
          <StatCard
            icon="check_circle"
            label="Adherence Rate"
            value={data.stats.adherence.value}
            chipLabel={data.stats.adherence.trend}
            tone="success"
          />
          <StatCard
            icon="schedule"
            label="Next Dose"
            value={data.stats.nextDose.value}
            chipLabel={data.stats.nextDose.trend}
            tone="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card noPadding className="flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface-muted">
              <h3 className="font-bold text-foreground flew items-center gap-2">
                <Icon name="medication" size={20} className="text-primary inline mr-2" />
                Current Prescriptions
              </h3>
            </div>
            <div className="divide-y divide-border">
              {data.medications.map((med) => (
                <div key={med.name} className="p-6 flex items-center gap-4 hover:bg-surface-muted/50 transition-colors">
                  <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon name={med.icon} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground">{med.name}</h4>
                    <p className="text-sm text-muted">{med.dosage} • {med.frequency}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">{med.remaining}</p>
                    <p className="text-xs text-muted uppercase tracking-wider font-semibold">pills left</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border mt-auto">
              <Button variant="secondary" className="w-full">View Full History</Button>
            </div>
          </Card>

          <Card className="bg-success/5 border-success/20 flex flex-col justify-center items-center text-center p-12">
            <div className="size-20 bg-success text-white rounded-full flex items-center justify-center shadow-lg shadow-success/20 mb-6">
              <Icon name="shield_moon" size={40} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Safety Alerts</h3>
            <p className="text-muted text-sm leading-relaxed max-w-sm mb-6">
              Your current medication regimen has been scanned by RxGuard AI. No negative drug-drug interactions detected.
            </p>
            <Button variant="primary" icon="history">
              View Safety Report
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <section className="px-4 py-6 md:px-8">
      {content}
    </section>
  );
}

export default PatientDashboardPage;

