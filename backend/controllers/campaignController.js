const Campaign = require('../models/Campaign');
const BrandProfile = require('../models/BrandProfile');
const { getPagination, paginationMeta, buildSort } = require('../utils/helpers');

// @desc    Create campaign
// @route   POST /api/campaigns
const createCampaign = async (req, res, next) => {
    try {
        const {
            title,
            description,
            deliverables,
            platform,
            budgetRange,
            timeline,
            audienceTarget,
            hashtags,
            contentGuidelines,
            location,
            category,
            urgency,
            maxApplications,
        } = req.body;

        const campaign = await Campaign.create({
            brand: req.user._id,
            title,
            description,
            deliverables,
            platform,
            budgetRange,
            timeline,
            audienceTarget,
            hashtags,
            contentGuidelines,
            location,
            category,
            urgency: urgency || 'medium',
            maxApplications: maxApplications || 50,
            status: 'active',
        });

        // Increment brand campaign count
        await BrandProfile.findOneAndUpdate(
            { user: req.user._id },
            { $inc: { totalCampaigns: 1 } }
        );

        res.status(201).json({
            success: true,
            message: 'Campaign created successfully',
            data: campaign,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Browse campaigns (with filters)
// @route   GET /api/campaigns
const getCampaigns = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const {
            category,
            platform,
            minBudget,
            maxBudget,
            country,
            urgency,
            status,
            sort: sortQuery,
            search,
        } = req.query;

        // Build filter
        const filter = { status: status || 'active' };

        if (category) filter.category = category;
        if (platform && platform !== 'all') {
            filter.platform = { $regex: new RegExp(`^${platform}`, 'i') };
        }
        if (urgency) filter.urgency = urgency;
        if (country) filter['location.country'] = { $regex: country, $options: 'i' };
        if (minBudget || maxBudget) {
            filter['budgetRange.min'] = {};
            filter['budgetRange.max'] = {};
            if (minBudget) filter['budgetRange.max'].$gte = parseInt(minBudget);
            if (maxBudget) filter['budgetRange.min'].$lte = parseInt(maxBudget);
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const sort = buildSort(sortQuery);

        const [campaigns, total] = await Promise.all([
            Campaign.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('brand', 'name avatar trustBadge'),
            Campaign.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: campaigns,
            pagination: paginationMeta(total, page, limit),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
const getCampaign = async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('brand', 'name email avatar trustBadge verificationStatus');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found',
            });
        }

        // Get brand profile for extra info
        const brandProfile = await BrandProfile.findOne({ user: campaign.brand._id });

        res.json({
            success: true,
            data: {
                ...campaign.toObject(),
                brandProfile: brandProfile
                    ? {
                        companyName: brandProfile.companyName,
                        website: brandProfile.website,
                        ratings: brandProfile.ratings,
                        totalCampaigns: brandProfile.totalCampaigns,
                    }
                    : null,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
const updateCampaign = async (req, res, next) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            brand: req.user._id,
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found or unauthorized',
            });
        }

        const allowedFields = [
            'title', 'description', 'deliverables', 'platform', 'budgetRange',
            'timeline', 'audienceTarget', 'hashtags', 'contentGuidelines',
            'location', 'category', 'urgency', 'status', 'maxApplications',
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                campaign[field] = req.body[field];
            }
        });

        await campaign.save();

        res.json({
            success: true,
            message: 'Campaign updated successfully',
            data: campaign,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
const deleteCampaign = async (req, res, next) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            brand: req.user._id,
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found or unauthorized',
            });
        }

        if (campaign.status === 'active' && campaign.applicationsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete an active campaign with applications. Close it first.',
            });
        }

        await Campaign.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Campaign deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get brand's own campaigns
// @route   GET /api/campaigns/brand/my
const getMyCampaigns = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { status } = req.query;

        const filter = { brand: req.user._id };
        if (status) filter.status = status;

        const [campaigns, total] = await Promise.all([
            Campaign.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Campaign.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: campaigns,
            pagination: paginationMeta(total, page, limit),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaign,
    updateCampaign,
    deleteCampaign,
    getMyCampaigns,
};
