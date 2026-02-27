import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401);
            throw new Error('Not authorized, no token');
        }

        // Verify token
        const decoded = jwt.verify(token, env.jwtSecret);

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized, user not found');
        }

        next();
    } catch (error) {
        res.status(401);
        next(new Error('Not authorized, token failed'));
    }
};
