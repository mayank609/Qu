const User = require('../models/User');
const InfluencerProfile = require('../models/InfluencerProfile');
const Application = require('../models/Application');
const Escrow = require('../models/Escrow');
const Rating = require('../models/Rating');

// @desc    Get influencer own profile
// @route   GET /api/influencer/profile
const getProfile = async (req, res, next) => {
    try {
        const profile = await InfluencerProfile.findOne({ user: req.user._id }).populate(
            'user',
            'name email avatar verificationStatus trustBadge'
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Influencer profile not found. Please complete your profile setup.',
            });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
};

// @desc    Create or update influencer profile
// @route   PUT /api/influencer/profile
const updateProfile = async (req, res, next) => {
    try {
        const {
            bio,
            categories,
            niche,
            languages,
            location,
            priceExpectation,
            portfolioLinks,
        } = req.body;

        let profile = await InfluencerProfile.findOne({ user: req.user._id });

        if (!profile) {
            profile = new InfluencerProfile({ user: req.user._id });
        }

        if (bio !== undefined) profile.bio = bio;
        if (categories) profile.categories = categories;
        if (niche !== undefined) profile.niche = niche;
        if (languages) profile.languages = languages;
        if (location) profile.location = { ...profile.location, ...location };
        if (priceExpectation) profile.priceExpectation = { ...profile.priceExpectation, ...priceExpectation };
        if (portfolioLinks) profile.portfolioLinks = portfolioLinks;

        await profile.save();

        // Trigger fraud check in background
        const { detectProfileAnomaly } = require('../controllers/fraudController');
        detectProfileAnomaly(profile).then(async (anomalies) => {
            if (anomalies.length > 0) {
                await User.findByIdAndUpdate(req.user._id, { verificationStatus: 'flagged' });
                await Notification.create({
                    user: req.user._id,
                    type: 'system_alert',
                    title: 'Profile Flagged',
                    message: `System detected anomalies: ${anomalies.join(', ')}. Profile is under review.`,
                    link: '/profile'
                });
            }
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Connect social media platform
// @route   PUT /api/influencer/connect-platform
const connectPlatform = async (req, res, next) => {
    try {
        const { platform, handle, followers, engagementRate, avgLikes, avgComments, subscribers, avgViews, connections } = req.body;

        let profile = await InfluencerProfile.findOne({ user: req.user._id });
        if (!profile) {
            profile = new InfluencerProfile({ user: req.user._id });
        }

        if (platform === 'instagram') {
            profile.platforms.instagram = {
                handle: handle || '',
                followers: followers || 0,
                engagementRate: engagementRate || 0,
                avgLikes: avgLikes || 0,
                avgComments: avgComments || 0,
                connected: true,
            };
        } else if (platform === 'youtube') {
            profile.platforms.youtube = {
                handle: handle || '',
                subscribers: subscribers || 0,
                avgViews: avgViews || 0,
                connected: true,
            };
        } else if (platform === 'linkedin') {
            profile.platforms.linkedin = {
                handle: handle || '',
                connections: connections || 0,
                connected: true,
            };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid platform. Supported: instagram, youtube, linkedin',
            });
        }

        // Recalculate total followers
        profile.totalFollowers =
            (profile.platforms.instagram?.followers || 0) +
            (profile.platforms.youtube?.subscribers || 0) +
            (profile.platforms.linkedin?.connections || 0);

        // Use Instagram engagement rate as primary
        profile.engagementRate = profile.platforms.instagram?.engagementRate || 0;

        await profile.save();

        res.json({
            success: true,
            message: `${platform} connected successfully`,
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get influencer dashboard stats
// @route   GET /api/influencer/dashboard
const getDashboard = async (req, res, next) => {
    try {
        const profile = await InfluencerProfile.findOne({ user: req.user._id });

        const [
            totalApplications,
            acceptedCampaigns,
            pendingApplications,
            totalEarnings,
            avgRating,
        ] = await Promise.all([
            Application.countDocuments({ influencer: req.user._id }),
            Application.countDocuments({ influencer: req.user._id, status: 'accepted' }),
            Application.countDocuments({ influencer: req.user._id, status: 'applied' }),
            Escrow.aggregate([
                { $match: { influencer: req.user._id, status: 'released' } },
                { $group: { _id: null, total: { $sum: '$netAmount' } } },
            ]),
            Rating.aggregate([
                { $match: { ratee: req.user._id } },
                { $group: { _id: null, avg: { $avg: '$overallScore' }, count: { $sum: 1 } } },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                totalApplications,
                acceptedCampaigns,
                pendingApplications,
                totalEarnings: totalEarnings[0]?.total || 0,
                rating: {
                    average: avgRating[0]?.avg?.toFixed(1) || 0,
                    count: avgRating[0]?.count || 0,
                },
                profileViews: profile?.profileViews || 0,
                completedCampaigns: profile?.completedCampaigns || 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get influencer analytics
// @route   GET /api/influencer/analytics
const getAnalytics = async (req, res, next) => {
    try {
        const profile = await InfluencerProfile.findOne({ user: req.user._id });

        const recentApplications = await Application.find({ influencer: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('campaign', 'title brand budgetRange');

        const ratingBreakdown = await Rating.aggregate([
            { $match: { ratee: req.user._id } },
            {
                $group: {
                    _id: null,
                    avgCommunication: { $avg: '$communication' },
                    avgTimeliness: { $avg: '$timeliness' },
                    avgProfessionalism: { $avg: '$professionalism' },
                    avgOverall: { $avg: '$overallScore' },
                    totalRatings: { $sum: 1 },
                },
            },
        ]);

        res.json({
            success: true,
            data: {
                platforms: profile?.platforms || {},
                totalFollowers: profile?.totalFollowers || 0,
                engagementRate: profile?.engagementRate || 0,
                profileViews: profile?.profileViews || 0,
                recentApplications,
                ratingBreakdown: ratingBreakdown[0] || null,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get earnings history
// @route   GET /api/influencer/earnings
const getEarnings = async (req, res, next) => {
    try {
        const { getPagination, paginationMeta } = require('../utils/helpers');
        const { page, limit, skip } = getPagination(req.query);

        const [earnings, total] = await Promise.all([
            Escrow.find({ influencer: req.user._id, status: { $in: ['released', 'locked'] } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('campaign', 'title')
                .populate('brand', 'name'),
            Escrow.countDocuments({ influencer: req.user._id, status: { $in: ['released', 'locked'] } }),
        ]);

        const totalReleased = await Escrow.aggregate([
            { $match: { influencer: req.user._id, status: 'released' } },
            { $group: { _id: null, total: { $sum: '$netAmount' } } },
        ]);

        const totalPending = await Escrow.aggregate([
            { $match: { influencer: req.user._id, status: 'locked' } },
            { $group: { _id: null, total: { $sum: '$netAmount' } } },
        ]);

        res.json({
            success: true,
            data: {
                earnings,
                summary: {
                    totalReleased: totalReleased[0]?.total || 0,
                    totalPending: totalPending[0]?.total || 0,
                },
                pagination: paginationMeta(total, page, limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    connectPlatform,
    getDashboard,
    getAnalytics,
    getEarnings,
};
