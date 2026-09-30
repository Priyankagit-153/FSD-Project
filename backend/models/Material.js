const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Material title is required'],
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
  description: {
    type: String,
    default: ''
  },
  semester: {
    type: String,
    default: '5'
  },
  type: {
    type: String,
    enum: ['notes', 'lab manual', 'question bank', 'dataset', 'research', 'research paper', 'project material'],
    required: [true, 'Material type is required']
  },
  category: {
    type: String,
    enum: ['notes', 'lab manual', 'question bank', 'dataset', 'research', 'research paper', 'project material'],
    default: 'notes'
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['public', 'department', 'faculty_only'],
    default: 'public'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);
