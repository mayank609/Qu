const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const InfluencerProfile = require('../models/InfluencerProfile');
const BrandProfile = require('../models/BrandProfile');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

dotenv.config();

const clearDB = async () => {
    await User.deleteMany({});
    await InfluencerProfile.deleteMany({});
    await BrandProfile.deleteMany({});
    await Campaign.deleteMany({});
    await Application.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    console.log('🗑️ Database cleared');
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📡 Connected to MongoDB');

        await clearDB();

        // ─── Create Influencers ───
        const influencers = [
            { name: 'Sarah Fashion', email: 'sarah@influencer.com', role: 'influencer' },
            { name: 'Mike Tech', email: 'mike@influencer.com', role: 'influencer' },
            { name: 'Influencer Demo', email: 'influencer@example.com', role: 'influencer' }
        ];

        const savedInfluencers = [];
        const validCategories = ['fitness', 'tech', 'fashion', 'beauty', 'food', 'travel', 'lifestyle', 'gaming', 'education', 'finance', 'health', 'entertainment', 'sports', 'music', 'art', 'photography', 'business', 'automotive', 'parenting', 'pets', 'other'];

        for (const i of influencers) {
            const user = await User.create({ ...i, password: 'password123', isVerified: true, verificationStatus: 'verified' });
            savedInfluencers.push(user);

            let cat = (i.name.split(' ')[1] || 'lifestyle').toLowerCase();
            if (!validCategories.includes(cat)) cat = 'lifestyle';

            await InfluencerProfile.create({
                user: user._id,
                bio: `Professional ${cat} influencer.`,
                categories: [cat],
                platforms: {
                    instagram: { handle: `@${i.name.split(' ')[0].toLowerCase()}_insta`, followers: 50000, connected: true },
                    youtube: { handle: `${i.name.split(' ')[0]} Channel`, subscribers: 100000, connected: true }
                },
                totalFollowers: 150000,
                location: { city: 'Mumbai', country: 'India' },
                priceExpectation: { min: 5000, max: 20000 }
            });
        }

        // ─── Create Brands ───
        const brands = [
            { name: 'Nike Marketplace', email: 'hello@nike.com', role: 'brand' },
            { name: 'Brand Demo', email: 'brand@example.com', role: 'brand' }
        ];

        const savedBrands = [];
        for (const b of brands) {
            const user = await User.create({ ...b, password: 'password123', isVerified: true, verificationStatus: 'verified' });
            savedBrands.push(user);

            await BrandProfile.create({
                user: user._id,
                companyName: b.name,
                website: `https://www.${b.name.split(' ')[0].toLowerCase()}.com`,
                category: b.name.includes('Nike') ? 'Fashion' : 'Tech',
                location: { city: 'Bangalore', country: 'India' }
            });
        }

        // ─── Create Campaigns ───
        const campaigns = [
            {
                brand: savedBrands[0]._id, // Nike
                title: 'Summer Collection Launch 2024',
                description: 'We are looking for fashion influencers to showcase our new summer sneaker collection.',
                platform: 'instagram_reel',
                budgetRange: { min: 40000, max: 80000 },
                timeline: { endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
                category: 'fashion',
                status: 'active'
            },
            {
                brand: savedBrands[1]._id, // Brand Demo (brand@example.com)
                title: 'Galaxy S24 Ultra Review',
                description: 'Seeking tech reviewers for the new Galaxy S24 Ultra. 1 long form video required.',
                platform: 'youtube_video',
                budgetRange: { min: 100000, max: 250000 },
                timeline: { endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
                category: 'tech',
                status: 'active'
            }
        ];

        for (const c of campaigns) {
            await Campaign.create(c);
        }

        console.log('✅ Seeding completed successfully');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seed();
