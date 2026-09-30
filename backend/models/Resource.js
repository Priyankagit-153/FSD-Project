const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Resource name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: [
      'classroom',
      'laboratory',
      'lab',
      'seminar hall',
      'conference room',
      'auditorium',
      'projector',
      'computer',
      'camera',
      'iot kit',
      'sensor',
      'lab equipment',
      'equipment',
      'other'
    ],
    lowercase: true
  },
  category: {
    type: String,
    enum: ['Infrastructure', 'Equipment', 'Academic Resources', 'Human Resources'],
    default: 'Infrastructure'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department owner is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    default: 0,
    min: 0
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  features: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['available', 'maintenance', 'allocated', 'inactive'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
