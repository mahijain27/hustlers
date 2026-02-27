import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import drugRoutes from './routes/drug.routes.js';
import patientRoutes from './routes/patient.routes.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({ origin: env.cors.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (Basic DDoS protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Logging
if (env.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: env.nodeEnv });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/patients', patientRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
