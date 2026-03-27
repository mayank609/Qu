const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
        },
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            required: true,
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        influencer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'locked', 'released', 'disputed', 'refunded'],
            default: 'pending',
        },
        platformFee: {
            type: Number,
            default: 0,
        },
        netAmount: {
            type: Number,
            default: 0,
        },
        paymentId: {
            type: String,
            default: null,
        },
        fundedAt: {
            type: Date,
            default: null,
        },
        releasedAt: {
            type: Date,
            default: null,
        },
        disputeWindow: {
            type: Date,
            default: null,
        },
        dispute: {
            raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reason: String,
            raisedAt: Date,
            resolution: { type: String, enum: ['pending', 'brand_refunded', 'influencer_paid'] },
        },
        transactionHistory: [
            {
                action: String,
                performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                amount: Number,
                note: String,
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

escrowSchema.pre('save', function (next) {
    if (this.isModified('amount')) {
        const platformFeePercent = 10; // Default 10%
        this.platformFee = (this.amount * platformFeePercent) / 100;
        this.netAmount = this.amount - this.platformFee;
    }
    next();
});

module.exports = mongoose.model('Escrow', escrowSchema);
