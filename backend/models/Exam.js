const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  date: {
    type: String, // Stored as YYYY-MM-DD
    required: [true, 'Exam date is required']
  },
  startTime: {
    type: String, // HH:mm
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String, // HH:mm
    required: [true, 'End time is required']
  },
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  invigilators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  seatsPerRoom: {
    type: Number,
    default: 30
  },
  totalStudents: {
    type: Number,
    default: 60
  },
  roomAllocations: [{
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    assignedInvigilator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    allottedSeats: {
      type: Number,
      default: 30
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);
