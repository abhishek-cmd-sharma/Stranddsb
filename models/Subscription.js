const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    frequency: {
      type: String,
      enum: ['Every 30 Days', 'Every 60 Days'],
      default: 'Every 30 Days',
    },
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Cancelled'],
      default: 'Active',
    },
    nextDeliveryDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
