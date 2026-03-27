const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { register, login, getMe, switchRole, googleLogin } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/switch-role', protect, switchRole);

module.exports = router;
