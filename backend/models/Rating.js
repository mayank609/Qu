const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
    {
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            required: true,
        },
        rater: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        ratee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        communication: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        timeliness: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        professionalism: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        overallScore: {
            type: Number,
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            maxlength: 1000,
            default: '',
        },
        raterWeight: {
            type: Number,
            default: 1.0,
        },
    },
    {
        timestamps: true,
    }
);

// One rating per rater per campaign
ratingSchema.index({ campaign: 1, rater: 1 }, { unique: true });
ratingSchema.index({ ratee: 1, overallScore: -1 });

// Compute overall before save
ratingSchema.pre('save', function (next) {
    this.overallScore = parseFloat(
        ((this.communication + this.timeliness + this.professionalism) / 3).toFixed(1)
    );
    next();
});

module.exports = mongoose.model('Rating', ratingSchema);
