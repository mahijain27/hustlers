import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ROUTES } from './constants/routes.js';
import RoleGuard from './routing/RoleGuard.jsx';
import NotFoundPage from './pages/shared/NotFound.jsx';

import RoleSelectionPage from './pages/auth/RoleSelectionPage.jsx';
import PharmacistDashboardPage from './pages/pharmacist/DashboardPage.jsx';
import PharmacistAuditLogPage from './pages/pharmacist/AuditLogPage.jsx';
import PharmacistScanPrescriptionPage from './pages/pharmacist/ScanPrescriptionPage.jsx';
import PharmacistSafetyReportPage from './pages/pharmacist/SafetyReportPage.jsx';
import SystemSettingsPage from './pages/settings/SystemSettingsPage.jsx';
import DoctorDashboardPage from './pages/doctor/DashboardPage.jsx';
import DoctorInteractionCheckerPage from './pages/doctor/InteractionCheckerPage.jsx';
import DoctorPatientRecordsPage from './pages/doctor/PatientRecordsPage.jsx';
import PatientDashboardPage from './pages/patient/DashboardPage.jsx';
import PatientMedicationSchedulePage from './pages/patient/MedicationSchedulePage.jsx';
import PatientPrescriptionHistoryPage from './pages/patient/PrescriptionHistoryPage.jsx';

import PharmacistLayout from './layout/PharmacistLayout.jsx';
import DoctorLayout from './layout/DoctorLayout.jsx';
import PatientLayout from './layout/PatientLayout.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public / auth */}
          <Route path={ROUTES.ROOT} element={<RoleSelectionPage />} />

          {/* Pharmacist */}
          <Route
            path={ROUTES.PHARMACIST.BASE}
            element={
              <RoleGuard allowedRoles={['pharmacist']}>
                <PharmacistLayout />
              </RoleGuard>
            }
          >
            <Route index element={<Navigate to={ROUTES.PHARMACIST.DASHBOARD.replace(ROUTES.PHARMACIST.BASE + '/', '')} replace />} />
            <Route path={ROUTES.PHARMACIST.DASHBOARD.replace(ROUTES.PHARMACIST.BASE + '/', '')} element={<PharmacistDashboardPage />} />
            <Route path={ROUTES.PHARMACIST.AUDIT.replace(ROUTES.PHARMACIST.BASE + '/', '')} element={<PharmacistAuditLogPage />} />
            <Route path={ROUTES.PHARMACIST.SCAN.replace(ROUTES.PHARMACIST.BASE + '/', '')} element={<PharmacistScanPrescriptionPage />} />
            <Route path={ROUTES.PHARMACIST.SAFETY_REPORT.replace(ROUTES.PHARMACIST.BASE + '/', '')} element={<PharmacistSafetyReportPage />} />
            <Route path={ROUTES.PHARMACIST.SETTINGS.replace(ROUTES.PHARMACIST.BASE + '/', '')} element={<SystemSettingsPage />} />
          </Route>

          {/* Doctor */}
          <Route
            path={ROUTES.DOCTOR.BASE}
            element={
              <RoleGuard allowedRoles={['doctor']}>
                <DoctorLayout />
              </RoleGuard>
            }
          >
            <Route index element={<Navigate to={ROUTES.DOCTOR.DASHBOARD.replace(ROUTES.DOCTOR.BASE + '/', '')} replace />} />
            <Route path={ROUTES.DOCTOR.DASHBOARD.replace(ROUTES.DOCTOR.BASE + '/', '')} element={<DoctorDashboardPage />} />
            <Route path={ROUTES.DOCTOR.PATIENTS.replace(ROUTES.DOCTOR.BASE + '/', '')} element={<DoctorPatientRecordsPage />} />
            <Route path={ROUTES.DOCTOR.CHECKER.replace(ROUTES.DOCTOR.BASE + '/', '')} element={<DoctorInteractionCheckerPage />} />
            <Route path={ROUTES.DOCTOR.SETTINGS.replace(ROUTES.DOCTOR.BASE + '/', '')} element={<SystemSettingsPage />} />
          </Route>

          {/* Patient */}
          <Route
            path={ROUTES.PATIENT.BASE}
            element={
              <RoleGuard allowedRoles={['patient']}>
                <PatientLayout />
              </RoleGuard>
            }
          >
            <Route index element={<Navigate to={ROUTES.PATIENT.DASHBOARD.replace(ROUTES.PATIENT.BASE + '/', '')} replace />} />
            <Route path={ROUTES.PATIENT.DASHBOARD.replace(ROUTES.PATIENT.BASE + '/', '')} element={<PatientDashboardPage />} />
            <Route path={ROUTES.PATIENT.SCHEDULE.replace(ROUTES.PATIENT.BASE + '/', '')} element={<PatientMedicationSchedulePage />} />
            <Route path={ROUTES.PATIENT.PRESCRIPTIONS.replace(ROUTES.PATIENT.BASE + '/', '')} element={<PatientPrescriptionHistoryPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

