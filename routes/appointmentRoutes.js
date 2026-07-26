const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);

module.exports = router;
