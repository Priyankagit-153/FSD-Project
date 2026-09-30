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
  semester: {
    type: String,
    default: '5'
  },
  section: {
    type: String,
    default: 'A'
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
  studentCount: {
    type: Number,
    default: 60,
    min: 1
  },
  totalStudents: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'published', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  description: {
    type: String,
    default: ''
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
