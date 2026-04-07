/**
 * Run: node scripts/createAdmin.js
 * Creates (or updates) an admin user in the database.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@qolinq.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email: ADMIN_EMAIL });
    if (user) {
        user.role = 'admin';
        user.password = ADMIN_PASSWORD;
        user.verificationStatus = 'verified';
        user.trustBadge = true;
        await user.save();
        console.log(`Updated existing user → admin: ${ADMIN_EMAIL}`);
    } else {
        await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
            verificationStatus: 'verified',
            trustBadge: true,
        });
        console.log(`Created admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    }

    await mongoose.disconnect();
    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
