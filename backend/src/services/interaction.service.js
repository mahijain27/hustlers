// Simulate Drug Interaction analysis
export const checkInteractions = async (drugsList) => {
    // In the future this queries a Medical interactions API
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(['Moderate interaction detected']);
        }, 1000);
    });
};
