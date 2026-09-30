const Booking = require('../models/Booking');
const Exam = require('../models/Exam');
const User = require('../models/User');
const Resource = require('../models/Resource');

/**
 * Convert HH:mm string to minutes from start of day
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Checks if two time intervals overlap (strictly greater start vs less end)
 */
const isTimeOverlapping = (startA, endA, startB, endB) => {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return sA < eB && eA > sB;
};

/**
 * Check if a resource has an approved booking or exam scheduled at the given date and time
 */
const checkResourceConflict = async ({
  resourceId,
  date,
  startTime,
  endTime,
  excludeBookingId = null,
  excludeExamId = null
}) => {
  // 1. Check existing Approved Bookings
  const bookingQuery = {
    resource: resourceId,
    date: date,
    status: 'approved'
  };
  if (excludeBookingId) {
    bookingQuery._id = { $ne: excludeBookingId };
  }

  const existingBookings = await Booking.find(bookingQuery)
    .populate('requestedBy', 'name email')
    .populate('resource', 'name location');

  for (const booking of existingBookings) {
    if (isTimeOverlapping(startTime, endTime, booking.startTime, booking.endTime)) {
      return {
        conflict: true,
        type: 'booking',
        message: `Resource is already booked by ${booking.requestedBy ? booking.requestedBy.name : 'Faculty'} for "${booking.title}" from ${booking.startTime} to ${booking.endTime} on ${date}.`,
        conflictingItem: booking
      };
    }
  }

  // 2. Check scheduled Exams occupying this resource
  const examQuery = {
    rooms: resourceId,
    date: date
  };
  if (excludeExamId) {
    examQuery._id = { $ne: excludeExamId };
  }

  const existingExams = await Exam.find(examQuery).populate('rooms', 'name location');

  for (const exam of existingExams) {
    if (isTimeOverlapping(startTime, endTime, exam.startTime, exam.endTime)) {
      return {
        conflict: true,
        type: 'exam',
        message: `Resource is reserved for exam "${exam.name}" (${exam.subject}) from ${exam.startTime} to ${exam.endTime} on ${date}.`,
        conflictingItem: exam
      };
    }
  }

  return { conflict: false };
};

/**
 * Check if an invigilator is already assigned to another exam at the same date and time
 */
const checkInvigilatorConflict = async ({
  invigilatorId,
  date,
  startTime,
  endTime,
  excludeExamId = null
}) => {
  const examQuery = {
    invigilators: invigilatorId,
    date: date
  };
  if (excludeExamId) {
    examQuery._id = { $ne: excludeExamId };
  }

  const existingExams = await Exam.find(examQuery).populate('invigilators', 'name email');

  for (const exam of existingExams) {
    if (isTimeOverlapping(startTime, endTime, exam.startTime, exam.endTime)) {
      const invigilator = await User.findById(invigilatorId).select('name');
      return {
        conflict: true,
        message: `Faculty member "${invigilator ? invigilator.name : 'Faculty'}" is already assigned as an invigilator for "${exam.name}" (${exam.subject}) from ${exam.startTime} to ${exam.endTime} on ${date}.`,
        conflictingItem: exam
      };
    }
  }

  return { conflict: false };
};

module.exports = {
  timeToMinutes,
  isTimeOverlapping,
  checkResourceConflict,
  checkInvigilatorConflict
};
