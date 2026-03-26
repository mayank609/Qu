const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/ratingController');

router.use(protect);
router.post('/:campaignId', ctrl.rateCampaign);
router.get('/user/:userId', ctrl.getUserRatings);

module.exports = router;
