const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Submit quiz and get recommendations
// @route   POST /api/quiz
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const { hairType, scalpType, primaryConcern } = req.body;

    // Simple Dosha logic based on hair type/scalp
    let dosha = 'Vata';
    if (scalpType === 'oily' || hairType === 'straight') dosha = 'Pitta';
    if (scalpType === 'normal' && hairType === 'wavy') dosha = 'Kapha';

    // Find products matching the concern or hair type
    const products = await Product.find({
      $or: [
        { category: primaryConcern.toLowerCase() },
        { hairTypes: hairType }
      ]
    }).limit(4);

    const recommendedRoutine = products.map(p => p._id);

    // Update user
    const user = await User.findById(req.user._id);
    if (user) {
      user.quizResult = {
        dosha,
        primaryConcern,
        recommendedRoutine,
        takenAt: new Date()
      };
      
      // Award points for taking quiz if they haven't taken it recently
      user.points += 50; 
      if (user.points >= 500) user.tier = 'Lotus';
      else if (user.points >= 200) user.tier = 'Blossom';
      else user.tier = 'Seedling';

      await user.save();
    }

    res.json({
      success: true,
      quizResult: user.quizResult,
      points: user.points,
      tier: user.tier,
      message: 'Quiz submitted successfully. +50 Lotus Points!'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during quiz submission' });
  }
};

module.exports = {
  submitQuiz,
};
