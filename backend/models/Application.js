const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            required: true,
        },
        influencer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        proposalMessage: {
            type: String,
            required: [true, 'Proposal message is required'],
            maxlength: 2000,
        },
        customPrice: {
            type: Number,
            default: null,
        },
        deliveryTimeline: {
            type: String,
            default: '',
        },
        portfolioLink: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['applied', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
            default: 'applied',
        },
        contentDraft: {
            url: { type: String, default: '' },
            submittedAt: Date,
            feedback: { type: String, default: '' },
            status: {
                type: String,
                enum: ['not_submitted', 'submitted', 'approved', 'revision_needed'],
                default: 'not_submitted',
            },
        },
        finalProof: {
            url: { type: String, default: '' },
            type: {
                type: String,
                enum: ['live_link', 'screenshot', 'video', 'other'],
                default: 'live_link',
            },
            submittedAt: Date,
        },
        deliverableChecklist: [
            {
                item: String,
                completed: { type: Boolean, default: false },
                completedAt: Date,
            },
        ],
        contract: {
            agreedPrice: Number,
            agreedDeadline: Date,
            terms: String,
            signedByBrand: { type: Boolean, default: false },
            signedByInfluencer: { type: Boolean, default: false },
            signedAt: Date,
        },
        statusHistory: [
            {
                status: String,
                changedAt: { type: Date, default: Date.now },
                changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// One application per influencer per campaign
applicationSchema.index({ campaign: 1, influencer: 1 }, { unique: true });
applicationSchema.index({ influencer: 1, status: 1 });
applicationSchema.index({ campaign: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
