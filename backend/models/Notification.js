const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Notification'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_request',
      'booking_approved',
      'booking_rejected',
      'booking_cancelled',
      'exam_duty',
      'exam_published',
      'seat_allocated',
      'resource_uploaded',
      'general'
    ],
    default: 'general'
  },
  read: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

notificationSchema.pre('save', function (next) {
  if (this.isModified('read')) {
    this.isRead = this.read;
  } else if (this.isModified('isRead')) {
    this.read = this.isRead;
  }
  next();
});

notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
