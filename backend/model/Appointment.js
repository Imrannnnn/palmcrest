const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Appointment title/type is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },
    duration: {
      type: Number,
      default: 30, // duration in minutes
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    type: {
      type: String,
      enum: ['Appointment', 'Surgery'],
      default: 'Appointment',
    },
    remindersSent: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
