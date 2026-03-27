const User = require('../models/User');
const InfluencerProfile = require('../models/InfluencerProfile');
const BrandProfile = require('../models/BrandProfile');
const admin = require('../utils/firebase');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, email, password, role, phoneNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const user = await User.create({ name, email, password, role, phoneNumber });

        // Auto-create profile based on role
        if (role === 'influencer') {
            await InfluencerProfile.create({ user: user._id });
        } else if (role === 'brand') {
            await BrandProfile.create({ user: user._id, companyName: name });
        }

        const token = user.generateToken();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token,
                user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified, verificationStatus: user.verificationStatus, trustBadge: user.trustBadge },
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = user.generateToken();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified, verificationStatus: user.verificationStatus, trustBadge: user.trustBadge },
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const user = req.user;
        let profile = null;
        if (user.role === 'influencer') {
            profile = await InfluencerProfile.findOne({ user: user._id });
        } else if (user.role === 'brand') {
            profile = await BrandProfile.findOne({ user: user._id });
        }
        res.json({
            success: true,
            data: {
                user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified, verificationStatus: user.verificationStatus, trustBadge: user.trustBadge },
                profile,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Switch role
// @route   PUT /api/auth/switch-role
const switchRole = async (req, res, next) => {
    // ... existing switchRole logic (already checking and fixed)
    try {
        const newRole = req.user.role === 'brand' ? 'influencer' : 'brand';
        req.user.role = newRole;
        await req.user.save();

        // Create profile for new role if doesn't exist
        if (newRole === 'influencer') {
            const exists = await InfluencerProfile.findOne({ user: req.user._id });
            if (!exists) await InfluencerProfile.create({ user: req.user._id });
        } else {
            const exists = await BrandProfile.findOne({ user: req.user._id });
            if (!exists) await BrandProfile.create({ user: req.user._id, companyName: req.user.name });
        }

        const token = req.user.generateToken();
        res.json({
            success: true,
            message: `Switched to ${newRole} role`,
            data: { token, user: { _id: req.user._id, name: req.user.name, email: req.user.email, role: newRole } },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Google login
// @route   POST /api/auth/google
const googleLogin = async (req, res, next) => {
    try {
        const { idToken, role } = req.body;

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture } = decodedToken;

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                name,
                email,
                avatar: picture,
                role: role || 'influencer', // Default to influencer if not provided
                password: Math.random().toString(36).slice(-10), // Random password for required field
                isVerified: true,
            });

            // Initialize profile
            if (user.role === 'influencer') {
                await InfluencerProfile.create({ user: user._id });
            } else if (user.role === 'brand') {
                await BrandProfile.create({ user: user._id, companyName: name });
            }
        }

        user.lastLogin = new Date();
        await user.save();

        const token = user.generateToken();

        res.json({
            success: true,
            message: 'Google login successful',
            data: {
                token,
                user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified, verificationStatus: user.verificationStatus, trustBadge: user.trustBadge },
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, switchRole, googleLogin };
