const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.route('/:productId').get(getReviews).post(protect, addReview);

module.exports = router;
