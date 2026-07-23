const express = require('express');
const router = express.Router();
const {
  getAppointmentForReview,
  createReview,
  getPublicReviews,
} = require('../controllers/reviewController');

// All reviews endpoints are public
router.get('/', getPublicReviews);
router.get('/appointment/:appointmentId', getAppointmentForReview);
router.post('/', createReview);

module.exports = router;
