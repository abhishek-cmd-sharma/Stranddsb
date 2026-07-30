const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, refreshToken, requestPasswordChangeOtp, verifyOtpAndChangePassword, verifyFirebasePhoneAndChangePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules } = require('../validators/authValidator');
const validate = require('../middleware/validate');

const generateToken = require('../utils/generateToken');


router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/profile', protect, getMe);
router.post('/request-otp', protect, requestPasswordChangeOtp);
router.post('/verify-otp', protect, verifyOtpAndChangePassword);
router.post('/verify-firebase-phone', protect, verifyFirebasePhoneAndChangePassword);



module.exports = router;
