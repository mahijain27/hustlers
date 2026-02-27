import express from 'express';
import { getPatients, getPatientById } from '../controllers/patient.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Restrict to clinical staff
// Example protection: router.route('/').get(protect, authorize('doctor', 'pharmacist'), getPatients);
router.route('/').get(getPatients);
router.route('/:id').get(getPatientById);

export default router;
