const User = require('../models/User');
const InfluencerProfile = require('../models/InfluencerProfile');
const BrandProfile = require('../models/BrandProfile');
const Notification = require('../models/Notification');

// @desc    Verify user and assign trust badge
// @route   PUT /api/admin/verify-user/:userId
const verifyUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { trustBadge, verificationStatus } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (trustBadge !== undefined) user.trustBadge = trustBadge;
        if (verificationStatus) user.verificationStatus = verificationStatus;

        await user.save();

        // Notify user about verification success
        if (verificationStatus === 'verified') {
            await Notification.create({
                user: userId,
                type: 'system_alert',
                title: 'Account Verified!',
                message: `Congratulations! Your account has been verified. ${trustBadge ? 'You have also earned the Trust Badge.' : ''}`,
                link: '/dashboard'
            });
        }

        res.json({
            success: true,
            message: 'User verification status updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get platform-wide statistics for admin
// @route   GET /api/admin/stats
const getPlatformStats = async (req, res, next) => {
    try {
        const [userCount, influencerCount, brandCount, verifiedUsers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'influencer' }),
            User.countDocuments({ role: 'brand' }),
            User.countDocuments({ verificationStatus: 'verified' })
        ]);

        res.json({
            success: true,
            data: {
                totalUsers: userCount,
                influencers: influencerCount,
                brands: brandCount,
                verifiedRate: ((verifiedUsers / userCount) * 100).toFixed(1) + '%'
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get flagged profiles for security review
// @route   GET /api/admin/flagged-profiles
const getFlaggedProfiles = async (req, res, next) => {
    try {
        const flaggedUsers = await User.find({ verificationStatus: 'flagged' })
            .select('name email role avatar createdAt verificationStatus');
        
        // Enhance with profile data if influencer
        const enhancedProfiles = await Promise.all(flaggedUsers.map(async (user) => {
            const userData = user.toObject();
            if (user.role === 'influencer') {
                const profile = await InfluencerProfile.findOne({ user: user._id });
                userData.profile = profile;
            }
            return userData;
        }));

        res.json({
            success: true,
            data: enhancedProfiles
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyUser,
    getPlatformStats,
    getFlaggedProfiles
};
