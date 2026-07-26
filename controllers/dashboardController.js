const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Calculate total revenue
  const revenueResult = await Order.aggregate([
    { $match: { paymentStatus: { $in: ['Paid', 'Pending'] } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Low stock products (stock < 10)
  const lowStockProducts = await Product.find({ stock: { $lt: 10 }, active: true })
    .select('name stock price primaryImage')
    .sort({ stock: 1 })
    .limit(10);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  // Quiz Insights
  const quizInsights = await User.aggregate([
    { $match: { 'quizResult.primaryConcern': { $exists: true } } },
    { $group: { _id: '$quizResult.primaryConcern', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      recentOrders,
      ordersByStatus,
      quizInsights,
    },
  });
});

module.exports = { getDashboardStats };
