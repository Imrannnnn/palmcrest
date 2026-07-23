const Appointment = require('../model/Appointment');
const Doctor = require('../model/Doctor');
const { sendBookingCreatedPatient, sendBookingCreatedDoctor, sendBookingStatusUpdate, sendAppointmentReminder, sendDoctorScheduleEmail } = require('../services/emailService');

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
      throw new Error("You cannot book an appointment for a past date. Please select today's date or a future date.");
    }

    // Prevent booking an hour that has already passed today
    if (apptMidnight === todayMidnight) {
      const timeParts = timeSlot.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const ampm = timeParts[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const apptTimeToday = new Date(today);
        apptTimeToday.setHours(hours, minutes, 0, 0);

        if (apptTimeToday < today) {
          res.status(400);
          throw new Error("You cannot book an appointment for a time slot that has already passed today. Please select a future time slot.");
        }
      }
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

    const doctorDoc = await Doctor.findById(doctor);
    if (doctorDoc) {
      sendBookingCreatedPatient(req.user, doctorDoc, appointment).catch(err => console.error("Email error:", err));
      sendBookingCreatedDoctor(doctorDoc, req.user, appointment).catch(err => console.error("Email error:", err));
    }

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

    if (updatedAppointment && updatedAppointment.patient && updatedAppointment.doctor) {
      sendBookingStatusUpdate(updatedAppointment.patient, updatedAppointment.doctor, updatedAppointment).catch(err => console.error("Email error:", err));
    }

    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger post-visit email
// @route   POST /api/appointments/:id/reminders/post-visit
// @access  Private (Admin only)
const triggerPostVisitEmail = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor');

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'Completed') {
      res.status(400);
      throw new Error('Can only send post-visit email for completed appointments');
    }

    if (appointment.remindersSent.includes('post4hr')) {
      res.status(400);
      throw new Error('Post-visit email has already been sent');
    }

    await sendAppointmentReminder(appointment.patient, appointment.doctor, appointment, 'post4hr');
    
    appointment.remindersSent.push('post4hr');
    await appointment.save();

    res.status(200).json({ success: true, message: 'Post-visit email sent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manually sends schedule to doctor
// @route   POST /api/appointments/admin/send-schedule/:doctorId
// @access  Private (Admin only)
const sendDoctorSchedule = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { timeframe } = req.body; // 'day', 'week', 'month'

    if (!['day', 'week', 'month'].includes(timeframe)) {
      res.status(400);
      throw new Error('Invalid timeframe. Must be day, week, or month.');
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    // Determine date range
    const start = new Date();
    start.setHours(0, 0, 0, 0); // Start of today

    const end = new Date(start);
    if (timeframe === 'day') {
      end.setDate(end.getDate() + 1);
    } else if (timeframe === 'week') {
      end.setDate(end.getDate() + 7);
    } else if (timeframe === 'month') {
      end.setMonth(end.getMonth() + 1);
    }

    // Find appointments
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: start, $lt: end },
      status: { $in: ['Pending', 'Approved'] }
    }).populate('patient', 'fullName');

    // Send email
    await sendDoctorScheduleEmail(doctor, timeframe, appointments);

    res.status(200).json({ success: true, message: `Schedule sent to Dr. ${doctor.fullName} successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  triggerPostVisitEmail,
  sendDoctorSchedule
};
