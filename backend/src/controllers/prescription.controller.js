import Prescription from '../models/prescription.model.js';
import { processPrescriptionAsync } from '../services/prescription.processor.js';
import logger from '../utils/logger.js';

// @desc    Upload prescription image & trigger async processing
// @route   POST /api/prescriptions/upload
// @access  Private/Pharmacist
export const uploadPrescription = async (req, res, next) => {
    try {
        const { patientName } = req.body;

        if (!patientName) {
            res.status(400);
            throw new Error('Please provide the patient name');
        }

        if (!req.file) {
            res.status(400);
            throw new Error('Please upload an image file');
        }

        // Create the prescription record
        const prescription = await Prescription.create({
            patientName,
            uploadedBy: req.user._id,
            imagePath: req.file.path,
            status: 'uploaded',
        });

        // Trigger the background worker WITHOUT awaiting
        processPrescriptionAsync(prescription._id).catch((err) => {
            logger.error(`Critical Processor Failure: ${err}`);
        });

        // Immediately return 202 Accepted
        res.status(202).json({
            success: true,
            message: 'Prescription uploaded successfully and queued for analysis',
            prescriptionId: prescription._id,
            status: prescription.status,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Poll status of a prescription analysis
// @route   GET /api/prescriptions/:id/status
// @access  Private
export const getPrescriptionStatus = async (req, res, next) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .select('status errorMessage');

        if (!prescription) {
            res.status(404);
            throw new Error('Prescription not found');
        }

        res.status(200).json({
            success: true,
            prescriptionId: prescription._id,
            status: prescription.status,
            errorMessage: prescription.errorMessage,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get finalized prescription report
// @route   GET /api/prescriptions/:id/report
// @access  Private
export const getPrescriptionReport = async (req, res, next) => {
    try {
        const prescription = await Prescription.findById(req.params.id);

        if (!prescription) {
            res.status(404);
            throw new Error('Prescription not found');
        }

        if (prescription.status !== 'analyzed') {
            res.status(400);
            throw new Error(`Report not ready. Current status: ${prescription.status}`);
        }

        res.status(200).json({
            success: true,
            patientName: prescription.patientName,
            extractedDrugs: prescription.extractedDrugs,
            interactionWarnings: prescription.interactionWarnings,
            riskScore: prescription.riskScore,
            fhir: prescription.fhir,
            createdAt: prescription.createdAt,
        });
    } catch (error) {
        next(error);
    }
};
