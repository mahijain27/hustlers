import express from 'express';
import { registerUser, loginUser, googleAuth } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { registerValidation, loginValidation, googleAuthValidation } from '../validations/auth.validation.js';

const router = express.Router();

router.post('/register', registerValidation, validateRequest, registerUser);
router.post('/login', loginValidation, validateRequest, loginUser);
router.post('/google', googleAuthValidation, validateRequest, googleAuth);

export default router;
