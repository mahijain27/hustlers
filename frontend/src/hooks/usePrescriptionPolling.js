import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { ROUTES } from '../constants/routes.js';

export const usePrescriptionPolling = (prescriptionId) => {
    const [status, setStatus] = useState('uploaded');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!prescriptionId) return;

        let timeoutId;

        const pollStatus = async () => {
            try {
                const data = await api.getPrescriptionStatus(prescriptionId);
                setStatus(data.status);

                if (data.status === 'analyzed') {
                    // Analysis complete, redirect to safety report page
                    navigate(ROUTES.PHARMACIST.SAFETY_REPORT.replace(':id', prescriptionId));
                    return; // Stop polling
                }

                if (data.status === 'failed') {
                    setError(data.errorMessage || 'Prescription analysis failed.');
                    return; // Stop polling
                }

                // Keep polling if uploaded or processing
                timeoutId = setTimeout(pollStatus, 3000);
            } catch (err) {
                console.error('Polling error:', err);
                setError('Connection lost while checking status. Please try again.');
            }
        };

        // Start polling loop
        pollStatus();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [prescriptionId, navigate]);

    return { status, error };
};
