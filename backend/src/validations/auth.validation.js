import { body } from 'express-validator';

// Validation constraints for Auth Registration
export const registerValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please include a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['pharmacist', 'doctor', 'patient']).withMessage('Role must be pharmacist, doctor, or patient')
];

// Validation constraints for Auth Login
export const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please include a valid email address')
        .normalizeEmail(),

];

// Validation constraints for Google Auth
export const googleAuthValidation = [
    body('credential')
        .notEmpty().withMessage('Google credential token is required')
];
