const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  triggerPostVisitEmail,
  sendDoctorSchedule
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// All routes are private
router.use(protect);

router.post('/', createAppointment);
router.get('/', getMyAppointments);
router.put('/:id/status', updateAppointmentStatus);
router.post('/:id/reminders/post-visit', triggerPostVisitEmail);

// Admin route to send schedule to doctors
router.post('/admin/send-schedule/:doctorId', authorize('admin'), sendDoctorSchedule);

module.exports = router;
