const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, default: '' },
        quantity: { type: Number, required: true },
        size: { type: String, default: '' },
        isSubscription: { type: Boolean, default: false },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true, default: 'COD' },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    subtotal: { type: Number, required: true, default: 0 },
    shipping: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

orderSchema.virtual('isPaid')
  .get(function () {
    return this.paymentStatus === 'Paid';
  })
  .set(function (val) {
    this.paymentStatus = val ? 'Paid' : 'Pending';
  });

orderSchema.virtual('isDelivered')
  .get(function () {
    return this.orderStatus === 'Delivered';
  })
  .set(function (val) {
    this.orderStatus = val ? 'Delivered' : 'Processing';
  });

module.exports = mongoose.model('Order', orderSchema);
