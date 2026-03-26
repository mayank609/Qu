const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['brand', 'influencer'],
            required: [true, 'Role is required'],
        },
        avatar: {
            type: String,
            default: '',
        },
        googleId: {
            type: String,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationStatus: {
            type: String,
            enum: ['unverified', 'pending', 'verified'],
            default: 'unverified',
        },
        verificationDocuments: [
            {
                type: {
                    type: String,
                    enum: ['id', 'business_proof'],
                },
                url: String,
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
        trustBadge: {
            type: Boolean,
            default: false,
        },
        isSuspicious: {
            type: Boolean,
            default: false,
        },
        fraudScore: {
            type: Number,
            default: 0,
        },
        lastLoginIp: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        phoneNumber: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.generateToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

module.exports = mongoose.model('User', userSchema);
