const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const adminCtrl = require('../controllers/adminController');
const fraudCtrl = require('../controllers/fraudController');

// All admin routes are protected
router.use(protect, roleGuard('admin'));

router.get('/stats', adminCtrl.getPlatformStats);
router.get('/flagged-profiles', adminCtrl.getFlaggedProfiles);
router.get('/users', adminCtrl.getUsers);
router.get('/users/:userId', adminCtrl.getUserById);
router.put('/verify-user/:userId', adminCtrl.verifyUser);
router.post('/fraud/verify-all', fraudCtrl.runGlobalFraudCheck);

module.exports = router;
