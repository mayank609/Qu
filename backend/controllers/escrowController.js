const Escrow = require('../models/Escrow');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const InfluencerProfile = require('../models/InfluencerProfile');
const BrandProfile = require('../models/BrandProfile');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

// @desc    Fund campaign (brand locks money in escrow)
// @route   POST /api/escrow/fund/:campaignId
const fundCampaign = async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const { applicationId } = req.body;

        const escrow = await Escrow.findOne({
            campaign: campaignId,
            application: applicationId,
            brand: req.user._id,
        });

        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow record not found' });
        }

        if (escrow.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Cannot fund — escrow is already ${escrow.status}` });
        }

        escrow.status = 'locked';
        escrow.fundedAt = new Date();
        escrow.transactionHistory.push({
            action: 'funded',
            performedBy: req.user._id,
            amount: escrow.amount,
            note: 'Campaign funded, money locked in escrow',
        });

        await escrow.save();

        // Notify influencer
        await Notification.create({
            user: escrow.influencer,
            type: 'escrow_update',
            title: 'Campaign Funded',
            message: `The brand has funded ₹${escrow.amount} for your campaign. Money is locked in escrow.`,
            link: `/escrow/${escrow._id}`,
        });

        res.json({
            success: true,
            message: 'Campaign funded successfully. Money locked in escrow.',
            data: escrow,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Release payment to influencer
// @route   PUT /api/escrow/release/:escrowId
const releasePayment = async (req, res, next) => {
    try {
        const escrow = await Escrow.findOne({
            _id: req.params.escrowId,
            brand: req.user._id,
        });

        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow not found' });
        }

        if (escrow.status !== 'locked') {
            return res.status(400).json({ success: false, message: `Cannot release — escrow is ${escrow.status}` });
        }

        const disputeWindowDays = parseInt(process.env.DISPUTE_WINDOW_DAYS) || 7;

        escrow.status = 'released';
        escrow.releasedAt = new Date();
        escrow.disputeWindow = new Date(Date.now() + disputeWindowDays * 24 * 60 * 60 * 1000);
        escrow.transactionHistory.push({
            action: 'released',
            performedBy: req.user._id,
            amount: escrow.netAmount,
            note: `Payment released. Platform fee: ₹${escrow.platformFee}. Net to influencer: ₹${escrow.netAmount}`,
        });

        await escrow.save();

        // Update influencer earnings
        await InfluencerProfile.findOneAndUpdate(
            { user: escrow.influencer },
            {
                $inc: {
                    totalEarnings: escrow.netAmount,
                    completedCampaigns: 1,
                },
            }
        );

        // Update brand total spent
        await BrandProfile.findOneAndUpdate(
            { user: escrow.brand },
            { $inc: { totalSpent: escrow.amount } }
        );

        // Update campaign & application status
        await Application.findByIdAndUpdate(escrow.application, { status: 'accepted' });

        // Lock the conversation
        const conversation = await Conversation.findOne({
            participants: { $all: [escrow.brand, escrow.influencer] },
            campaign: escrow.campaign,
        });
        if (conversation) {
            conversation.isLocked = true;
            conversation.lockedAt = new Date();
            await conversation.save();
        }

        // Notify influencer
        await Notification.create({
            user: escrow.influencer,
            type: 'payment_confirmation',
            title: 'Payment Released!',
            message: `₹${escrow.netAmount} has been released to you. Platform fee: ₹${escrow.platformFee}`,
            link: `/earnings`,
        });

        // Send rating reminders
        for (const userId of [escrow.brand, escrow.influencer]) {
            await Notification.create({
                user: userId,
                type: 'rating_reminder',
                title: 'Rate Your Experience',
                message: 'Campaign completed! Please rate your experience.',
                link: `/rate/${escrow.campaign}`,
            });
        }

        res.json({
            success: true,
            message: 'Payment released successfully',
            data: {
                netAmount: escrow.netAmount,
                platformFee: escrow.platformFee,
                disputeWindowEnds: escrow.disputeWindow,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Raise dispute
// @route   PUT /api/escrow/dispute/:escrowId
const raiseDispute = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const escrow = await Escrow.findOne({
            _id: req.params.escrowId,
            $or: [{ brand: req.user._id }, { influencer: req.user._id }],
        });

        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow not found' });
        }

        if (!['locked', 'released'].includes(escrow.status)) {
            return res.status(400).json({ success: false, message: 'Cannot dispute at this stage' });
        }

        // If released, check dispute window
        if (escrow.status === 'released' && escrow.disputeWindow < new Date()) {
            return res.status(400).json({ success: false, message: 'Dispute window has expired' });
        }

        escrow.status = 'disputed';
        escrow.dispute = {
            raisedBy: req.user._id,
            reason,
            raisedAt: new Date(),
            resolution: 'pending',
        };
        escrow.transactionHistory.push({
            action: 'disputed',
            performedBy: req.user._id,
            note: `Dispute raised: ${reason}`,
        });

        await escrow.save();

        // Notify the other party
        const otherParty =
            escrow.brand.toString() === req.user._id.toString()
                ? escrow.influencer
                : escrow.brand;

        await Notification.create({
            user: otherParty,
            type: 'escrow_update',
            title: 'Dispute Raised',
            message: `A dispute has been raised for the campaign payment.`,
            link: `/escrow/${escrow._id}`,
        });

        res.json({
            success: true,
            message: 'Dispute raised successfully. Our team will review.',
            data: escrow,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get escrow status
// @route   GET /api/escrow/status/:campaignId
const getEscrowStatus = async (req, res, next) => {
    try {
        const escrows = await Escrow.find({
            campaign: req.params.campaignId,
            $or: [{ brand: req.user._id }, { influencer: req.user._id }],
        })
            .populate('influencer', 'name email')
            .populate('brand', 'name email');

        res.json({
            success: true,
            data: escrows,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    fundCampaign,
    releasePayment,
    raiseDispute,
    getEscrowStatus,
};
