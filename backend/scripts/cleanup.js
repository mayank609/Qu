const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import all models
const User = require('../models/User');
const InfluencerProfile = require('../models/InfluencerProfile');
const BrandProfile = require('../models/BrandProfile');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Escrow = require('../models/Escrow');
const Notification = require('../models/Notification');
dotenv.config();

const cleanup = async () => {
    try {
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const models = [
            { name: 'User', model: User },
            { name: 'InfluencerProfile', model: InfluencerProfile },
            { name: 'BrandProfile', model: BrandProfile },
            { name: 'Campaign', model: Campaign },
            { name: 'Application', model: Application },
            { name: 'Conversation', model: Conversation },
            { name: 'Message', model: Message },
            { name: 'Escrow', model: Escrow },
            { name: 'Notification', model: Notification },
        ];

        console.log('🧹 Starting cleanup...');

        for (const { name, model } of models) {
            const count = await model.countDocuments();
            await model.deleteMany({});
            console.log(`🗑️  Cleared ${count} documents from ${name}`);
        }

        console.log('\n✨ Database cleaned successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Cleanup failed:', err);
        process.exit(1);
    }
};

cleanup();
