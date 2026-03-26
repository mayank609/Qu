const Application = require('../models/Application');
const Campaign = require('../models/Campaign');
const InfluencerProfile = require('../models/InfluencerProfile');
const Notification = require('../models/Notification');
const Escrow = require('../models/Escrow');
const { getPagination, paginationMeta } = require('../utils/helpers');

// @desc    Apply to campaign
// @route   POST /api/applications/:campaignId
const applyToCampaign = async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const { proposalMessage, customPrice, deliveryTimeline, portfolioLink } = req.body;

        // Check campaign exists and is active
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }
        if (campaign.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Campaign is not accepting applications' });
        }
        if (campaign.brand.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot apply to your own campaign' });
        }

        // Check max applications
        if (campaign.applicationsCount >= campaign.maxApplications) {
            return res.status(400).json({ success: false, message: 'Campaign has reached maximum applications' });
        }

        // Check if already applied
        const existing = await Application.findOne({
            campaign: campaignId,
            influencer: req.user._id,
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already applied to this campaign' });
        }

        const application = await Application.create({
            campaign: campaignId,
            influencer: req.user._id,
            proposalMessage,
            customPrice,
            deliveryTimeline,
            portfolioLink,
            status: 'applied',
            statusHistory: [{ status: 'applied', changedBy: req.user._id }],
        });

        // Increment application count
        campaign.applicationsCount += 1;
        await campaign.save();

        // Notify brand via Socket and DB
        const io = req.app.get('io');
        const notification = await Notification.create({
            user: campaign.brand,
            type: 'application_update',
            title: 'New Application',
            message: `New application received for "${campaign.title}"`,
            link: `/applications?campaignId=${campaignId}`,
        });

        if (io) {
            io.to(`user_${campaign.brand}`).emit('notification', notification);
        }

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get applications for a campaign (brand view)
// @route   GET /api/applications/campaign/:campaignId
const getCampaignApplications = async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const { page, limit, skip } = getPagination(req.query);
        const { status } = req.query;

        // Verify brand owns campaign
        const campaign = await Campaign.findOne({
            _id: campaignId,
            brand: req.user._id,
        });
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found or unauthorized' });
        }

        const filter = { campaign: campaignId };
        if (status) filter.status = status;

        const [applications, total] = await Promise.all([
            Application.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('influencer', 'name email avatar trustBadge'),
            Application.countDocuments(filter),
        ]);

        // Enrich with influencer profile data
        const enriched = await Promise.all(
            applications.map(async (app) => {
                const profile = await InfluencerProfile.findOne({ user: app.influencer._id });
                return {
                    ...app.toObject(),
                    influencerProfile: profile
                        ? {
                            totalFollowers: profile.totalFollowers,
                            engagementRate: profile.engagementRate,
                            categories: profile.categories,
                            ratings: profile.ratings,
                            niche: profile.niche,
                        }
                        : null,
                };
            })
        );

        res.json({
            success: true,
            data: enriched,
            pagination: paginationMeta(total, page, limit),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my applications (influencer view)
// @route   GET /api/applications/my
const getMyApplications = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { status } = req.query;

        const filter = { influencer: req.user._id };
        if (status) filter.status = status;

        const [applications, total] = await Promise.all([
            Application.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'campaign',
                    select: 'title platform budgetRange timeline status brand',
                    populate: { path: 'brand', select: 'name avatar' },
                }),
            Application.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: applications,
            pagination: paginationMeta(total, page, limit),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update application status (brand action)
// @route   PUT /api/applications/:id/status
const updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['shortlisted', 'accepted', 'rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed: ${validStatuses.join(', ')}`,
            });
        }

        const application = await Application.findById(req.params.id).populate('campaign');
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Verify brand owns the campaign
        if (application.campaign.brand.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        application.status = status;
        application.statusHistory.push({
            status,
            changedBy: req.user._id,
        });

        // If accepted, set up contract basics
        if (status === 'accepted') {
            application.contract = {
                agreedPrice: application.customPrice || application.campaign.budgetRange.min,
                agreedDeadline: application.campaign.timeline.endDate,
                signedByBrand: true,
            };

            // Add to selected influencers
            await Campaign.findByIdAndUpdate(application.campaign._id, {
                $addToSet: { selectedInfluencers: application.influencer },
            });

            // Auto-create escrow
            await Escrow.create({
                campaign: application.campaign._id,
                application: application._id,
                brand: req.user._id,
                influencer: application.influencer,
                amount: application.customPrice || application.campaign.budgetRange.min,
                platformFeePercent: parseInt(process.env.PLATFORM_FEE_PERCENT) || 10,
                status: 'pending',
            });
        }

        await application.save();

        // Notify influencer via Socket and DB
        const io = req.app.get('io');
        const notification = await Notification.create({
            user: application.influencer,
            type: 'application_update',
            title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your application for "${application.campaign.title}" has been ${status}`,
            link: `/applied-campaigns`,
            channel: 'push',
        });

        if (io) {
            io.to(`user_${application.influencer}`).emit('notification', notification);
        }

        res.json({
            success: true,
            message: `Application ${status} successfully`,
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload deliverable (content draft or final proof)
// @route   PUT /api/applications/:id/deliverable
const uploadDeliverable = async (req, res, next) => {
    try {
        const { type, url, feedback } = req.body; // type: 'draft' or 'final'

        const application = await Application.findOne({
            _id: req.params.id,
            influencer: req.user._id,
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Can only upload for accepted applications' });
        }

        if (type === 'draft') {
            application.contentDraft = {
                url,
                submittedAt: new Date(),
                status: 'submitted',
            };
        } else if (type === 'final') {
            application.finalProof = {
                url,
                type: req.body.proofType || 'live_link',
                submittedAt: new Date(),
            };
        }

        await application.save();

        // Notify brand
        const campaign = await Campaign.findById(application.campaign);
        if (campaign) {
            await Notification.create({
                user: campaign.brand,
                type: 'application_update',
                title: `${type === 'draft' ? 'Content Draft' : 'Final Proof'} Submitted`,
                message: `Influencer submitted ${type} for "${campaign.title}"`,
                link: `/applications/${application._id}`,
            });
        }

        res.json({
            success: true,
            message: `${type === 'draft' ? 'Content draft' : 'Final proof'} uploaded successfully`,
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get contract details
// @route   GET /api/applications/:id/contract
const getContract = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('campaign', 'title description deliverables platform timeline brand')
            .populate('influencer', 'name email');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Only brand or influencer can view
        const isInfluencer = application.influencer._id.toString() === req.user._id.toString();
        const isBrand = application.campaign.brand.toString() === req.user._id.toString();

        if (!isInfluencer && !isBrand) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const escrow = await Escrow.findOne({ application: application._id });

        res.json({
            success: true,
            data: {
                application,
                escrow: escrow
                    ? {
                        amount: escrow.amount,
                        platformFee: escrow.platformFee,
                        netAmount: escrow.netAmount,
                        status: escrow.status,
                    }
                    : null,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyToCampaign,
    getCampaignApplications,
    getMyApplications,
    updateApplicationStatus,
    uploadDeliverable,
    getContract,
};
