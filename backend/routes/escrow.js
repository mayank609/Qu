const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/escrowController');

router.use(protect);
router.post('/fund/:campaignId', ctrl.fundCampaign);
router.put('/release/:escrowId', ctrl.releasePayment);
router.put('/dispute/:escrowId', ctrl.raiseDispute);
router.get('/status/:campaignId', ctrl.getEscrowStatus);

module.exports = router;
