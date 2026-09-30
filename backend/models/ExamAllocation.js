const mongoose = require('mongoose');

const examAllocationSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam reference is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: [true, 'Room/Resource reference is required']
  },
  allocatedStudents: {
    type: Number,
    required: true,
    default: 0
  },
  capacityUsed: {
    type: Number,
    required: true,
    default: 0
  },
  invigilators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

examAllocationSchema.index({ exam: 1, room: 1 });

module.exports = mongoose.model('ExamAllocation', examAllocationSchema);
