const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: [true, 'Resource is required']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by user is required']
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResourceRequest',
    default: null
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  title: {
    type: String,
    required: [true, 'Booking title/purpose is required'],
    trim: true
  },
  purpose: {
    type: String,
    default: '',
    trim: true
  },
  date: {
    type: String, // Stored as YYYY-MM-DD string for exact calendar day comparison
    required: [true, 'Date is required']
  },
  startTime: {
    type: String, // Stored as "HH:mm" e.g., "09:00"
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String, // Stored as "HH:mm" e.g., "11:00"
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  remarks: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for conflict lookup performance
bookingSchema.index({ resource: 1, date: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
