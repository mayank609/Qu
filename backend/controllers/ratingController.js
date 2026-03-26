const Rating = require('../models/Rating');
const Application = require('../models/Application');
const InfluencerProfile = require('../models/InfluencerProfile');
const BrandProfile = require('../models/BrandProfile');
const User = require('../models/User');
const { getPagination, paginationMeta } = require('../utils/helpers');

const rateCampaign = async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const { rateeId, communication, timeliness, professionalism, review } = req.body;

        const application = await Application.findOne({
            campaign: campaignId,
            $or: [{ influencer: req.user._id }, { influencer: rateeId }],
            status: 'accepted',
        });

        if (!application) {
            return res.status(400).json({ success: false, message: 'You can only rate after a completed campaign' });
        }
        if (rateeId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot rate yourself' });
        }

        const rating = await Rating.create({
            campaign: campaignId, rater: req.user._id, ratee: rateeId,
            communication, timeliness, professionalism, review,
        });

        const allRatings = await Rating.aggregate([
            { $match: { ratee: rating.ratee } },
            { $group: { _id: null, avgC: { $avg: '$communication' }, avgT: { $avg: '$timeliness' }, avgP: { $avg: '$professionalism' }, avgO: { $avg: '$overallScore' }, count: { $sum: 1 } } },
        ]);

        if (allRatings[0]) {
            const ratee = await User.findById(rateeId);
            const rd = { average: +allRatings[0].avgO.toFixed(1), count: allRatings[0].count, communication: +allRatings[0].avgC.toFixed(1), timeliness: +allRatings[0].avgT.toFixed(1), professionalism: +allRatings[0].avgP.toFixed(1) };
            if (ratee.role === 'influencer') {
                await InfluencerProfile.findOneAndUpdate({ user: rateeId }, { ratings: rd, searchRank: rd.average * rd.count });
            } else {
                await BrandProfile.findOneAndUpdate({ user: rateeId }, { ratings: rd });
            }
            if (rd.count >= 5 && rd.average >= 4.0) await User.findByIdAndUpdate(rateeId, { trustBadge: true });
        }

        res.status(201).json({ success: true, message: 'Rating submitted', data: rating });
    } catch (error) { next(error); }
};

const getUserRatings = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const mongoose = require('mongoose');
        const [ratings, total] = await Promise.all([
            Rating.find({ ratee: req.params.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('rater', 'name avatar').populate('campaign', 'title'),
            Rating.countDocuments({ ratee: req.params.userId }),
        ]);
        const stats = await Rating.aggregate([
            { $match: { ratee: new mongoose.Types.ObjectId(req.params.userId) } },
            { $group: { _id: null, avgC: { $avg: '$communication' }, avgT: { $avg: '$timeliness' }, avgP: { $avg: '$professionalism' }, avgO: { $avg: '$overallScore' }, total: { $sum: 1 } } },
        ]);
        res.json({ success: true, data: { ratings, stats: stats[0] || null }, pagination: paginationMeta(total, page, limit) });
    } catch (error) { next(error); }
};

module.exports = { rateCampaign, getUserRatings };
