// Stub FHIR interop integration layer

export const fetchPatientData = async (fhirPatientId) => {
    // Mock external request
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        resourceType: 'Patient',
        id: fhirPatientId,
        active: true,
        name: [
            {
                use: 'official',
                family: 'Doe',
                given: ['John']
            }
        ]
    };
};
