import { body, param } from 'express-validator';
import mongoose from 'mongoose';

// Ensure the ID passed in params is a valid MongoDB ObjectId type
export const validateObjectId = [
    param('id')
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid ID format. Must be a valid MongoDB ObjectId.')
];

// Validation payload for Prescription Uploads
export const prescriptionUploadValidation = [
    body('patientName')
        .trim()
        .notEmpty().withMessage('Patient name is required')
        .isLength({ min: 2 }).withMessage('Patient name must be at least 2 characters'),

    // Custom validation for checking Multer parsing output
    body('image').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Image file is required');
        }
        return true;
    })
];
