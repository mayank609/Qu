const InfluencerProfile = require('../models/InfluencerProfile');
const Campaign = require('../models/Campaign');
const { getPagination, paginationMeta, buildSort, escapeRegex } = require('../utils/helpers');

/** UI platform filter → campaign.platform[] enum values stored in DB */
const CAMPAIGN_PLATFORM_GROUPS = {
    instagram: ['instagram_reel', 'instagram_story', 'instagram_post'],
    youtube: ['youtube_video', 'youtube_short'],
    facebook: ['facebook_post'],
    tiktok: ['tiktok_video'],
    linkedin: ['linkedin_post'],
    twitter: ['twitter_post'],
    x: ['twitter_post'],
    snapchat: ['snapchat_spotlight'],
};

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
            const p = platform.toLowerCase();
            matchStage.$or = [
                { [`platforms.${p}.connected`]: true },
                { [`platforms.${p}.followers`]: { $gt: 0 } },
                { [`platforms.${p}.handle`]: { $ne: '' } }
            ];
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
        const {
            category,
            platform,
            minBudget,
            maxBudget,
            country,
            location: locationQuery,
            urgency,
            search,
            sort: sortQuery,
        } = req.query;

        let matchStage = { status: 'active' };
        if (category && category !== 'all') {
            const c = String(category).trim();
            matchStage.category = { $regex: `^${escapeRegex(c)}$`, $options: 'i' };
        }
        if (platform && platform !== 'all') {
            const p = String(platform).toLowerCase().trim();
            const variants = CAMPAIGN_PLATFORM_GROUPS[p];
            matchStage.platform = variants?.length
                ? { $in: variants }
                : { $in: [p] };
        }
        if (urgency && urgency !== 'all') matchStage.urgency = urgency;
        if (country && String(country).trim()) {
            const safe = escapeRegex(String(country).trim());
            matchStage['location.country'] = { $regex: safe, $options: 'i' };
        }

        if (minBudget || maxBudget) {
            matchStage['budgetRange.min'] = {};
            matchStage['budgetRange.max'] = {};
            if (minBudget) matchStage['budgetRange.max'].$gte = parseInt(minBudget);
            if (maxBudget) matchStage['budgetRange.min'].$lte = parseInt(maxBudget);
        }

        const pipeline = [{ $match: matchStage }];

        if (locationQuery && String(locationQuery).trim()) {
            const safe = escapeRegex(String(locationQuery).trim());
            pipeline.push({
                $match: {
                    $or: [
                        { 'location.city': { $regex: safe, $options: 'i' } },
                        { 'location.country': { $regex: safe, $options: 'i' } },
                    ],
                },
            });
        }

        pipeline.push(
            {
                $lookup: {
                    from: 'users',
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brandData',
                },
            },
            { $unwind: '$brandData' },
            {
                $lookup: {
                    from: 'brandprofiles',
                    localField: 'brand',
                    foreignField: 'user',
                    as: 'brandProfileData',
                },
            },
            { $unwind: { path: '$brandProfileData', preserveNullAndEmptyArrays: true } }
        );

        if (search && String(search).trim()) {
            const safe = escapeRegex(String(search).trim());
            pipeline.push({
                $match: {
                    $or: [
                        { title: { $regex: safe, $options: 'i' } },
                        { description: { $regex: safe, $options: 'i' } },
                        { 'brandData.name': { $regex: safe, $options: 'i' } },
                        { 'location.city': { $regex: safe, $options: 'i' } },
                        { 'location.country': { $regex: safe, $options: 'i' } },
                        { 'deliverables.description': { $regex: safe, $options: 'i' } },
                        { 'deliverables.type': { $regex: safe, $options: 'i' } },
                        { 'brandProfileData.description': { $regex: safe, $options: 'i' } },
                    ],
                },
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
        const campaigns = results[0].data.map((c) => {
            const { brandData, brandProfileData, ...campaign } = c;
            return {
                ...campaign,
                brand: {
                    _id: brandData._id,
                    name: brandData.name,
                    avatar: brandData.avatar,
                    trustBadge: brandData.trustBadge,
                    description: brandProfileData?.description || '',
                },
            };
        });

        res.json({
            success: true,
            data: campaigns,
            pagination: paginationMeta(total, page, limit)
        });
    } catch (error) { next(error); }
};

module.exports = { searchInfluencers, searchCampaigns };
