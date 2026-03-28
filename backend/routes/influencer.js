const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const ctrl = require('../controllers/influencerController');

router.get('/:id', protect, ctrl.getInfluencerById);

router.use(protect, roleGuard('influencer'));
router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.put('/connect-platform', ctrl.connectPlatform);
router.get('/dashboard', ctrl.getDashboard);
router.get('/analytics', ctrl.getAnalytics);
router.get('/earnings', ctrl.getEarnings);

module.exports = router;
