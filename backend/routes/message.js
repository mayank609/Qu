const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/messageController');

router.use(protect);
router.post('/conversation', ctrl.startConversation);
router.get('/conversations', ctrl.getConversations);
router.post('/:conversationId', ctrl.sendMessage);
router.get('/:conversationId', ctrl.getMessages);

module.exports = router;
