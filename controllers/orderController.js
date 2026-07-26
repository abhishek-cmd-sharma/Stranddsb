const Order = require('../models/Order');
const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require('pdfkit');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Place new order
// @route   POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, discountType, discountValue, couponCode } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  let subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  if (discountType && discountValue) {
    if (discountType === 'percentage' && discountValue > 0 && discountValue <= 100) {
      subtotal = subtotal - (subtotal * (discountValue / 100));
    } else if (discountType === 'flat' && discountValue > 0) {
      subtotal = Math.max(0, subtotal - discountValue);
    }
  }
  
  const shipping = subtotal > 50 ? 0 : 5;
  const total = subtotal + shipping;

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    subtotal,
    shipping,
    total,
  });

  let razorpayOrderId = null;
  if (paymentMethod === 'Online Payment (UPI / Cards)') {
    try {
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: Math.round(total * 100), // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: order._id.toString(),
      };

      const razorpayOrder = await instance.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
    } catch (error) {
      console.error('Razorpay Error:', error);
      res.status(500);
      throw new Error('Could not create Razorpay order');
    }
  }

  // Reduce stock of each ordered product
  for (const item of orderItems) {
    const Product = require('../models/Product');
    const product = await Product.findById(item.product);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }
  }

  // Clear user's cart after order
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // Update coupon usage if a coupon code was provided
  if (couponCode) {
    const Coupon = require('../models/Coupon');
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      coupon.usedCount += 1;
      const userUsage = coupon.usedBy.find(u => u.user.toString() === req.user._id.toString());
      if (userUsage) {
        userUsage.count += 1;
      } else {
        coupon.usedBy.push({ user: req.user._id, count: 1 });
      }
      await coupon.save();
    }
  }

  try {
    const user = req.user;
    await sendEmail({
      email: user.email,
      subject: `Order Confirmation - ${order._id}`,
      message: `Hi ${user.name},\n\nYour order has been placed successfully!\nOrder ID: ${order._id}\nTotal: ₹${order.total.toFixed(2)}\n\nThank you for shopping with Strandds.`,
    });
  } catch (error) {
    console.error('Failed to send order email', error);
  }

  res.status(201).json({
    success: true,
    order,
    razorpayOrderId
  });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('orderItems.product', 'name primaryImage')
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name primaryImage');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  // Ensure user can only see their own order (unless admin)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  if (req.body.orderStatus) {
    order.orderStatus = req.body.orderStatus;
    if (req.body.orderStatus === 'Delivered') {
      order.deliveredAt = Date.now();
    }
  }
  if (req.body.paymentStatus) {
    order.paymentStatus = req.body.paymentStatus;
    if (req.body.paymentStatus === 'Paid') {
      order.paidAt = Date.now();
    }
  }

  const updatedOrder = await order.save();
  const populated = await Order.findById(updatedOrder._id).populate('user', 'name email');
  res.json({ success: true, order: populated });
});

// @desc    Update order to delivered (admin)
// @route   PUT /api/orders/:id/deliver
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.orderStatus = 'Delivered';
  order.deliveredAt = Date.now();
  order.paymentStatus = 'Paid';
  order.paidAt = Date.now();

  const updatedOrder = await order.save();
  const populated = await Order.findById(updatedOrder._id).populate('user', 'name email');
  res.json(populated);
});

// @desc    Cancel order by user
// @route   PUT /api/orders/:id/cancel
const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  // Check if it belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (order.orderStatus !== 'Processing') {
    res.status(400);
    throw new Error(`Cannot cancel order in ${order.orderStatus} state`);
  }

  order.orderStatus = 'Cancelled';
  const updatedOrder = await order.save();
  res.json({ success: true, order: updatedOrder });
});

// @desc    Download Invoice (PDF format)
// @route   GET /api/orders/:id/invoice
const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name');

  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Strandds-Invoice-${order._id}.pdf`);

  doc.pipe(res);

  // Header
  doc.fillColor('#4A0E17').fontSize(24).text('Strandds', { align: 'left' });
  doc.fontSize(10).text('Ayurvedic Hair Cosmetics', { align: 'left' });
  
  doc.fontSize(16).text('INVOICE', { align: 'right', lineGap: 5 });
  doc.fontSize(10).text(`Order ID: ${order._id}`, { align: 'right' });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
  
  doc.moveTo(50, 120).lineTo(550, 120).strokeColor('#4A0E17').stroke();

  // Billed To
  doc.moveDown(4);
  doc.fontSize(12).font('Helvetica-Bold').text('Billed To:');
  doc.font('Helvetica').fontSize(10);
  doc.text(order.user.name);
  doc.text(order.user.email);
  doc.text(`${order.shippingAddress.address}, ${order.shippingAddress.city}`);
  doc.text(`${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`);

  doc.moveDown(3);

  // Table Header
  const tableTop = doc.y;
  doc.font('Helvetica-Bold');
  doc.text('Item', 50, tableTop);
  doc.text('Qty', 350, tableTop, { width: 50, align: 'right' });
  doc.text('Price', 400, tableTop, { width: 70, align: 'right' });
  doc.text('Total', 470, tableTop, { width: 80, align: 'right' });
  
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
  doc.font('Helvetica');
  
  let yPosition = tableTop + 25;

  order.orderItems.forEach(item => {
    doc.text(item.name || 'Unknown Product', 50, yPosition, { width: 280 });
    doc.text(item.quantity.toString(), 350, yPosition, { width: 50, align: 'right' });
    doc.text(`Rs.${item.price.toFixed(2)}`, 400, yPosition, { width: 70, align: 'right' });
    doc.text(`Rs.${(item.price * item.quantity).toFixed(2)}`, 470, yPosition, { width: 80, align: 'right' });
    yPosition += 20;
  });

  doc.moveTo(50, yPosition + 10).lineTo(550, yPosition + 10).stroke();

  // Totals
  yPosition += 30;
  doc.text('Subtotal:', 350, yPosition, { width: 100, align: 'right' });
  doc.text(`Rs.${order.subtotal.toFixed(2)}`, 470, yPosition, { width: 80, align: 'right' });
  
  yPosition += 20;
  doc.text('Shipping:', 350, yPosition, { width: 100, align: 'right' });
  doc.text(`Rs.${order.shipping.toFixed(2)}`, 470, yPosition, { width: 80, align: 'right' });
  
  yPosition += 30;
  doc.font('Helvetica-Bold').fontSize(12);
  doc.text('Total:', 350, yPosition, { width: 100, align: 'right' });
  doc.text(`Rs.${order.total.toFixed(2)}`, 470, yPosition, { width: 80, align: 'right' });

  doc.end();
});

// @desc    Verify Razorpay Payment
// @route   PUT /api/orders/:id/pay
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'success',
      update_time: Date.now().toString(),
      email_address: req.user.email,
    };

    const updatedOrder = await order.save();
    res.json({ success: true, updatedOrder });
  } else {
    res.status(400);
    throw new Error('Invalid payment signature');
  }
});

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, updateOrderToDelivered, cancelMyOrder, downloadInvoice, verifyPayment };
