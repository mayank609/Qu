const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const ctrl = require('../controllers/influencerController');

// Private influencer routes (Requires 'influencer' role)
// These MUST go first to avoid conflict with /:id
router.get('/profile', protect, roleGuard('influencer'), ctrl.getProfile);
router.put('/profile', protect, roleGuard('influencer'), ctrl.updateProfile);
router.put('/connect-platform', protect, roleGuard('influencer'), ctrl.connectPlatform);
router.get('/dashboard', protect, roleGuard('influencer'), ctrl.getDashboard);
router.get('/analytics', protect, roleGuard('influencer'), ctrl.getAnalytics);
router.get('/earnings', protect, roleGuard('influencer'), ctrl.getEarnings);

// Public/Brand can view influencer profiles
// MUST be below static routes to avoid naming conflict
router.get('/:id', protect, ctrl.getInfluencerById);

module.exports = router;
