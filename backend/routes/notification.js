const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.use(protect);
router.get('/', ctrl.getNotifications);
router.put('/:id/read', ctrl.markAsRead);
router.put('/read-all', ctrl.markAllRead);

module.exports = router;
