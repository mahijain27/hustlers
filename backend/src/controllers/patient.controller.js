import Patient from '../models/Patient.model.js';

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Pharmacist, Doctor)
export const getPatients = async (req, res, next) => {
    try {
        const patients = await Patient.find({}).populate('user', 'firstName lastName email');

        // Mocking an empty set gracefully for early development
        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
export const getPatientById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id).populate('user', 'firstName lastName email');

        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
};
