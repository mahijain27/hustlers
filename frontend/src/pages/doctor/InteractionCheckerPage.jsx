import React, { useState } from 'react';
import LoadingState from '../../components/shared/LoadingState.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import RiskBadge from '../../components/ui/RiskBadge.jsx';
import Icon from '../../components/ui/Icon.jsx';

const MOCK_DRUGS = [
  'Warfarin',
  'Aspirin',
  'Lisinopril',
  'Metformin',
  'Ibuprofen',
];

function DoctorInteractionCheckerPage() {
  const [loading, setLoading] = useState(false);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [interactionResult, setInteractionResult] = useState(null);

  const toggleDrug = (drug) => {
    setSelectedDrugs((prev) =>
      prev.includes(drug) ? prev.filter((d) => d !== drug) : [...prev, drug]
    );
    setInteractionResult(null); // Reset on change
  };

  const handleCheck = () => {
    if (selectedDrugs.length < 2) return;
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Hardcoded mock logic
      if (selectedDrugs.includes('Warfarin') && selectedDrugs.includes('Aspirin')) {
        setInteractionResult({
          level: 'high',
          riskLabel: 'Major Interaction',
          description: 'Concurrent use of Warfarin and Aspirin significantly increases the risk of bleeding complications. Aspirin inhibits platelet aggregation and can cause gastric mucosal damage, while Warfarin acts as a systemic anticoagulant.',
          recommendation: 'Avoid combination if possible. If concomitant use is necessary, monitor INR closely and observe for signs of major/minor bleeding.',
        });
      } else {
        setInteractionResult({
          level: 'low',
          riskLabel: 'No Major Interactions',
          description: 'No significant drug-drug interactions were found for the selected combination based on the current clinical database.',
          recommendation: 'Proceed with standard monitoring.',
        });
      }
    }, 1200);
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Drug‑drug interaction checker</h1>
        <p className="text-sm text-muted">
          Compare medications and review AI‑assisted clinical summaries before prescribing.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Drug Selection Panel */}
        <Card className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Select Drugs</h3>
            <p className="text-sm text-muted mt-1">Choose at least two medications to analyze.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {MOCK_DRUGS.map((drug) => {
              const isSelected = selectedDrugs.includes(drug);
              return (
                <button
                  key={drug}
                  onClick={() => toggleDrug(drug)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${isSelected
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface-muted border-border text-foreground hover:border-muted'
                    }`}
                >
                  {drug}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="primary"
              className="w-full"
              disabled={selectedDrugs.length < 2 || loading}
              onClick={handleCheck}
            >
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {loading ? (
            <Card className="h-full min-h-[300px] flex items-center justify-center">
              <LoadingState label="Analyzing drug‑drug interactions…" />
            </Card>
          ) : interactionResult ? (
            <Card className={`space-y-6 border-2 ${interactionResult.level === 'high' ? 'border-danger/30' : 'border-success/30'
              }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    Analysis Complete
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedDrugs.map(d => (
                      <span key={d} className="px-2 py-1 bg-surface-muted rounded-md text-xs font-semibold text-muted">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <RiskBadge level={interactionResult.level}>
                  {interactionResult.riskLabel}
                </RiskBadge>
              </div>

              <div className="space-y-4 pt-4 border-t border-border mt-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">Clinical Summary</h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {interactionResult.description}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-muted border border-border">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Icon name="medical_services" size={16} />
                    Recommendation
                  </h4>
                  <p className="text-sm text-muted">
                    {interactionResult.recommendation}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full min-h-[300px] flex items-center justify-center">
              <EmptyState
                title="No interaction analysis yet"
                description="Select at least two medications and click 'Run Analysis' to check against the clinical rules engine."
              />
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

export default DoctorInteractionCheckerPage;

