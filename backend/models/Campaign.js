const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
    {
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Campaign title is required'],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, 'Campaign description is required'],
            maxlength: 5000,
        },
        imageUrl: {
            type: String,
            default: '',
        },
        deliverables: [
            {
                type: { type: String },
                description: String,
                quantity: { type: Number, default: 1 },
            },
        ],
        platform: [
            {
                type: String,
                enum: [
                    'instagram_reel',
                    'instagram_story',
                    'instagram_post',
                    'youtube_video',
                    'youtube_short',
                    'facebook_post',
                    'tiktok_video',
                    'linkedin_post',
                    'twitter_post',
                    'snapchat_spotlight',
                    'blog_post',
                    'multiple',
                    'other',
                ],
            },
        ],
        budgetRange: {
            min: { type: Number, required: true },
            max: { type: Number, required: true },
            currency: { type: String, default: 'INR' },
        },
        timeline: {
            startDate: { type: Date },
            endDate: { type: Date, required: true },
        },
        audienceTarget: {
            ageRange: {
                min: { type: Number, default: 18 },
                max: { type: Number, default: 65 },
            },
            gender: {
                type: String,
                enum: ['all', 'male', 'female', 'other'],
                default: 'all',
            },
            countries: [String],
            interests: [String],
        },
        hashtags: [{ type: String }],
        contentGuidelines: {
            type: String,
            maxlength: 3000,
            default: '',
        },
        location: {
            city: { type: String, default: '' },
            country: { type: String, default: '' },
        },
        category: {
            type: String,
            required: true,
        },
        urgency: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['draft', 'active', 'paused', 'closed', 'completed'],
            default: 'active',
        },
        applicationsCount: {
            type: Number,
            default: 0,
        },
        maxApplications: {
            type: Number,
            default: 50,
        },
        selectedInfluencers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        invitedInfluencers: [
            {
                influencer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                invitedAt: { type: Date, default: Date.now },
                status: {
                    type: String,
                    enum: ['pending', 'accepted', 'declined'],
                    default: 'pending',
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for filtering/search
campaignSchema.index({ status: 1, category: 1 });
campaignSchema.index({ 'budgetRange.min': 1, 'budgetRange.max': 1 });
campaignSchema.index({ platform: 1 });
campaignSchema.index({ urgency: 1 });
campaignSchema.index({ brand: 1 });
campaignSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);
