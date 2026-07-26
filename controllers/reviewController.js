const Review = require('../models/Review');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Add review to product
// @route   POST /api/reviews/:productId
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  // Check if user already reviewed
  const existing = await Review.findOne({ user: req.user._id, product: req.params.productId });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = await Review.create({
    user: req.user._id,
    product: req.params.productId,
    rating: Number(rating),
    comment,
  });

  // Recalculate product rating
  const reviews = await Review.find({ product: req.params.productId });
  product.numReviews = reviews.length;
  product.rating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await product.save();

  const populated = await Review.findById(review._id).populate('user', 'name');
  res.status(201).json({ success: true, review: populated });
});

// @desc    Get reviews for product
// @route   GET /api/reviews/:productId
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

module.exports = { addReview, getReviews };
