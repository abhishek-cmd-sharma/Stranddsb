const express = require('express');
const router = express.Router();
const { submitQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.post('/', protect, submitQuiz);

module.exports = router;
