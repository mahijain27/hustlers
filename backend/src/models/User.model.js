import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        password: {
            type: String,
            required: [
                function () { return !this.googleId; },
                'Please add a password'
            ],
            minlength: 6,
            select: false
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        role: {
            type: String,
            enum: ['pharmacist', 'doctor', 'patient'],
            required: [true, 'Please assign a role']
        },
        firstName: {
            type: String,
            required: [true, 'Please add a first name'],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, 'Please add a last name'],
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
