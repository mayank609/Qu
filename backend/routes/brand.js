const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const ctrl = require('../controllers/brandController');

router.use(protect, roleGuard('brand'));
router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.get('/dashboard', ctrl.getDashboard);
router.post('/invite/:influencerId', ctrl.inviteInfluencer);

module.exports = router;
