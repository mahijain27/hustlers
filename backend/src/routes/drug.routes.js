import express from 'express';
import { verifyInteractions } from '../controllers/drug.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Temporarily public-ish for easier frontend integration
router.post('/check', verifyInteractions);

export default router;
