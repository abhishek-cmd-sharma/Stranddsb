const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  createProductReview,
  getAdminReviews,
  moderateReview 
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { productRules } = require('../validators/productValidator');
const validate = require('../middleware/validate');

router.route('/admin/reviews').get(protect, admin, getAdminReviews);

router.route('/').get(getProducts).post(protect, admin, productRules, validate, createProduct);
router.route('/:id').get(getProduct).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId').put(protect, admin, moderateReview);

module.exports = router;
