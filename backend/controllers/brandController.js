const User = require('../models/User');
const BrandProfile = require('../models/BrandProfile');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const Escrow = require('../models/Escrow');
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

        // Sync with User model
        const userUpdate = {};
        const nameToSync = req.body.name || companyName;
        if (nameToSync) userUpdate.name = nameToSync;
        if (logo) userUpdate.avatar = logo;

        if (Object.keys(userUpdate).length > 0) {
            await User.findByIdAndUpdate(req.user._id, userUpdate);
        }

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
        ] = await Promise.all([
            Campaign.countDocuments({ brand: req.user._id, status: 'active' }),
            Campaign.countDocuments({ brand: req.user._id }),
            Application.aggregate([
                {
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaign',
                        foreignField: '_id',
                        as: 'campaignInfo',
                    },
                },
                { $match: { 'campaignInfo.brand': req.user._id } },
                { $count: 'total' },
            ]),
            Escrow.aggregate([
                { $match: { brand: req.user._id, status: 'released' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                activeCampaigns,
                totalCampaigns,
                totalApplicationsReceived: totalApplications[0]?.total || 0,
                totalSpent: totalSpent[0]?.total || 0,
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

const InfluencerProfile = require('../models/InfluencerProfile');

// @desc    Toggle save influencer profile
// @route   POST /api/brand/save-influencer/:influencerId
const toggleSaveInfluencer = async (req, res, next) => {
    try {
        const { influencerId } = req.params;
        const brandProfile = await BrandProfile.findOne({ user: req.user._id });

        if (!brandProfile) {
            return res.status(404).json({ success: false, message: 'Brand profile not found' });
        }

        const index = brandProfile.savedInfluencers.indexOf(influencerId);
        if (index === -1) {
            brandProfile.savedInfluencers.push(influencerId);
            await brandProfile.save();

            // Notify the influencer that their profile was saved
            const brandName = brandProfile.companyName || req.user.name || 'A brand';
            await Notification.create({
                user: influencerId,
                type: 'profile_saved',
                title: 'Profile Saved!',
                message: `Your profile has been saved by "${brandName}". They might reach out for a collaboration soon!`,
                link: '/influencer/dashboard',
                metadata: { brandId: req.user._id, brandName },
            });

            return res.json({ success: true, message: 'Influencer saved to your list', isSaved: true });
        } else {
            brandProfile.savedInfluencers.splice(index, 1);
            await brandProfile.save();
            return res.json({ success: true, message: 'Influencer removed from your list', isSaved: false });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all saved influencers
// @route   GET /api/brand/saved-influencers
const getSavedInfluencers = async (req, res, next) => {
    try {
        const brandProfile = await BrandProfile.findOne({ user: req.user._id })
            .populate({
                path: 'savedInfluencers',
                select: 'name avatar trustBadge verificationStatus',
            });

        if (!brandProfile) {
            return res.status(404).json({ success: false, message: 'Brand profile not found' });
        }

        // Get the corresponding InfluencerProfile for each saved User
        const influencerProfiles = await InfluencerProfile.find({
            user: { $in: brandProfile.savedInfluencers.map(u => u._id) }
        }).populate('user', 'name avatar trustBadge verificationStatus');

        res.json({ success: true, data: influencerProfiles });
    } catch (error) {
        next(error);
    }
};

// @desc    Update only the brand user's avatar (kept small to stay under Vercel 4.5MB body limit)
// @route   PUT /api/brand/avatar
const updateAvatar = async (req, res, next) => {
    try {
        const { avatar } = req.body;
        if (!avatar) return res.status(400).json({ success: false, message: 'avatar is required' });
        // Update both User.avatar and BrandProfile.logo so all views stay in sync
        await Promise.all([
            User.findByIdAndUpdate(req.user._id, { avatar }),
            BrandProfile.findOneAndUpdate({ user: req.user._id }, { logo: avatar }),
        ]);
        res.json({ success: true, message: 'Avatar updated' });
    } catch (error) { next(error); }
};

module.exports = {
    getProfile,
    updateProfile,
    updateAvatar,
    getDashboard,
    inviteInfluencer,
    toggleSaveInfluencer,
    getSavedInfluencers,
};
