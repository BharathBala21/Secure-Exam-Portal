const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOTP, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.get('/profile', protect, getUserProfile);

module.exports = router;
