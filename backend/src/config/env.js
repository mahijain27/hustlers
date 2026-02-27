import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config();

export const env = {
    port: process.env.PORT || 8000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/rxguard',
    jwtSecret: process.env.JWT_SECRET || 'your_super_secret_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cors: {
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10)
    }
};
