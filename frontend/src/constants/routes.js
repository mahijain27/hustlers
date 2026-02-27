export const ROUTES = {
    ROOT: '/',
    PHARMACIST: {
        BASE: '/pharmacist',
        DASHBOARD: '/pharmacist/dashboard',
        AUDIT: '/pharmacist/audit-log',
        SCAN: '/pharmacist/scan',
        SAFETY_REPORT: '/pharmacist/safety-report/:id',
        SETTINGS: '/pharmacist/settings'
    },
    DOCTOR: {
        BASE: '/doctor',
        DASHBOARD: '/doctor/dashboard',
        PATIENTS: '/doctor/patients',
        CHECKER: '/doctor/checker',
        SETTINGS: '/doctor/settings'
    },
    PATIENT: {
        BASE: '/patient',
        DASHBOARD: '/patient/dashboard',
        SCHEDULE: '/patient/schedule',
        PRESCRIPTIONS: '/patient/prescriptions'
    }
};
