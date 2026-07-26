const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});
  res.json({ success: true, coupons });
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, expiryDate, usageLimit, perUserLimit } = req.body;
  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    expiryDate,
    usageLimit: usageLimit || null,
    perUserLimit: perUserLimit || 1
  });

  res.status(201).json({ success: true, coupon });
});

// @desc    Toggle coupon status
// @route   PUT /api/coupons/:id/toggle
// @access  Private/Admin
const toggleCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  res.json({ success: true, coupon });
});

// @desc    Validate a coupon code
// @route   GET /api/coupons/validate/:code
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
  const code = req.params.code.toUpperCase();
  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isActive) {
    res.status(400);
    throw new Error('This coupon is no longer active');
  }

  if (new Date() > new Date(coupon.expiryDate)) {
    res.status(400);
    throw new Error('This coupon has expired');
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('This coupon has reached its usage limit');
  }

  // Check per-user limit if user is logged in (using optional protect middleware)
  if (req.user) {
    const userUsage = coupon.usedBy.find(u => u.user.toString() === req.user._id.toString());
    if (userUsage && userUsage.count >= coupon.perUserLimit) {
      res.status(400);
      throw new Error(`You have already used this coupon ${userUsage.count} time(s).`);
    }
  }

  res.json({
    success: true,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    code: coupon.code
  });
});

module.exports = { getCoupons, createCoupon, toggleCouponStatus, validateCoupon };
