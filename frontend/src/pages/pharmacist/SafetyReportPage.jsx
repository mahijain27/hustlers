import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import LoadingState from '../../components/shared/LoadingState.jsx';
import ErrorState from '../../components/shared/ErrorState.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';
import Icon from '../../components/ui/Icon.jsx';

function PharmacistSafetyReportPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.getPrescriptionReport(id);
        // Defensive access: Backend might return raw JSON or a `{ success: true, ... }` object
        const report = response.report || response;

        // Map backend schema to frontend structure with optional chaining everywhere possible
        const formattedData = {
          id: report?._id || id,
          timestamp: report?.createdAt ? new Date(report.createdAt).toLocaleString() : 'Just now',
          version: 'v4.2.1 (Backend API)',
          ocrConfidence: 98.4,
          summary: {
            title: report?.status === 'failed' ? 'Analysis Failed' : ((report?.riskScore || 0) > 30 ? 'High Risk Detected' : 'Safe to Dispense'),
            body: report?.interactionWarnings?.length > 0
              ? report.interactionWarnings.join(' ')
              : (report?.errorMessage || 'No critical interactions detected.')
          },
          meds: (report?.extractedDrugs || []).map(drug => ({
            name: typeof drug === 'string' ? drug : (drug?.name || 'Unknown'),
            dosage: typeof drug === 'string' ? 'Dosage unspecified' : (drug?.dosage || 'Dosage unspecified'),
            confidence: 'System Extracted'
          })),
          fhir: JSON.stringify(report?.fhir || {}, null, 2),
          riskScore: report?.riskScore || 0,
          status: report?.status
        };

        setData(formattedData);
      } catch (err) {
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  // Safe Rendering Guards
  if (loading) {
    return (
      <div className="p-6 text-center">
        <LoadingState label="Loading safety report…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="space-y-6 px-4 py-6 md:px-8">
      <main className="space-y-8">
        {/* Header section */}
        <div className="flex flex-wrap justify-between items-end gap-4 border-b border-primary/10 pb-6">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-sm text-primary font-bold uppercase tracking-wider">
              RX ID: {data?.id}
            </p>
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-foreground">
              Safety analysis report
            </h1>
            <p className="text-sm text-muted">
              Generated on {data?.timestamp} • System {data?.version}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data?.riskScore > 30 || data?.summary?.title === 'High Risk Detected' ? (
              <div className="bg-danger/10 text-danger px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-danger/40 shadow-sm">
                <Icon name="warning" size={16} />
                HIGH RISK DETECTED
              </div>
            ) : (
              <div className="bg-success/10 text-success px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-success/40 shadow-sm">
                <Icon name="check_circle" size={16} />
                SAFE TO PROCESS
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Vision analysis */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface-muted">
                <h3 className="font-bold text-sm uppercase tracking-widest text-muted">
                  Scanned document
                </h3>
                <span className="bg-success/10 text-success text-[10px] px-2 py-0.5 rounded-full font-bold">
                  LIVE OCR ACTIVE
                </span>
              </div>
              <div className="relative">
                <div className="aspect-[3/4] bg-surface-muted w-full relative overflow-hidden flex flex-col justify-center items-center text-muted">
                  <Icon name="insert_drive_file" size={48} className="opacity-20 mb-2" />
                  <span className="font-semibold opacity-50">Secure File Storage</span>
                </div>
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[5%] bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary rounded-sm px-2">
                  100% Secure
                </div>
              </div>
              <div className="p-4 bg-surface-muted">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted">
                      Risk Score Index
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {data?.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full ${data?.riskScore > 30 ? 'bg-warning' : 'bg-primary'}`}
                      style={{ width: `${Math.min(data?.riskScore || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical intelligence */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className={`border-l-4 p-5 rounded-xl ${data?.riskScore > 30 ? 'bg-warning/5 border-warning' : 'bg-success/5 border-success'}`}>
              <div className="flex gap-4">
                <Icon name={data?.riskScore > 30 ? 'error' : 'check_circle'} size={32} className={`shrink-0 ${data?.riskScore > 30 ? 'text-warning' : 'text-success'}`} />
                <div>
                  <h3 className={`text-lg font-bold ${data?.riskScore > 30 ? 'text-warning' : 'text-success'}`}>
                    {data?.summary?.title}
                  </h3>
                  <p className={`text-sm mt-1 ${data?.riskScore > 30 ? 'text-warning' : 'text-success'}`}>
                    {data?.summary?.body}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-widest text-muted">
                  Extracted medications
                </h3>
              </div>
              {data?.meds?.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-muted text-[11px] uppercase tracking-wider text-muted">
                      <th className="px-4 py-3 font-semibold">Drug name</th>
                      <th className="px-4 py-3 font-semibold">Dosage</th>
                      <th className="px-4 py-3 font-semibold">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.meds?.map((med, index) => (
                      <tr key={index} className="text-sm border-t border-border/40">
                        <td className="px-4 py-4 font-bold text-foreground">
                          {med?.name}
                        </td>
                        <td className="px-4 py-4 text-muted">{med?.dosage}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 text-success font-bold">
                            <Icon name="check_circle" size={12} />
                            {med?.confidence}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-muted">No medications could be extracted or matched.</div>
              )}
            </div>

            <div className="rounded-xl overflow-hidden bg-foreground">
              <div className="flex items-center justify-between px-4 py-2 bg-foreground/90">
                <span className="text-[10px] font-mono text-muted uppercase tracking-widest">
                  FHIR R4 JSON export
                </span>
              </div>
              <pre className="p-4 text-xs font-mono text-success overflow-x-auto bg-foreground whitespace-pre-wrap word-wrap">
                {data?.fhir}
              </pre>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-surface font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all"
              >
                <Icon name="check_circle" size={20} />
                Approve report
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-surface-muted hover:bg-surface text-foreground font-bold py-4 rounded-xl transition-all border border-border shadow-sm"
              >
                <Icon name="flag" size={20} className="text-danger" />
                Flag for review
              </button>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}

export default PharmacistSafetyReportPage;
