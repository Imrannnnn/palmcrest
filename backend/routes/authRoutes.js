const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllDoctors,
  getAllPatients,
  registerAdmin,
  getAllAdmins,
  updateUserProfile,
  broadcastEmail,
  setupAdminPassword,
  emailIndividualPatient
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/setup-password/:token', setupAdminPassword);

// Protected endpoints
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/doctors', protect, getAllDoctors);
router.get('/patients', protect, authorize('admin'), getAllPatients);

// Admin-only endpoints
router.post('/admin/register', protect, authorize('admin'), registerAdmin);
router.get('/admins', protect, authorize('admin'), getAllAdmins);
router.post('/admin/broadcast', protect, authorize('admin'), broadcastEmail);
router.post('/admin/email-patient', protect, authorize('admin'), emailIndividualPatient);

module.exports = router;
