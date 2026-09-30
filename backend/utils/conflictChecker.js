const Booking = require('../models/Booking');
const Exam = require('../models/Exam');
const User = require('../models/User');
const Resource = require('../models/Resource');
const StudentExamAllocation = require('../models/StudentExamAllocation');

/**
 * Convert HH:mm string to minutes from start of day
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Checks if two time intervals overlap (strictly existing.startTime < requested.endTime && existing.endTime > requested.startTime)
 */
const isTimeOverlapping = (startA, endA, startB, endB) => {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return sA < eB && eA > sB;
};

/**
 * Find alternative resources of similar type/category that are available at the given date/time
 */
const findAlternativeResources = async ({ resourceId, date, startTime, endTime, limit = 3 }) => {
  try {
    const targetResource = await Resource.findById(resourceId);
    if (!targetResource) return [];

    // Search for resources with matching type or category, excluding current resource
    const candidates = await Resource.find({
      _id: { $ne: resourceId },
      isActive: true,
      $or: [
        { type: targetResource.type },
        { category: targetResource.category }
      ]
    }).populate('department', 'name code');

    const available = [];
    for (const candidate of candidates) {
      const conflict = await checkResourceConflictRaw({
        resourceId: candidate._id,
        date,
        startTime,
        endTime
      });

      if (!conflict.conflict) {
        available.push({
          _id: candidate._id,
          name: candidate.name,
          type: candidate.type,
          category: candidate.category,
          capacity: candidate.capacity,
          location: candidate.location,
          department: candidate.department
        });
        if (available.length >= limit) break;
      }
    }

    return available;
  } catch (err) {
    console.error('Error finding alternative resources:', err);
    return [];
  }
};

/**
 * Raw conflict check without recursive alternative search
 */
const checkResourceConflictRaw = async ({
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
 * Check if a resource has an approved booking or exam scheduled at the given date and time,
 * including alternative resource suggestions if a conflict exists.
 */
const checkResourceConflict = async ({
  resourceId,
  date,
  startTime,
  endTime,
  excludeBookingId = null,
  excludeExamId = null
}) => {
  const result = await checkResourceConflictRaw({
    resourceId,
    date,
    startTime,
    endTime,
    excludeBookingId,
    excludeExamId
  });

  if (result.conflict) {
    const alternatives = await findAlternativeResources({
      resourceId,
      date,
      startTime,
      endTime
    });
    result.alternatives = alternatives;
    if (alternatives.length > 0) {
      result.suggestedMessage = `Alternative available resources: ${alternatives.map(a => `${a.name} (${a.department?.code || ''})`).join(', ')}`;
    }
  }

  return result;
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

/**
 * Check if a student is already allocated to another exam at the same date and overlapping time
 */
const checkStudentExamConflict = async ({
  studentId,
  date,
  startTime,
  endTime,
  excludeExamId = null
}) => {
  const allocations = await StudentExamAllocation.find({ student: studentId }).populate('exam');

  for (const alloc of allocations) {
    if (!alloc.exam || (excludeExamId && alloc.exam._id.toString() === excludeExamId.toString())) {
      continue;
    }
    if (alloc.exam.date === date && isTimeOverlapping(startTime, endTime, alloc.exam.startTime, alloc.exam.endTime)) {
      return {
        conflict: true,
        message: `Student is already allocated for exam "${alloc.exam.name}" (${alloc.exam.subject}) at ${alloc.exam.startTime}-${alloc.exam.endTime} on ${date}.`,
        conflictingExam: alloc.exam
      };
    }
  }

  return { conflict: false };
};

module.exports = {
  timeToMinutes,
  isTimeOverlapping,
  checkResourceConflict,
  checkInvigilatorConflict,
  checkStudentExamConflict,
  findAlternativeResources
};
