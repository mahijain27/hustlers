// Simulate Risk Scoring AI Model
export const calculateRiskScore = async (drugsList, patientContext) => {
    // In the future this triggers an ML model hosted in Python
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(35);
        }, 800);
    });
};
