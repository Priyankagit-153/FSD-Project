const Exam = require('../models/Exam');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/auditLogger');
const { checkResourceConflict, checkInvigilatorConflict } = require('../utils/conflictChecker');

// @desc    Create exam timetable with room & invigilator conflict validation
// @route   POST /api/exams
// @access  Private (Admin, HOD)
const createExam = async (req, res, next) => {
  try {
    const {
      name,
      subject,
      department,
      date,
      startTime,
      endTime,
      rooms,
      invigilators,
      seatsPerRoom,
      totalStudents,
      roomAllocations
    } = req.body;

    if (!name || !subject || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exam name, subject, date, startTime, and endTime.'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'Exam start time must be before end time.'
      });
    }

    const assignedDept = req.user.role === 'hod' ? req.user.department._id : (department || req.user.department?._id);

    const roomIds = Array.isArray(rooms) ? rooms : [];
    const invigilatorIds = Array.isArray(invigilators) ? invigilators : [];

    // 1. Validate Room Conflicts
    for (const roomId of roomIds) {
      const roomConflict = await checkResourceConflict({
        resourceId: roomId,
        date,
        startTime,
        endTime
      });

      if (roomConflict.conflict) {
        const roomObj = await Resource.findById(roomId).select('name');
        return res.status(409).json({
          success: false,
          conflict: true,
          type: 'room_conflict',
          message: `Conflict for room "${roomObj ? roomObj.name : roomId}": ${roomConflict.message}`,
          details: roomConflict
        });
      }
    }

    // 2. Validate Invigilator Conflicts (no invigilator double-booked at the same time)
    for (const invigilatorId of invigilatorIds) {
      const invigConflict = await checkInvigilatorConflict({
        invigilatorId,
        date,
        startTime,
        endTime
      });

      if (invigConflict.conflict) {
        return res.status(409).json({
          success: false,
          conflict: true,
          type: 'invigilator_conflict',
          message: invigConflict.message,
          details: invigConflict
        });
      }
    }

    // 3. Compute simple seat allocations if not provided
    let calculatedAllocations = roomAllocations || [];
    if (!calculatedAllocations || calculatedAllocations.length === 0) {
      const defaultCapacity = Number(seatsPerRoom) || 30;
      calculatedAllocations = roomIds.map((roomId, idx) => ({
        room: roomId,
        assignedInvigilator: invigilatorIds[idx] || null,
        allottedSeats: defaultCapacity
      }));
    }

    const exam = await Exam.create({
      name,
      subject,
      department: assignedDept,
      date,
      startTime,
      endTime,
      rooms: roomIds,
      invigilators: invigilatorIds,
      seatsPerRoom: Number(seatsPerRoom) || 30,
      totalStudents: Number(totalStudents) || 60,
      roomAllocations: calculatedAllocations,
      createdBy: req.user._id
    });

    // Notify all assigned invigilators
    for (const invigId of invigilatorIds) {
      await Notification.create({
        user: invigId,
        title: 'New Exam Invigilation Duty',
        message: `You have been assigned as invigilator for "${exam.name}" (${exam.subject}) on ${date} from ${startTime} to ${endTime}.`,
        type: 'exam_duty',
        link: '/exams'
      });
    }

    // Log Audit
    await logAudit({
      action: 'EXAM_TIMETABLE_CREATED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: exam._id,
      details: {
        name,
        subject,
        date,
        time: `${startTime}-${endTime}`,
        roomCount: roomIds.length,
        invigilatorCount: invigilatorIds.length
      }
    });

    const populatedExam = await Exam.findById(exam._id)
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity type')
      .populate('invigilators', 'name email department designation')
      .populate('roomAllocations.room', 'name location capacity')
      .populate('roomAllocations.assignedInvigilator', 'name email');

    res.status(201).json({
      success: true,
      data: populatedExam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exams (filterable by department, date)
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res, next) => {
  try {
    const { department, date, search } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }
    if (date) {
      query.date = date;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const exams = await Exam.find(query)
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity type')
      .populate('invigilators', 'name email department designation')
      .populate('roomAllocations.room', 'name location capacity')
      .populate('roomAllocations.assignedInvigilator', 'name email')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invigilation duties for logged-in faculty
// @route   GET /api/exams/my-duties
// @access  Private
const getMyDuties = async (req, res, next) => {
  try {
    const exams = await Exam.find({
      invigilators: req.user._id
    })
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity')
      .populate('roomAllocations.room', 'name location')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity type')
      .populate('invigilators', 'name email department designation')
      .populate('roomAllocations.room', 'name location capacity')
      .populate('roomAllocations.assignedInvigilator', 'name email');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin, HOD)
const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (req.user.role === 'hod' && exam.department.toString() !== req.user.department._id.toString()) {
      return res.status(403).json({ success: false, message: 'HODs can only delete exams for their own department' });
    }

    await exam.deleteOne();

    await logAudit({
      action: 'EXAM_DELETED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: req.params.id,
      details: { name: exam.name, subject: exam.subject }
    });

    res.json({
      success: true,
      message: 'Exam schedule deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExam,
  getExams,
  getMyDuties,
  getExamById,
  deleteExam
};
