const Article = require('../models/Article');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all published articles (or all if admin)
// @route   GET /api/articles
// @access  Public
const getArticles = asyncHandler(async (req, res) => {
  const query = {};
  
  // If not admin, only show published articles
  if (!req.user || req.user.role !== 'admin') {
    query.status = 'published';
  }

  const articles = await Article.find(query).sort({ createdAt: -1 });
  res.json({ success: true, articles });
});

// @desc    Get single article by slug
// @route   GET /api/articles/:slug
// @access  Public
const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug });

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  // If draft, only admin can view
  if (article.status === 'draft' && (!req.user || req.user.role !== 'admin')) {
    res.status(403);
    throw new Error('Not authorized to view this article');
  }

  res.json({ success: true, article });
});

// @desc    Create an article
// @route   POST /api/articles
// @access  Private/Admin
const createArticle = asyncHandler(async (req, res) => {
  const { title, slug, content, excerpt, image, author, status, tags } = req.body;

  const articleExists = await Article.findOne({ slug });
  if (articleExists) {
    res.status(400);
    throw new Error('Article with this slug already exists');
  }

  const article = await Article.create({
    title,
    slug,
    content,
    excerpt,
    image,
    author,
    status,
    tags
  });

  res.status(201).json({ success: true, article });
});

// @desc    Update an article
// @route   PUT /api/articles/:id
// @access  Private/Admin
const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  const { title, slug, content, excerpt, image, author, status, tags } = req.body;

  article.title = title || article.title;
  article.slug = slug || article.slug;
  article.content = content || article.content;
  article.excerpt = excerpt !== undefined ? excerpt : article.excerpt;
  article.image = image || article.image;
  article.author = author || article.author;
  article.status = status || article.status;
  article.tags = tags || article.tags;

  const updatedArticle = await article.save();
  res.json({ success: true, article: updatedArticle });
});

// @desc    Delete an article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  await article.deleteOne();
  res.json({ success: true, message: 'Article removed' });
});

module.exports = {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
};
