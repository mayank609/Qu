const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema(
    {
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            required: true,
        },
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
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
            required: [true, 'Amount is required'],
            min: 0,
        },
        platformFee: {
            type: Number,
            default: 0,
        },
        platformFeePercent: {
            type: Number,
            default: 10,
        },
        netAmount: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        status: {
            type: String,
            enum: ['pending', 'locked', 'released', 'disputed', 'refunded'],
            default: 'pending',
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
            resolvedAt: Date,
            resolution: {
                type: String,
                enum: ['pending', 'refunded', 'released', 'partial'],
                default: 'pending',
            },
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

// Calculate platform fee and net amount before save
escrowSchema.pre('save', function (next) {
    if (this.isModified('amount') || this.isNew) {
        this.platformFee = parseFloat(
            (this.amount * (this.platformFeePercent / 100)).toFixed(2)
        );
        this.netAmount = parseFloat(
            (this.amount - this.platformFee).toFixed(2)
        );
    }
    next();
});

escrowSchema.index({ campaign: 1 });
escrowSchema.index({ brand: 1 });
escrowSchema.index({ influencer: 1 });
escrowSchema.index({ status: 1 });

module.exports = mongoose.model('Escrow', escrowSchema);
