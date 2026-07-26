const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an article title'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide an article slug'],
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide article content'],
    },
    excerpt: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1596755389378-c11ddece8d9e?q=80&w=2000&auto=format&fit=crop',
    },
    author: {
      type: String,
      default: 'Strandds Editorial',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Article', articleSchema);
