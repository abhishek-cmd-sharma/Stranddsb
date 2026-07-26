const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }
  res.json({ success: true, wishlist });
});

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/:productId
const toggleWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  const productIndex = wishlist.products.indexOf(req.params.productId);
  if (productIndex > -1) {
    wishlist.products.splice(productIndex, 1);
  } else {
    wishlist.products.push(req.params.productId);
  }

  await wishlist.save();
  wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.json({ success: true, wishlist });
});

module.exports = { getWishlist, toggleWishlist };
