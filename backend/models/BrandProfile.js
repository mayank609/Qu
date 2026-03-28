const mongoose = require('mongoose');

const brandProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            maxlength: 200,
        },
        website: {
            type: String,
            default: '',
        },
        categories: [{
            type: String,
            default: '',
        }],
        gst: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            maxlength: 2000,
            default: '',
        },
        logo: {
            type: String,
            default: '',
        },
        budgetRangePreference: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
            currency: { type: String, default: 'INR' },
        },
        businessProof: {
            url: { type: String, default: '' },
            verified: { type: Boolean, default: false },
        },
        location: {
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            country: { type: String, default: '' },
        },
        ratings: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
            communication: { type: Number, default: 0 },
            timeliness: { type: Number, default: 0 },
            professionalism: { type: Number, default: 0 },
        },
        totalCampaigns: {
            type: Number,
            default: 0,
        },
        totalSpent: {
            type: Number,
            default: 0,
        },
        savedInfluencers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('BrandProfile', brandProfileSchema);
