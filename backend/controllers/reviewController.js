const Review = require('../model/Review');
const Appointment = require('../model/Appointment');

// @desc    Get public appointment info for review page
// @route   GET /api/reviews/appointment/:appointmentId
// @access  Public
const getAppointmentForReview = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'fullName')
      .populate('doctor', 'fullName');

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointment: appointmentId });

    res.json({
      patientName: appointment.patient ? appointment.patient.fullName : 'Patient',
      doctorName: appointment.doctor ? appointment.doctor.fullName : 'Doctor',
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      title: appointment.title,
      alreadyReviewed: !!existingReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Public
const createReview = async (req, res, next) => {
  try {
    const { appointmentId, rating, comments } = req.body;

    if (!appointmentId || !rating || !comments) {
      res.status(400);
      throw new Error('Please include appointmentId, rating, and comments');
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400);
      throw new Error('Rating must be between 1 and 5');
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient')
      .populate('doctor');

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      res.status(400);
      throw new Error('A review has already been submitted for this appointment');
    }

    const review = await Review.create({
      patientName: appointment.patient ? appointment.patient.fullName : 'Anonymous Patient',
      doctorName: appointment.doctor ? appointment.doctor.fullName : 'Anonymous Doctor',
      rating: ratingNum,
      comments,
      appointment: appointmentId,
      doctor: appointment.doctor ? appointment.doctor._id : null,
      patient: appointment.patient ? appointment.patient._id : null,
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getPublicReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointmentForReview,
  createReview,
  getPublicReviews,
};
