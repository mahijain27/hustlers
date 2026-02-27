import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { env } from '../config/env.js';
import { OAuth2Client } from 'google-auth-library';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn,
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        if (!firstName || !lastName || !email || !password || !role) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res, next) => {
    try {
        const { credential, role } = req.body;

        if (!credential) {
            res.status(400);
            throw new Error('Google credential is required');
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400);
            throw new Error('Invalid Google token');
        }

        const { email, given_name, family_name, sub } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            if (!role) {
                res.status(400);
                throw new Error('Role is required for new Google sign-ups');
            }

            user = await User.create({
                firstName: given_name || 'Google',
                lastName: family_name || 'User',
                email,
                role,
                googleId: sub
            });
        } else if (!user.googleId) {
            user.googleId = sub;
            await user.save();
        }

        res.json({
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};
