const asyncHandler = require('../utils/asyncHandler');
const Subscriber = require('../models/Subscriber');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  // Check if already subscribed
  const existingSubscriber = await Subscriber.findOne({ email });

  if (existingSubscriber) {
    if (!existingSubscriber.isActive) {
      existingSubscriber.isActive = true;
      await existingSubscriber.save();
      return res.status(200).json({ success: true, message: 'Re-subscribed successfully!' });
    }
    // Already subscribed and active, just return success
    return res.status(200).json({ success: true, message: 'You are already subscribed!' });
  }

  const subscriber = await Subscriber.create({
    email,
  });

  if (subscriber) {
    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to the newsletter!',
    });
  } else {
    res.status(400);
    throw new Error('Invalid subscriber data');
  }
});

// @desc    Get all active subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, count: subscribers.length, subscribers });
});

// @desc    Unsubscribe from newsletter
// @route   DELETE /api/newsletter/unsubscribe
// @access  Public
const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  const subscriber = await Subscriber.findOne({ email });

  if (subscriber) {
    subscriber.isActive = false;
    await subscriber.save();
    res.json({ success: true, message: 'Successfully unsubscribed.' });
  } else {
    res.status(404);
    throw new Error('Subscriber not found');
  }
});

module.exports = {
  subscribe,
  getSubscribers,
  unsubscribe,
};
