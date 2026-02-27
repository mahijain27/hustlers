import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

/**
 * Global validation middleare to trap express-validator errors.
 * Returns structured JSON if validation fails.
 */
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));

        logger.warn(`Validation failed for ${req.originalUrl}: ${JSON.stringify(formattedErrors)}`);

        return res.status(400).json({
            success: false,
            errors: formattedErrors
        });
    }
    next();
};
