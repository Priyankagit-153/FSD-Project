const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
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
  requestingDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Requesting department is required']
  },
  resourceDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Resource department is required']
  },
  title: {
    type: String,
    required: [true, 'Request title is required'],
    trim: true
  },
  date: {
    type: String, // Stored as YYYY-MM-DD
    required: [true, 'Date is required']
  },
  startTime: {
    type: String, // HH:mm e.g. 09:00
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String, // HH:mm e.g. 11:00
    required: [true, 'End time is required']
  },
  purpose: {
    type: String,
    default: '',
    trim: true
  },
  participants: {
    type: Number,
    default: 1,
    min: 1
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
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  }
}, {
  timestamps: true
});

resourceRequestSchema.index({ resource: 1, date: 1, status: 1 });
resourceRequestSchema.index({ requestedBy: 1, status: 1 });
resourceRequestSchema.index({ resourceDepartment: 1, status: 1 });

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
