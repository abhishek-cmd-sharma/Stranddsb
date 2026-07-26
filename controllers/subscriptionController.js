const Subscription = require('../models/Subscription');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = asyncHandler(async (req, res) => {
  const { productId, frequency, quantity } = req.body;

  const nextDeliveryDate = new Date();
  nextDeliveryDate.setDate(nextDeliveryDate.getDate() + (frequency === 'Every 60 Days' ? 60 : 30));

  const subscription = await Subscription.create({
    user: req.user._id,
    product: productId,
    frequency,
    quantity,
    nextDeliveryDate
  });

  res.status(201).json({
    success: true,
    subscription,
    message: 'Subscription activated successfully!'
  });
});

// @desc    Get user subscriptions
// @route   GET /api/subscriptions/my
// @access  Private
const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user._id })
    .populate('product', 'name primaryImage price')
    .sort({ nextDeliveryDate: 1 });
  
  res.json({ success: true, subscriptions });
});

// @desc    Update subscription status
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscriptionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const subscription = await Subscription.findById(req.params.id);

  if (subscription) {
    if (subscription.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to update this subscription');
    }

    subscription.status = status;
    const updatedSub = await subscription.save();

    res.json({ success: true, subscription: updatedSub });
  } else {
    res.status(404);
    throw new Error('Subscription not found');
  }
});

module.exports = {
  createSubscription,
  getMySubscriptions,
  updateSubscriptionStatus
};
