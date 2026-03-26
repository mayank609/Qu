const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const ctrl = require('../controllers/campaignController');

// Public
router.get('/', ctrl.getCampaigns);
router.get('/:id', ctrl.getCampaign);

// Protected - brand only
router.post('/', protect, roleGuard('brand'), ctrl.createCampaign);
router.put('/:id', protect, roleGuard('brand'), ctrl.updateCampaign);
router.delete('/:id', protect, roleGuard('brand'), ctrl.deleteCampaign);
router.get('/brand/my', protect, roleGuard('brand'), ctrl.getMyCampaigns);

module.exports = router;
