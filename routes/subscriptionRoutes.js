const express = require('express');
const router = express.Router();
const { createSubscription, getMySubscriptions, updateSubscriptionStatus } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createSubscription);
router.get('/my', protect, getMySubscriptions);
router.put('/:id', protect, updateSubscriptionStatus);

module.exports = router;
