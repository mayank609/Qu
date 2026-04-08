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

// @desc    Get all users by role (influencer or brand) with profile info
// @route   GET /api/admin/users?role=influencer&page=1&limit=20&search=
const getUsers = async (req, res, next) => {
    try {
        const { role, search, page: pageStr, limit: limitStr } = req.query;
        const page = parseInt(pageStr) || 1;
        const limit = parseInt(limitStr) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (role && (role === 'influencer' || role === 'brand')) query.role = role;
        if (search && String(search).trim()) {
            const words = String(search).trim().split(/\s+/).filter(Boolean);
            query.$and = words.map(w => ({
                $or: [
                    { name: { $regex: w, $options: 'i' } },
                    { email: { $regex: w, $options: 'i' } },
                ]
            }));
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('name email avatar role trustBadge verificationStatus isActive fraudScore createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query),
        ]);

        // Attach profile summaries
        const enriched = await Promise.all(users.map(async (user) => {
            const u = user.toObject();
            if (user.role === 'influencer') {
                const profile = await InfluencerProfile.findOne({ user: user._id })
                    .select('totalFollowers niche categories location priceExpectation engagementRate');
                u.profile = profile || null;
            } else if (user.role === 'brand') {
                const profile = await BrandProfile.findOne({ user: user._id })
                    .select('companyName website categories location totalCampaigns totalSpent');
                u.profile = profile || null;
            }
            return u;
        }));

        res.json({
            success: true,
            data: enriched,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get full profile details for a single user (admin)
// @route   GET /api/admin/users/:userId
const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .select('name email avatar role trustBadge verificationStatus isActive fraudScore createdAt');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const u = user.toObject();
        if (user.role === 'influencer') {
            u.profile = await InfluencerProfile.findOne({ user: user._id }).lean() || null;
        } else if (user.role === 'brand') {
            u.profile = await BrandProfile.findOne({ user: user._id }).lean() || null;
        }

        res.json({ success: true, data: u });
    } catch (error) { next(error); }
};

module.exports = {
    verifyUser,
    getPlatformStats,
    getFlaggedProfiles,
    getUsers,
    getUserById,
};
