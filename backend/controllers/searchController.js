const InfluencerProfile = require('../models/InfluencerProfile');
const Campaign = require('../models/Campaign');
const { getPagination, paginationMeta, buildSort } = require('../utils/helpers');

const searchInfluencers = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { minFollowers, maxFollowers, country, minEngagement, maxEngagement, niche, category, verified, sort: sortQuery, search } = req.query;
        const filter = {};
        if (minFollowers || maxFollowers) {
            filter.totalFollowers = {};
            if (minFollowers) filter.totalFollowers.$gte = parseInt(minFollowers);
            if (maxFollowers) filter.totalFollowers.$lte = parseInt(maxFollowers);
        }
        if (country) filter['location.country'] = { $regex: country, $options: 'i' };
        if (minEngagement || maxEngagement) {
            filter.engagementRate = {};
            if (minEngagement) filter.engagementRate.$gte = parseFloat(minEngagement);
            if (maxEngagement) filter.engagementRate.$lte = parseFloat(maxEngagement);
        }
        if (niche) filter.niche = { $regex: niche, $options: 'i' };
        if (category) filter.categories = category;
        if (search) filter.bio = { $regex: search, $options: 'i' };

        let userFilter = {};
        if (verified === 'true') userFilter = { trustBadge: true };

        // Improved ranking: verified first, then by average rating, then by total followers
        const sort = buildSort(sortQuery, {
            'user.trustBadge': -1,
            'ratings.average': -1,
            'totalFollowers': -1
        });

        const [profiles, total] = await Promise.all([
            InfluencerProfile.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'user',
                    select: 'name avatar trustBadge verificationStatus',
                    match: verified === 'true' ? { trustBadge: true } : {}
                }),
            InfluencerProfile.countDocuments(filter),
        ]);

        const filtered = profiles.filter(p => p.user);

        res.json({
            success: true,
            data: filtered,
            pagination: paginationMeta(total, page, limit)
        });
    } catch (error) { next(error); }
};

const searchCampaigns = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { category, platform, minBudget, maxBudget, country, urgency, search, sort: sortQuery } = req.query;
        const filter = { status: 'active' };
        if (category) filter.category = category;
        if (platform) filter.platform = platform;
        if (urgency) filter.urgency = urgency;
        if (country) filter['location.country'] = { $regex: country, $options: 'i' };
        if (minBudget || maxBudget) {
            if (minBudget) filter['budgetRange.max'] = { $gte: parseInt(minBudget) };
            if (maxBudget) filter['budgetRange.min'] = { $lte: parseInt(maxBudget) };
        }
        if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
        const sort = buildSort(sortQuery);
        const [campaigns, total] = await Promise.all([
            Campaign.find(filter).sort(sort).skip(skip).limit(limit).populate('brand', 'name avatar trustBadge'),
            Campaign.countDocuments(filter),
        ]);
        res.json({ success: true, data: campaigns, pagination: paginationMeta(total, page, limit) });
    } catch (error) { next(error); }
};

module.exports = { searchInfluencers, searchCampaigns };
