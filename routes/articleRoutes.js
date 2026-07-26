const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/articleController');
const { protect, admin, optionalProtect } = require('../middleware/auth');

// Note: If you don't have optionalProtect, we'll need to define it or skip it for getArticles. 
// We can use a custom middleware or just let the controller handle missing req.user if protect is not used.
// Actually, `protect` throws an error if token is missing. 
// For `getArticles`, we want public access but admin benefits. 
// We can add a simple middleware here to extract user if token exists, without throwing error.

const extractUserOptional = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore error for optional auth
    }
  }
  next();
};

router.route('/')
  .get(extractUserOptional, getArticles)
  .post(protect, admin, createArticle);

router.route('/:slug')
  .get(extractUserOptional, getArticleBySlug);

router.route('/:id')
  .put(protect, admin, updateArticle)
  .delete(protect, admin, deleteArticle);

module.exports = router;
