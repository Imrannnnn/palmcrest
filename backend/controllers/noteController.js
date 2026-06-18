const Note = require('../model/Note');

// @desc    Create a new clinical note for a patient
// @route   POST /api/notes
// @access  Private (Doctor only)
const createNote = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      res.status(403);
      throw new Error('Only physicians can write clinical notes');
    }

    const { patient, note, priority } = req.body;

    if (!patient || !note) {
      res.status(400);
      throw new Error('Please include patient reference and clinical note text');
    }

    const clinicalNote = await Note.create({
      patient,
      doctor: req.user._id,
      note,
      priority: priority || 'Routine'
    });

    res.status(201).json(clinicalNote);
  } catch (error) {
    next(error);
  }
};

// @desc    Get clinical notes for a specific patient
// @route   GET /api/notes/patient/:patientId
// @access  Private (Doctor, Admin, or the Patient themselves)
const getPatientNotes = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { role, _id } = req.user;

    // A patient can only view their own clinical annotations
    if (role === 'patient' && _id.toString() !== patientId) {
      res.status(403);
      throw new Error('Not authorized to view other patients\' clinical records');
    }

    const notes = await Note.find({ patient: patientId })
      .populate('patient', 'fullName email patientId')
      .populate('doctor', 'fullName email specialization')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all clinical notes created by the logged-in doctor
// @route   GET /api/notes/doctor
// @access  Private (Doctor only)
const getDoctorNotes = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      res.status(403);
      throw new Error('Only physicians can access doctor notes');
    }

    const notes = await Note.find({ doctor: req.user._id })
      .populate('patient', 'fullName email patientId')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getPatientNotes,
  getDoctorNotes
};
