const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, toggleCouponStatus, validateCoupon } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route('/:id/toggle').put(protect, admin, toggleCouponStatus);
router.route('/validate/:code').get(protect, validateCoupon);

module.exports = router;
