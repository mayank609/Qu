const router = require('express').Router();
const ctrl = require('../controllers/searchController');

router.get('/influencers', ctrl.searchInfluencers);
router.get('/campaigns', ctrl.searchCampaigns);

module.exports = router;
