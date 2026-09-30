const mongoose = require('mongoose');

const studentExamAllocationSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam reference is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: [true, 'Room reference is required']
  },
  seatNumber: {
    type: Number,
    required: [true, 'Seat number is required']
  },
  rollNumber: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

studentExamAllocationSchema.index({ exam: 1, student: 1 }, { unique: true });
studentExamAllocationSchema.index({ exam: 1, room: 1, seatNumber: 1 });

module.exports = mongoose.model('StudentExamAllocation', studentExamAllocationSchema);
