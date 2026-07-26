const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
const bookAppointment = asyncHandler(async (req, res) => {
  const { date, timeSlot, notes } = req.body;

  const sendEmail = require('../utils/sendEmail');

  const appointment = await Appointment.create({
    user: req.user._id,
    date,
    timeSlot,
    notes
  });

  try {
    await sendEmail({
      email: req.user.email,
      subject: 'Strandds Hair Cosmetics - Appointment Confirmed',
      message: `Hi ${req.user.name},\n\nYour appointment on ${new Date(date).toLocaleDateString()} at ${timeSlot} is confirmed!\n\nWe look forward to seeing you.`,
    });
  } catch (error) {
    console.error('Failed to send appointment confirmation email:', error);
  }

  res.status(201).json({
    success: true,
    appointment,
    message: 'Appointment booked successfully!'
  });
});

// @desc    Get user appointments
// @route   GET /api/appointments/my
// @access  Private
const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id }).sort({ date: 1 });
  res.json({ success: true, appointments });
});

module.exports = {
  bookAppointment,
  getMyAppointments
};
