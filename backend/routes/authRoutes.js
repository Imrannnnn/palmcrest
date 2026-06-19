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
  updateUserProfile
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected endpoints
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/doctors', protect, getAllDoctors);
router.get('/patients', protect, authorize('admin'), getAllPatients);

// Admin-only endpoints
router.post('/admin/register', protect, authorize('admin'), registerAdmin);
router.get('/admins', protect, authorize('admin'), getAllAdmins);

module.exports = router;
