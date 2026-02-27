import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { usePrescriptionPolling } from '../../hooks/usePrescriptionPolling.js';
import { ROUTES } from '../../constants/routes.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import ProcessingStep from '../../components/ui/ProcessingStep.jsx';
import Icon from '../../components/ui/Icon.jsx';

const mockScanData = {
  recentHistory: [
    { label: 'Amoxicillin 500mg', id: '#RX-2942', when: '2h ago', tone: 'success' },
    { label: 'Lisinopril + Warfarin', id: '#RX-2810', when: 'Yesterday', tone: 'warning' },
    { label: 'Ibuprofen 800mg', id: '#RX-2751', when: '3 days ago', tone: 'success' },
  ],
};

function PharmacistScanPrescriptionPage() {
  const [data] = useState(mockScanData);
  const [scanState, setScanState] = useState('idle'); // idle, selected, analyzing
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [prescriptionId, setPrescriptionId] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const navigate = useNavigate();

  // Polling hook manages redirect and error handling once ID is known
  const { status, error: pollingError } = usePrescriptionPolling(prescriptionId);

  const handleSelectFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanState('selected');
      setUploadError(null);
      // Generate a mock safe dummy patient name if one isn't provided via input 
      // (Since we require one dynamically, typically there would be an input field, but we will auto-fill for frictionless UX)
      if (!patientName) setPatientName('John Doe');
    }
  };

  const triggerFileInput = () => {
    document.getElementById('file-upload').click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setScanState('analyzing');
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('patientName', patientName);

    try {
      const res = await api.uploadPrescription(formData);
      // Wait for 202 accepted and ID
      if (res.success) {
        setPrescriptionId(res.prescriptionId); // Triggers the usePrescriptionPolling hook
      } else {
        throw new Error('Upload failed but no error thrown');
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload prescription');
      setScanState('selected'); // Revert
    }
  };

  const handleReset = () => {
    setScanState('idle');
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPrescriptionId(null);
    setUploadError(null);
    setPatientName('');
  };

  // Convert polling status into UI progress percentages
  const getProgress = () => {
    if (status === 'uploaded') return 25;
    if (status === 'processing') return 60;
    if (status === 'analyzed') return 100;
    return 10;
  };

  const progress = getProgress();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Scan prescription</h1>
        <p className="text-sm text-muted">
          Upload handwritten or printed prescriptions for AI‑assisted safety checks.
        </p>
      </header>

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">

            {/* Error alerts */}
            {(uploadError || pollingError) && (
              <div className="bg-danger/10 text-danger p-4 rounded-xl border border-danger/20 font-bold mb-4">
                <Icon name="error" className="inline mr-2" /> {uploadError || pollingError}
              </div>
            )}

            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleSelectFile}
            />

            {scanState === 'idle' && (
              <div className="bg-surface rounded-xl border-2 border-dashed border-border p-12 flex flex-col items-center justify-center text-center transition-all hover:border-primary/50 cursor-pointer" onClick={triggerFileInput}>
                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-sm shadow-primary/20">
                  <Icon name="upload_file" size={36} className="text-primary" />
                </div>
                <div className="max-w-sm">
                  <h3 className="text-xl font-bold mb-2 text-foreground tracking-tight">
                    Drop your prescription here
                  </h3>
                  <p className="text-sm text-muted mb-8 leading-relaxed">
                    Support for printed and handwritten prescriptions in JPG, PNG or PDF
                    format.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="primary" icon="add_photo_alternate" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
                    Select file
                  </Button>
                </div>
              </div>
            )}

            {scanState !== 'idle' && selectedFile && (
              <Card className="shadow-sm">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <Icon name="task_alt" size={20} className="text-primary" />
                    <span className="font-bold text-sm text-foreground">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-muted uppercase font-bold tracking-widest bg-surface-muted px-2 py-1 rounded-md">
                      Selected
                    </span>
                  </div>
                  {scanState !== 'analyzing' && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-muted hover:text-danger transition-colors p-2"
                      aria-label="Remove file"
                    >
                      <Icon name="delete" size={20} />
                    </button>
                  )}
                </div>

                {/* Dynamically entered patient name as required by API, showing simple input */}
                {scanState === 'selected' && (
                  <div className="mb-4">
                    <label className="block text-foreground text-sm font-bold mb-2">Patient Name (Required)</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )}

                <div className="relative rounded-lg overflow-hidden h-64 bg-surface-muted border border-border">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Prescription preview" className="w-full h-full object-contain bg-background-dark/30" />
                    ) : (
                      <div className="w-full h-full bg-surface-muted flex flex-col justify-center items-center text-muted">
                        <Icon name="image" size={48} className="opacity-20" />
                        <span className="font-semibold opacity-50 mt-2">No Preview Available</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur px-4 py-2 rounded-lg flex justify-between items-center shadow-sm">
                    <span className="text-xs font-semibold text-muted">
                      Type: {selectedFile.type}
                    </span>
                    <span className="text-xs font-semibold text-muted">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              </Card>
            )}

            {(scanState === 'selected' || scanState === 'analyzing') && (
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button
                  variant="primary"
                  className="flex-1 py-4 text-base"
                  icon="analytics"
                  onClick={handleAnalyze}
                  disabled={scanState === 'analyzing' || !patientName.trim()}
                >
                  {scanState === 'analyzing' ? 'Uploading & Analyzing...' : 'Analyze prescription'}
                </Button>
              </div>
            )}

          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground tracking-tight">
                <Icon name="info" size={20} className="text-primary" />
                Scanning tips
              </h3>
              <ul className="space-y-4 text-sm text-foreground">
                <li className="flex gap-3">
                  <Icon name="light_mode" size={20} className="text-primary shrink-0" />
                  <p className="leading-snug font-medium">
                    Ensure good lighting and avoid reflections on glossy paper.
                  </p>
                </li>
                <li className="flex gap-3">
                  <Icon name="center_focus_strong" size={20} className="text-primary shrink-0" />
                  <p className="leading-snug font-medium">
                    Hold the camera steady and keep the entire page within the frame.
                  </p>
                </li>
              </ul>
            </Card>

            <Card noPadding>
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface-muted/50">
                <h3 className="font-bold text-foreground tracking-tight">Recent history</h3>
              </div>
              <div className="divide-y divide-border">
                {data.recentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-surface-muted transition-colors cursor-pointer flex items-center gap-4"
                  >
                    <div
                      className={`size-10 rounded-lg flex items-center justify-center ${item.tone === 'success'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                        }`}
                    >
                      <Icon name={item.tone === 'success' ? 'check_circle' : 'warning'} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted font-medium mt-0.5">
                        {item.id} • {item.when}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {scanState === 'analyzing' && (
          <div className="mt-12 p-1 bg-gradient-to-r from-primary/30 via-accent-pink/30 to-primary/30 rounded-2xl shadow-xl relative overflow-hidden animate-pulse">
            <div className="bg-surface dark:bg-background-dark rounded-[0.9rem] p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="relative size-24 lg:size-32 shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      className="text-border"
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                    />
                    <circle
                      className="text-primary transition-all duration-300 ease-out"
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * progress) / 100}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl lg:text-2xl font-black text-primary">{progress}%</span>
                    <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-muted mt-1">
                      {status || 'Working'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
                  <ProcessingStep icon="upload" label="Upload" completed={progress > 10} active={progress <= 10} />
                  <ProcessingStep icon="image" label="Analysis" completed={status === 'processing' || status === 'analyzed'} active={status === 'uploaded'} />
                  <ProcessingStep icon="font_download" label="OCR text" completed={status === 'analyzed'} active={status === 'processing' && progress < 80} />
                  <ProcessingStep icon="pill" label="Interactions" completed={status === 'analyzed'} active={status === 'processing' && progress >= 80} />
                  <ProcessingStep icon="description" label="Report" completed={status === 'analyzed'} active={false} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default PharmacistScanPrescriptionPage;
