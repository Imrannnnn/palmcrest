const express = require('express');
const router = express.Router();
const {
  createNote,
  getPatientNotes,
  getDoctorNotes
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

// All routes are private
router.use(protect);

router.post('/', createNote);
router.get('/doctor', getDoctorNotes);
router.get('/patient/:patientId', getPatientNotes);

module.exports = router;
