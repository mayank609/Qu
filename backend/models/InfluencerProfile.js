const mongoose = require('mongoose');

const influencerProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        bio: {
            type: String,
            maxlength: 1000,
            default: '',
        },
        categories: [
            {
                type: String,
            },
        ],
        bestContent: [
            {
                url: String,
                type: { type: String, enum: ['image', 'video'], default: 'image' },
            },
        ],
        platforms: {
            instagram: {
                handle: { type: String, default: '' },
                followers: { type: Number, default: 0 },
                engagementRate: { type: Number, default: 0 },
                avgLikes: { type: Number, default: 0 },
                avgComments: { type: Number, default: 0 },
                connected: { type: Boolean, default: false },
            },
            youtube: {
                handle: { type: String, default: '' },
                subscribers: { type: Number, default: 0 },
                avgViews: { type: Number, default: 0 },
                connected: { type: Boolean, default: false },
            },
            linkedin: {
                handle: { type: String, default: '' },
                connections: { type: Number, default: 0 },
                connected: { type: Boolean, default: false },
            },
            tiktok: {
                handle: { type: String, default: '' },
                followers: { type: Number, default: 0 },
                connected: { type: Boolean, default: false },
            },
            twitter: {
                handle: { type: String, default: '' },
                followers: { type: Number, default: 0 },
                connected: { type: Boolean, default: false },
            },
            facebook: {
                handle: { type: String, default: '' },
                followers: { type: Number, default: 0 },
                connected: { type: Boolean, default: false },
            },
        },
        totalFollowers: {
            type: Number,
            default: 0,
        },
        engagementRate: {
            type: Number,
            default: 0,
        },
        niche: {
            type: String,
            default: '',
        },
        audienceCountry: [
            {
                country: String,
                percentage: Number,
            },
        ],
        languages: [{ type: String }],
        location: {
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            country: { type: String, default: '' },
        },
        priceExpectation: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
            currency: { type: String, default: 'INR' },
        },
        portfolioLinks: [
            {
                title: String,
                url: String,
                platform: String,
            },
        ],
        ratings: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
            communication: { type: Number, default: 0 },
            timeliness: { type: Number, default: 0 },
            professionalism: { type: Number, default: 0 },
        },
        completedCampaigns: {
            type: Number,
            default: 0,
        },
        totalEarnings: {
            type: Number,
            default: 0,
        },
        searchRank: {
            type: Number,
            default: 0,
        },
        profileViews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for search
influencerProfileSchema.index({ totalFollowers: -1 });
influencerProfileSchema.index({ engagementRate: -1 });
influencerProfileSchema.index({ categories: 1 });
influencerProfileSchema.index({ 'location.country': 1 });
influencerProfileSchema.index({ searchRank: -1 });

module.exports = mongoose.model('InfluencerProfile', influencerProfileSchema);
