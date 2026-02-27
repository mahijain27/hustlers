// Utility to format standard FHIR JSON payloads
export const buildFHIRMedicationRequest = (patientName, extractedDrugs) => {
    return {
        resourceType: 'MedicationRequest',
        status: 'active',
        medicationCodeableConcept: {
            text: extractedDrugs.join(', ') || 'Unknown Medication',
        },
        subject: {
            reference: `Patient/${patientName.replace(/\s+/g, '')}`,
            display: patientName,
        },
        authoredOn: new Date().toISOString(),
    };
};
