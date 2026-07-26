const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const admin = require('../config/firebase-admin');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({ name, email, password });

  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Strandds Hair Cosmetics',
      message: `Hi ${user.name},\n\nWelcome to Strandds! We're thrilled to have you. Explore our Ayurvedic hair formulations today.\n\nBest,\nThe Strandds Team`,
    });
  } catch (err) {
    console.error('Email could not be sent', err);
  }

  const { accessToken } = generateToken(res, user._id);

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    token: accessToken,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const { accessToken } = generateToken(res, user._id);

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    token: accessToken,
  });
});

// @desc    Logout user (clear cookie)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie('jwt_refresh', '', {
    httpOnly: true,
    path: '/api/auth/refresh',
    expires: new Date(0),
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.jwt_refresh;
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no refresh token');
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    const { accessToken } = generateToken(res, user._id);
    res.json({ success: true, token: accessToken });
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, invalid refresh token');
  }
});

// @desc    Request OTP for password change
// @route   POST /api/auth/request-otp
// @access  Private
const requestPasswordChangeOtp = asyncHandler(async (req, res) => {
  const { deliveryMethod } = req.body; // 'email' or 'phone'
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const salt = await bcrypt.genSalt(10);
  user.resetOtp = await bcrypt.hash(otp, salt);
  user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  if (deliveryMethod === 'email') {
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Change OTP',
        message: `Your OTP for changing your password is: ${otp}\n\nIt is valid for 10 minutes.`,
      });
      // Also log it for development purposes
      console.log(`\n\n[MOCK EMAIL] OTP for user ${user.email}: ${otp}\n\n`);
    } catch (err) {
      console.error('Email could not be sent', err);
      // Fallback for development if SMTP fails
      console.log(`\n\n[MOCK EMAIL FALLBACK] OTP for user ${user.email}: ${otp}\n\n`);
    }
  } else if (deliveryMethod === 'phone') {
    // Mocking SMS for development
    console.log(`\n\n[MOCK SMS] OTP for user ${user.email} (Phone: ${user.phone || 'N/A'}): ${otp}\n\n`);
  } else {
    res.status(400);
    throw new Error('Invalid delivery method');
  }

  res.json({ success: true, message: `OTP process initiated for ${deliveryMethod}. Check your email or console.` });
});

// @desc    Verify OTP and change password
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyOtpAndChangePassword = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password +resetOtp');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.resetOtp || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
    res.status(400);
    throw new Error('OTP is invalid or has expired');
  }

  const isMatch = await bcrypt.compare(otp, user.resetOtp);
  if (!isMatch) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;

  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

// @desc    Verify Firebase phone auth and change password
// @route   POST /api/auth/verify-firebase-phone
// @access  Private
const verifyFirebasePhoneAndChangePassword = asyncHandler(async (req, res) => {
  const { firebaseIdToken, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
    const phoneNumber = decodedToken.phone_number; // e.g. "+919876543210"

    // Optional: You can enforce that the phone number matches the user's stored phone number
    // However, they might be formatting it differently. We will assume success if the token is valid,
    // or you can add strict validation here.
    if (!phoneNumber) {
      res.status(400);
      throw new Error('No phone number found in Firebase token');
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully via Phone Auth' });
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    res.status(401);
    throw new Error('Invalid or expired phone verification token');
  }
});

module.exports = { register, login, logout, getMe, refreshToken, requestPasswordChangeOtp, verifyOtpAndChangePassword, verifyFirebasePhoneAndChangePassword };
