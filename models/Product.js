const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    brand: { type: String, default: 'Strandds' },
    category: { type: String, required: [true, 'Category is required'] },
    subCategory: { type: String, default: '' },
    description: { type: String, required: [true, 'Description is required'] },
    ingredients: { type: String, default: '' },
    benefits: [{ type: String }],
    directions: { type: String, default: '' },
    images: [{ type: String }],
    primaryImage: { type: String, default: '' },
    secondaryImage: { type: String, default: '' },
    price: { type: Number, required: [true, 'Price is required'], default: 0 },
    discountPrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    sizes: [{ type: String }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    hairTypes: [{ type: String }],
    isBestSeller: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    reviews: [reviewSchema],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.virtual('countInStock')
  .get(function () {
    return this.stock;
  })
  .set(function (val) {
    this.stock = val;
  });

// Add text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text', subCategory: 'text' });

module.exports = mongoose.model('Product', productSchema);
