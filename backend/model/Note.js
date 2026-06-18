const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
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
    note: {
      type: String,
      required: [true, 'Clinical note content is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Routine', 'Monitoring', 'Urgent'],
      default: 'Routine',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Note', NoteSchema);
