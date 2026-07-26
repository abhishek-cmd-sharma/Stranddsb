const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all products (search, filter, sort, paginate)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { active: true };

  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.hairType) {
    filter.hairTypes = req.query.hairType;
  }
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { subCategory: { $regex: req.query.search, $options: 'i' } },
      { category: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Build sort
  let sort = { createdAt: -1 };
  if (req.query.sort === 'price-asc') sort = { price: 1 };
  else if (req.query.sort === 'price-desc') sort = { price: -1 };
  else if (req.query.sort === 'rating') sort = { rating: -1 };
  else if (req.query.sort === 'best-seller') sort = { isBestSeller: -1, rating: -1 };

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter).sort(sort).skip(skip).limit(limit);

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, message: 'Product removed' });
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    images: images || [],
    user: req.user._id,
    status: 'pending'
  };

  product.reviews.push(review);
  await product.save();

  res.status(201).json({ success: true, message: 'Review added and pending approval' });
});

// @desc    Get all reviews for admin
// @route   GET /api/products/admin/reviews
// @access  Admin
const getAdminReviews = asyncHandler(async (req, res) => {
  // Find all products that have reviews
  const products = await Product.find({ 'reviews.0': { $exists: true } }).select('name reviews');
  
  let allReviews = [];
  products.forEach(product => {
    product.reviews.forEach(review => {
      allReviews.push({
        _id: review._id,
        productId: product._id,
        productName: product.name,
        user: review.user,
        name: review.name,
        rating: review.rating,
        comment: review.comment,
        images: review.images,
        status: review.status,
        createdAt: review.createdAt
      });
    });
  });

  // Sort by newest first
  allReviews.sort((a, b) => b.createdAt - a.createdAt);
  
  res.json({ success: true, reviews: allReviews });
});

// @desc    Moderate a review (approve/reject)
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Admin
const moderateReview = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.status = status;

  // Recalculate overall rating based on APPROVED reviews only
  const approvedReviews = product.reviews.filter(r => r.status === 'approved');
  product.numReviews = approvedReviews.length;
  
  if (product.numReviews > 0) {
    product.rating =
      approvedReviews.reduce((acc, item) => item.rating + acc, 0) / product.numReviews;
  } else {
    product.rating = 0;
  }

  await product.save();
  res.json({ success: true, message: 'Review moderated successfully' });
});

module.exports = { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  createProductReview,
  getAdminReviews,
  moderateReview
};
