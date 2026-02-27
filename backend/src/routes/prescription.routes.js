import express from 'express';
import {
    uploadPrescription,
    getPrescriptionStatus,
    getPrescriptionReport,
} from '../controllers/prescription.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import User from '../models/User.model.js'; // Needed if we write authorize middleware inside route specifically or extract it
import { validateRequest } from '../middlewares/validate.middleware.js';
import { prescriptionUploadValidation, validateObjectId } from '../validations/prescription.validation.js';

const router = express.Router();

// Helper Authorize Middleware (As requested, keeping auth stable but applying roles contextually)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403);
            return next(
                new Error(`User role ${req.user.role} is not authorized to access this route`)
            );
        }
        next();
    };
};

// Map endpoints
router.post(
    '/upload',
    protect,
    authorize('pharmacist', 'doctor'), // Typically pharmacists scan, but doctors might too
    upload.single('image'),
    prescriptionUploadValidation,
    validateRequest,
    uploadPrescription
);

router.get('/:id/status', protect, validateObjectId, validateRequest, getPrescriptionStatus);
router.get('/:id/report', protect, validateObjectId, validateRequest, getPrescriptionReport);

export default router;
