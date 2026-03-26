const User = require('../models/User');
const BrandProfile = require('../models/BrandProfile');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const Escrow = require('../models/Escrow');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');

// @desc    Get brand profile
// @route   GET /api/brand/profile
const getProfile = async (req, res, next) => {
    try {
        const profile = await BrandProfile.findOne({ user: req.user._id }).populate(
            'user',
            'name email avatar verificationStatus trustBadge'
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Brand profile not found. Please complete your profile setup.',
            });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
};

// @desc    Create or update brand profile
// @route   PUT /api/brand/profile
const updateProfile = async (req, res, next) => {
    try {
        const {
            companyName,
            website,
            categories,
            gst,
            description,
            logo,
            budgetRangePreference,
            location,
        } = req.body;

        let profile = await BrandProfile.findOne({ user: req.user._id });

        if (!profile) {
            profile = new BrandProfile({
                user: req.user._id,
                companyName: companyName || req.user.name,
            });
        }

        if (companyName !== undefined) profile.companyName = companyName;
        if (website !== undefined) profile.website = website;
        if (categories !== undefined) profile.categories = categories;
        if (gst !== undefined) profile.gst = gst;
        if (description !== undefined) profile.description = description;
        if (logo !== undefined) profile.logo = logo;
        if (budgetRangePreference) profile.budgetRangePreference = { ...profile.budgetRangePreference, ...budgetRangePreference };
        if (location) profile.location = { ...profile.location, ...location };

        await profile.save();

        res.json({
            success: true,
            message: 'Brand profile updated successfully',
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get brand dashboard
// @route   GET /api/brand/dashboard
const getDashboard = async (req, res, next) => {
    try {
        const [
            activeCampaigns,
            totalCampaigns,
            totalApplications,
            totalSpent,
            avgRating,
        ] = await Promise.all([
            Campaign.countDocuments({ brand: req.user._id, status: 'active' }),
            Campaign.countDocuments({ brand: req.user._id }),
            Application.countDocuments({
                campaign: { $in: await Campaign.find({ brand: req.user._id }).distinct('_id') },
            }),
            Escrow.aggregate([
                { $match: { brand: req.user._id, status: 'released' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Rating.aggregate([
                { $match: { ratee: req.user._id } },
                { $group: { _id: null, avg: { $avg: '$overallScore' }, count: { $sum: 1 } } },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                activeCampaigns,
                totalCampaigns,
                totalApplicationsReceived: totalApplications,
                totalSpent: totalSpent[0]?.total || 0,
                rating: {
                    average: avgRating[0]?.avg?.toFixed(1) || 0,
                    count: avgRating[0]?.count || 0,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Invite influencer to campaign
// @route   POST /api/brand/invite/:influencerId
const inviteInfluencer = async (req, res, next) => {
    try {
        const { influencerId } = req.params;
        const { campaignId, message } = req.body;

        // Verify campaign belongs to brand
        const campaign = await Campaign.findOne({
            _id: campaignId,
            brand: req.user._id,
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found or unauthorized',
            });
        }

        // Check influencer exists
        const influencer = await User.findOne({ _id: influencerId, role: 'influencer' });
        if (!influencer) {
            return res.status(404).json({
                success: false,
                message: 'Influencer not found',
            });
        }

        // Check if already invited
        const alreadyInvited = campaign.invitedInfluencers.find(
            (inv) => inv.influencer.toString() === influencerId
        );

        if (alreadyInvited) {
            return res.status(400).json({
                success: false,
                message: 'Influencer already invited to this campaign',
            });
        }

        campaign.invitedInfluencers.push({ influencer: influencerId });
        await campaign.save();

        // Create notification
        await Notification.create({
            user: influencerId,
            type: 'campaign_invite',
            title: 'Campaign Invitation',
            message: `You've been invited to "${campaign.title}"${message ? `: ${message}` : ''}`,
            link: `/campaigns/${campaign._id}`,
        });

        res.json({
            success: true,
            message: 'Influencer invited successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getDashboard,
    inviteInfluencer,
};
