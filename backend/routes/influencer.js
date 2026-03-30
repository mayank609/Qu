const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const ctrl = require('../controllers/influencerController');

router.use(protect, roleGuard('influencer'));
router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.put('/connect-platform', ctrl.connectPlatform);
router.get('/dashboard', ctrl.getDashboard);
router.get('/analytics', ctrl.getAnalytics);
router.get('/earnings', ctrl.getEarnings);

// Get influencer by ID (public/brand view) - MUST BE AT BOTTOM
router.get('/:id', protect, ctrl.getInfluencerById);

module.exports = router;
