const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

// All routes are private
router.use(protect);

router.post('/', createAppointment);
router.get('/', getMyAppointments);
router.put('/:id/status', updateAppointmentStatus);

module.exports = router;
