const Appointment = require('../model/Appointment');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const createAppointment = async (req, res, next) => {
  try {
    if (req.user.role !== 'patient') {
      res.status(403);
      throw new Error('Only patients can schedule appointments');
    }

    const { doctor, title, description, date, timeSlot, duration, type } = req.body;

    if (!doctor || !title || !date || !timeSlot) {
      res.status(400);
      throw new Error('Please include doctor, title, date, and timeSlot');
    }

    // Prevent booking a previous day (past dates)
    const apptDateObj = new Date(date);
    const apptYear = apptDateObj.getUTCFullYear();
    const apptMonth = apptDateObj.getUTCMonth();
    const apptDay = apptDateObj.getUTCDate();
    const apptMidnight = Date.UTC(apptYear, apptMonth, apptDay);

    const today = new Date();
    const todayMidnight = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    if (apptMidnight < todayMidnight) {
      res.status(400);
      throw new Error('Appointment date cannot be in the past');
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      title,
      description,
      date,
      timeSlot,
      duration: duration || 30,
      type: type || 'Appointment'
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user appointments (Role filtered)
// @route   GET /api/appointments
// @access  Private (Patient, Doctor, or Admin)
const getMyAppointments = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let query = {};

    if (role === 'patient') {
      query = { patient: _id };
    } else if (role === 'doctor') {
      query = { doctor: _id };
    } else if (role === 'admin') {
      if (req.query.doctor) {
        query = { doctor: req.query.doctor };
      } else {
        query = {}; // Admin can see all
      }
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'fullName email patientId')
      .populate('doctor', 'fullName email specialization')
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor or Admin only)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    if (!['doctor', 'admin'].includes(req.user.role)) {
      res.status(403);
      throw new Error('Only doctors or admins can update appointment status');
    }

    const { status } = req.body;
    if (!status || !['Pending', 'Approved', 'Completed', 'Cancelled'].includes(status)) {
      res.status(400);
      throw new Error('Please specify a valid status (Pending, Approved, Completed, Cancelled)');
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    // If a doctor updates, make sure it is their own appointment (admins bypass)
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update status of other physicians\' appointments');
    }

    appointment.status = status;
    await appointment.save();

    const updatedAppointment = await Appointment.findById(req.params.id)
      .populate('patient', 'fullName email patientId')
      .populate('doctor', 'fullName email specialization');

    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus
};
