const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const ctrl = require('../controllers/applicationController');

router.use(protect);
router.post('/:campaignId', roleGuard('influencer'), ctrl.applyToCampaign);
router.get('/my', roleGuard('influencer'), ctrl.getMyApplications);
router.get('/all', roleGuard('brand'), ctrl.getAllBrandApplications);
router.get('/campaign/:campaignId', roleGuard('brand'), ctrl.getCampaignApplications);
router.put('/:id/status', roleGuard('brand'), ctrl.updateApplicationStatus);
router.put('/:id/deliverable', roleGuard('influencer'), ctrl.uploadDeliverable);
router.get('/:id/contract', ctrl.getContract);

module.exports = router;
