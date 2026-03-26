// Fraud detection utilities

/**
 * Check for fake followers — abnormal follower-to-engagement ratio
 * Real accounts typically have 1-5% engagement rate
 * Micro influencers (< 10k) can have higher engagement rates (5-10%)
 */
const checkFakeFollowers = (profile) => {
    const alerts = [];

    if (profile.platforms?.instagram?.connected) {
        const ig = profile.platforms.instagram;
        if (ig.followers > 10000 && ig.engagementRate < 0.5) {
            alerts.push({
                type: 'fake_followers',
                platform: 'instagram',
                severity: 'high',
                message: `Suspiciously low engagement rate (${ig.engagementRate}%) for ${ig.followers} followers`,
                details: {
                    followers: ig.followers,
                    engagementRate: ig.engagementRate,
                    expectedMin: 1.0,
                },
            });
        }

        // Unusually high follower count with near-zero comments
        if (ig.followers > 5000 && ig.avgComments < 5) {
            alerts.push({
                type: 'fake_followers',
                platform: 'instagram',
                severity: 'medium',
                message: `Very low average comments (${ig.avgComments}) for ${ig.followers} followers`,
            });
        }
    }

    return alerts;
};

/**
 * Check for engagement spike anomalies
 * Detect sudden, unnatural engagement increases
 */
const checkEngagementSpike = (currentStats, previousStats) => {
    const alerts = [];

    if (!previousStats) return alerts;

    // 300% spike in engagement is suspicious
    if (
        previousStats.engagementRate > 0 &&
        currentStats.engagementRate / previousStats.engagementRate > 3
    ) {
        alerts.push({
            type: 'engagement_spike',
            severity: 'medium',
            message: `Engagement rate spiked from ${previousStats.engagementRate}% to ${currentStats.engagementRate}%`,
            details: {
                previous: previousStats.engagementRate,
                current: currentStats.engagementRate,
                multiplier: (
                    currentStats.engagementRate / previousStats.engagementRate
                ).toFixed(1),
            },
        });
    }

    // 500% spike in followers
    if (
        previousStats.followers > 0 &&
        currentStats.followers / previousStats.followers > 5
    ) {
        alerts.push({
            type: 'follower_spike',
            severity: 'high',
            message: `Follower count spiked from ${previousStats.followers} to ${currentStats.followers}`,
        });
    }

    return alerts;
};

/**
 * Check for repeated low ratings
 * Flag users who consistently receive poor ratings
 */
const checkRepeatedLowRatings = (ratings) => {
    const alerts = [];

    if (ratings.count >= 3 && ratings.average < 2.0) {
        alerts.push({
            type: 'low_ratings',
            severity: 'high',
            message: `User has an average rating of ${ratings.average} across ${ratings.count} campaigns`,
            details: {
                average: ratings.average,
                count: ratings.count,
            },
        });
    }

    if (ratings.count >= 5 && ratings.average < 2.5) {
        alerts.push({
            type: 'low_ratings',
            severity: 'medium',
            message: `Consistently below-average ratings (${ratings.average}/5 across ${ratings.count} reviews)`,
        });
    }

    return alerts;
};

/**
 * Run all fraud checks on a profile
 */
const runFraudChecks = (profile, previousStats = null) => {
    const allAlerts = [
        ...checkFakeFollowers(profile),
        ...checkEngagementSpike(
            {
                engagementRate: profile.engagementRate,
                followers: profile.totalFollowers,
            },
            previousStats
        ),
        ...checkRepeatedLowRatings(profile.ratings || { count: 0, average: 0 }),
    ];

    return {
        hasAlerts: allAlerts.length > 0,
        alertCount: allAlerts.length,
        highSeverity: allAlerts.filter((a) => a.severity === 'high').length,
        alerts: allAlerts,
    };
};

module.exports = {
    checkFakeFollowers,
    checkEngagementSpike,
    checkRepeatedLowRatings,
    runFraudChecks,
};
