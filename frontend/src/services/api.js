const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = (isFormData = false) => {
    const token = localStorage.getItem('rxguard_token');
    const headers = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Not passing Content-Type for FormData as browser handles multipart boundaries automatically
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

// Generic fetch wrapper to centralize error handling
const fetchApi = async (endpoint, options = {}) => {
    const isFormData = options.body instanceof FormData;

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            ...getHeaders(isFormData),
            ...options.headers, // Allow overriding
        },
    });

    if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || (errorData.errors && errorData.errors[0]?.message) || errorMsg;
        } catch {
            // Ignored if not JSON
        }

        // Throw standard error for components to catch (e.g., 401 unauth)
        const err = new Error(errorMsg);
        err.status = response.status;
        throw err;
    }

    // Handle empty responses, mostly 202 or 204
    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

export const api = {
    // Auth
    login: (data) => fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => fetchApi('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    googleLogin: (data) => fetchApi('/api/auth/google', { method: 'POST', body: JSON.stringify(data) }),

    // Prescriptions
    uploadPrescription: (formData) => fetchApi('/api/prescriptions/upload', { method: 'POST', body: formData }),
    getPrescriptionStatus: (id) => fetchApi(`/api/prescriptions/${id}/status`, { method: 'GET' }),
    getPrescriptionReport: (id) => fetchApi(`/api/prescriptions/${id}/report`, { method: 'GET' }),

    // Health
    checkHealth: () => fetchApi('/api/health', { method: 'GET' })
};
