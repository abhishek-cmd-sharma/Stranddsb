const express = require('express');
const router = express.Router();
const { subscribe, getSubscribers, unsubscribe } = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/auth');

router.post('/subscribe', subscribe);
router.delete('/unsubscribe', unsubscribe);
router.get('/subscribers', protect, admin, getSubscribers);

module.exports = router;
