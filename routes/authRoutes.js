const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, refreshToken, requestPasswordChangeOtp, verifyOtpAndChangePassword, verifyFirebasePhoneAndChangePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const passport = require('passport');
const generateToken = require('../utils/generateToken');

// Helper for OAuth callbacks
const handleOAuthCallback = (req, res) => {
  try {
    // Passport puts the authenticated user in req.user
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || 'https://stranddsf.vercel.app'}/login?error=auth_failed`);
    }
    const tokens = generateToken(res, req.user._id);
    const accessToken = tokens ? tokens.accessToken : '';
    res.redirect(`${process.env.CLIENT_URL || 'https://stranddsf.vercel.app'}/?token=${accessToken}`);
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    res.redirect(`${process.env.CLIENT_URL || 'https://stranddsf.vercel.app'}/login?error=auth_callback_crashed`);
  }
};
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/profile', protect, getMe);
router.post('/request-otp', protect, requestPasswordChangeOtp);
router.post('/verify-otp', protect, verifyOtpAndChangePassword);
router.post('/verify-firebase-phone', protect, verifyFirebasePhoneAndChangePassword);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), handleOAuthCallback);

// Facebook OAuth Routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login' }), handleOAuthCallback);

module.exports = router;
