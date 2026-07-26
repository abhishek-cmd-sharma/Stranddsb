const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development');

// @desc    Create Payment Intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  const { amount, currency = 'inr', orderId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in smallest currency unit (paise/cents)
      currency,
      metadata: { orderId },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        try {
          const order = await Order.findById(orderId).populate('user', 'name email');
          if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
              id: paymentIntent.id,
              status: paymentIntent.status,
              update_time: paymentIntent.created,
              email_address: order.user?.email,
            };
            await order.save();

            // Send Confirmation Email
            if (order.user?.email) {
              await sendEmail({
                email: order.user.email,
                subject: 'Strandds Hair Cosmetics - Order Confirmed',
                message: `Hi ${order.user.name},\n\nYour order (${order._id}) has been confirmed!\nTotal: ₹${order.totalPrice.toFixed(2)}\n\nThank you for shopping with Strandds!`,
              });
            }
          }
        } catch (error) {
          console.error('Error updating order on webhook:', error);
        }
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
