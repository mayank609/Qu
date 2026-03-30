const InfluencerProfile = require('../models/InfluencerProfile');
const Campaign = require('../models/Campaign');
const { getPagination, paginationMeta, buildSort } = require('../utils/helpers');

const searchInfluencers = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { minFollowers, maxFollowers, country, niche, category, verified, sort: sortQuery, search, minPrice, maxPrice, platform } = req.query;
        
        let matchStage = {};
        
        // Follower filter
        if (minFollowers || maxFollowers) {
            matchStage.totalFollowers = {};
            if (minFollowers) matchStage.totalFollowers.$gte = parseInt(minFollowers);
            if (maxFollowers) matchStage.totalFollowers.$lte = parseInt(maxFollowers);
        }
        
        // Location filter
        if (country) matchStage['location.country'] = { $regex: country, $options: 'i' };
        
        // Niche/Category filter
        if (niche) matchStage.niche = { $regex: niche, $options: 'i' };
        if (category) matchStage.categories = category;
        
        // Price filter
        if (minPrice || maxPrice) {
            if (minPrice) matchStage['priceExpectation.max'] = { $gte: parseInt(minPrice) };
            if (maxPrice) matchStage['priceExpectation.min'] = { $lte: parseInt(maxPrice) };
        }

        // Platform filter
        if (platform && platform !== 'all') {
            matchStage[`platforms.${platform.toLowerCase()}.connected`] = true;
        }

        // Base aggregation pipeline
        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userData'
                }
            },
            { $unwind: '$userData' }
        ];

        // Search across profile AND user fields
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'userData.name': { $regex: search, $options: 'i' } },
                        { bio: { $regex: search, $options: 'i' } },
                        { niche: { $regex: search, $options: 'i' } },
                        { categories: { $in: [new RegExp(search, 'i')] } }
                    ]
                }
            });
        }

        // Verification filter
        if (verified === 'true') {
            pipeline.push({ $match: { 'userData.trustBadge': true } });
        }

        // Sorting
        const sort = buildSort(sortQuery, {
            'userData.trustBadge': -1,
            'ratings.average': -1,
            'totalFollowers': -1
        });
        pipeline.push({ $sort: sort });

        // Facet for pagination and count
        pipeline.push({
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [{ $skip: skip }, { $limit: limit }]
            }
        });

        const results = await InfluencerProfile.aggregate(pipeline);
        
        const total = results[0].metadata[0]?.total || 0;
        const profiles = results[0].data.map(p => ({
            ...p,
            user: {
                _id: p.userData._id,
                name: p.userData.name,
                avatar: p.userData.avatar,
                trustBadge: p.userData.trustBadge,
                verificationStatus: p.userData.verificationStatus
            }
        }));

        res.json({
            success: true,
            data: profiles,
            pagination: paginationMeta(total, page, limit)
        });
    } catch (error) { next(error); }
};

const searchCampaigns = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { category, platform, minBudget, maxBudget, country, urgency, search, sort: sortQuery } = req.query;
        
        let matchStage = { status: 'active' };
        if (category) matchStage.category = category;
        if (platform) matchStage.platform = platform;
        if (urgency) matchStage.urgency = urgency;
        if (country) matchStage['location.country'] = { $regex: country, $options: 'i' };
        
        if (minBudget || maxBudget) {
            matchStage['budgetRange.min'] = {};
            matchStage['budgetRange.max'] = {};
            if (minBudget) matchStage['budgetRange.max'].$gte = parseInt(minBudget);
            if (maxBudget) matchStage['budgetRange.min'].$lte = parseInt(maxBudget);
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brandData'
                }
            },
            { $unwind: '$brandData' }
        ];

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                        { 'brandData.name': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        const sort = buildSort(sortQuery);
        pipeline.push({ $sort: sort });

        pipeline.push({
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [{ $skip: skip }, { $limit: limit }]
            }
        });

        const results = await Campaign.aggregate(pipeline);
        
        const total = results[0].metadata[0]?.total || 0;
        const campaigns = results[0].data.map(c => ({
            ...c,
            brand: {
                _id: c.brandData._id,
                name: c.brandData.name,
                avatar: c.brandData.avatar,
                trustBadge: c.brandData.trustBadge
            }
        }));

        res.json({
            success: true,
            data: campaigns,
            pagination: paginationMeta(total, page, limit)
        });
    } catch (error) { next(error); }
};

module.exports = { searchInfluencers, searchCampaigns };
