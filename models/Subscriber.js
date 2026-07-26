const mongoose = require('mongoose');

const subscriberSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email address'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
