const testValidations = async () => {
    console.log('--- Testing Registration Validation ---');

    // 1. Missing Email and Short Password test
    const response = await fetch('http://localhost:5002/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstName: 'A', // too short
            lastName: 'B',  // too short
            email: 'notanemail', // invalid email
            password: '123', // password too short
            role: 'hacker'   // invalid role
        })
    });

    const data = await response.json();
    console.log(`Status Code: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));

    // 2. Testing Invalid ObjectId for Prescription Report
    console.log('\\n--- Testing Invalid Prescription ID Validation ---');
    const getReportResponse = await fetch('http://localhost:5002/api/prescriptions/not-a-mongo-id/report', {
        method: 'GET',
        headers: {
            // Usually needs Bearer token, but validation fires BEFORE auth in the stack if placed incorrectly!
            // Wait, in routes: protect, validateObjectId, validateRequest, controller.
            // Since we don't have a token, it might fail auth first. Let's send a fake token to see.
            'Authorization': 'Bearer faketoken123'
        }
    });

    const reportData = await getReportResponse.json();
    console.log(`Status Code: ${getReportResponse.status}`);
    console.log(JSON.stringify(reportData, null, 2));
};

testValidations().catch(console.error);
