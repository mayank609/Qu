const InfluencerProfile = require('../models/InfluencerProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');

const Rating = require('../models/Rating');

/**
 * @desc    Analyze influencer profile for anomalies
 * PRD: Fake follower detection, Engagement spike anomaly, Repeated low ratings
 */
const detectProfileAnomaly = async (profile) => {
    let anomalies = [];

    // 1. Fake Follower Ratio: Extremely high followers but very low engagement
    if (profile.totalFollowers > 10000 && profile.engagementRate < 0.1) {
        anomalies.push('suspiciously_low_engagement');
    }

    // 2. Repeated Low Ratings (CRITICAL for OLX model)
    const lowRatingsCount = await Rating.countDocuments({
        ratee: profile.user,
        overallScore: { $lt: 2.5 }
    });
    
    if (lowRatingsCount >= 3) {
        anomalies.push('repeated_low_ratings');
    }

    // 3. Engagement Spike Anomaly: Unusually high engagement for fake profiles
    if (profile.engagementRate > 20 && profile.totalFollowers > 1000) {
        anomalies.push('engagement_spike_anomaly');
    }

    // 4. Incomplete platform data with high followers
    const platforms = ['instagram', 'youtube', 'linkedin'];
    platforms.forEach(p => {
        if (profile.platforms[p]?.connected && !profile.platforms[p]?.handle) {
            anomalies.push(`${p}_missing_handle`);
        }
    });

    return anomalies;
};

// @desc    Run automated fraud check on all profiles (Admin action)
// @route   POST /api/fraud/verify-all
const runGlobalFraudCheck = async (req, res, next) => {
    try {
        const profiles = await InfluencerProfile.find().populate('user');
        let flaggedCount = 0;

        for (const profile of profiles) {
            const anomalies = await detectProfileAnomaly(profile);

            if (anomalies.length > 0) {
                // Update user verification status to 'flagged' if not already
                if (profile.user && profile.user.verificationStatus !== 'flagged') {
                    await User.findByIdAndUpdate(profile.user._id, {
                        verificationStatus: 'flagged'
                    });

                    // Notify user
                    await Notification.create({
                        user: profile.user._id,
                        type: 'system_alert',
                        title: 'Profile Under Review',
                        message: 'Our system detected an anomaly in your profile engagement. Your verification status is temporarily flagged.',
                        link: '/profile'
                    });
                    flaggedCount++;
                }
            }
        }

        res.json({
            success: true,
            message: `Global fraud check completed. ${flaggedCount} profiles flagged.`,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    detectProfileAnomaly,
    runGlobalFraudCheck
};
