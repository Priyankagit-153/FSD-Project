const Exam = require('../models/Exam');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ExamAllocation = require('../models/ExamAllocation');
const StudentExamAllocation = require('../models/StudentExamAllocation');
const { logAudit } = require('../utils/auditLogger');
const {
  checkResourceConflict,
  checkInvigilatorConflict,
  checkStudentExamConflict
} = require('../utils/conflictChecker');

// Helper to check roles
const isSuperAdminUser = (user) => user && (user.role === 'admin' || user.role === 'super_admin');
const isDeptAdminUser = (user) => user && (user.role === 'hod' || user.role === 'department_admin');

// @desc    Create exam timetable with room & invigilator conflict validation
// @route   POST /api/exams
// @access  Private (Admin, HOD)
const createExam = async (req, res, next) => {
  try {
    const {
      name,
      subject,
      department,
      semester,
      section,
      date,
      startTime,
      endTime,
      rooms,
      invigilators,
      seatsPerRoom,
      totalStudents,
      studentCount,
      description,
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

    const assignedDept = isDeptAdminUser(req.user)
      ? req.user.department?._id
      : (department || req.user.department?._id);

    const roomIds = Array.isArray(rooms) ? rooms : [];
    const invigilatorIds = Array.isArray(invigilators) ? invigilators : [];
    const finalStudentCount = Number(studentCount) || Number(totalStudents) || 60;

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
          details: roomConflict,
          alternatives: roomConflict.alternatives || []
        });
      }
    }

    // 2. Validate Invigilator Conflicts (prevent faculty double-booking)
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

    // 3. Compute initial room allocations
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
      semester: semester || '5',
      section: section || 'A',
      date,
      startTime,
      endTime,
      studentCount: finalStudentCount,
      totalStudents: finalStudentCount,
      status: 'scheduled',
      description: description || '',
      rooms: roomIds,
      invigilators: invigilatorIds,
      seatsPerRoom: Number(seatsPerRoom) || 30,
      roomAllocations: calculatedAllocations,
      createdBy: req.user._id
    });

    // Create ExamAllocation entries
    for (const alloc of calculatedAllocations) {
      await ExamAllocation.create({
        exam: exam._id,
        room: alloc.room,
        allocatedStudents: alloc.allottedSeats || 30,
        capacityUsed: alloc.allottedSeats || 30,
        invigilators: alloc.assignedInvigilator ? [alloc.assignedInvigilator] : []
      });
    }

    // Notify assigned invigilators
    for (const invigId of invigilatorIds) {
      await Notification.create({
        user: invigId,
        title: 'New Exam Invigilation Duty',
        message: `You have been assigned as invigilator for "${exam.name}" (${exam.subject}) on ${date} from ${startTime} to ${endTime}.`,
        type: 'exam_duty',
        link: '/exams'
      });
    }

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
        studentCount: finalStudentCount,
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
      message: 'Examination scheduled successfully.',
      data: populatedExam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exams (filterable by department, semester, date, status, search)
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res, next) => {
  try {
    const { department, semester, date, status, search } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }
    if (semester) {
      query.semester = semester;
    }
    if (date) {
      query.date = date;
    }
    if (status) {
      query.status = status;
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
      .populate('roomAllocations.assignedInvigilator', 'name email')
      .populate('createdBy', 'name email');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const allocations = await ExamAllocation.find({ exam: exam._id })
      .populate('room', 'name location capacity')
      .populate('invigilators', 'name email designation');

    const studentAllocations = await StudentExamAllocation.find({ exam: exam._id })
      .populate('student', 'name studentId email')
      .populate('room', 'name location')
      .sort({ seatNumber: 1 });

    res.json({
      success: true,
      data: exam,
      allocations,
      studentAllocations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Admin, HOD)
const updateExam = async (req, res, next) => {
  try {
    let exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (isDeptAdminUser(req.user) && exam.department.toString() !== req.user.department?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit exams for other departments' });
    }

    const {
      name,
      subject,
      semester,
      section,
      date,
      startTime,
      endTime,
      studentCount,
      totalStudents,
      description,
      status
    } = req.body;

    if (name) exam.name = name;
    if (subject) exam.subject = subject;
    if (semester) exam.semester = semester;
    if (section) exam.section = section;
    if (date) exam.date = date;
    if (startTime) exam.startTime = startTime;
    if (endTime) exam.endTime = endTime;
    if (description !== undefined) exam.description = description;
    if (status) exam.status = status;
    if (studentCount || totalStudents) {
      const sc = Number(studentCount) || Number(totalStudents);
      exam.studentCount = sc;
      exam.totalStudents = sc;
    }

    await exam.save();

    await logAudit({
      action: 'EXAM_UPDATED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: exam._id,
      details: { name: exam.name, subject: exam.subject, status: exam.status }
    });

    const updated = await Exam.findById(exam._id)
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity type')
      .populate('invigilators', 'name email department designation');

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish exam timetable (notifies students and invigilators)
// @route   PUT /api/exams/:id/publish
// @access  Private (Admin, HOD)
const publishExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('department');
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    exam.status = 'published';
    await exam.save();

    // Notify all students of the department
    const students = await User.find({
      role: 'student',
      department: exam.department?._id
    });

    for (const std of students) {
      await Notification.create({
        user: std._id,
        title: 'Exam Timetable Published',
        message: `Timetable published for "${exam.name}" (${exam.subject}) on ${exam.date} (${exam.startTime}-${exam.endTime}). Check your seating allocation.`,
        type: 'exam_published',
        link: '/exams'
      });
    }

    // Notify invigilators
    for (const invigId of exam.invigilators) {
      await Notification.create({
        user: invigId,
        title: 'Exam Published - Invigilation Duty Confirmed',
        message: `Duty confirmed for "${exam.name}" on ${exam.date} (${exam.startTime}-${exam.endTime}).`,
        type: 'exam_duty',
        link: '/exams'
      });
    }

    await logAudit({
      action: 'EXAM_PUBLISHED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: exam._id,
      details: { name: exam.name, date: exam.date, department: exam.department?.name }
    });

    res.json({
      success: true,
      message: `Exam "${exam.name}" has been published. All eligible students and invigilators notified.`,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Cancel exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin, HOD)
const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (isDeptAdminUser(req.user) && exam.department.toString() !== req.user.department?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'HODs can only delete exams for their own department' });
    }

    // Remove allocations
    await ExamAllocation.deleteMany({ exam: exam._id });
    await StudentExamAllocation.deleteMany({ exam: exam._id });
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
      message: 'Exam schedule and allocations deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Allocate rooms & invigilators to an exam
// @route   POST /api/exams/:id/allocate-rooms
// @access  Private (Admin, HOD)
const allocateExamRooms = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const { allocations } = req.body;
    // allocations: [ { roomId, allocatedStudents, invigilatorId } ]

    if (!Array.isArray(allocations) || allocations.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of room allocations.' });
    }

    const updatedRoomAllocations = [];
    const roomIds = [];
    const invigilatorIds = [];

    // Clear previous allocations
    await ExamAllocation.deleteMany({ exam: exam._id });

    for (const item of allocations) {
      const room = await Resource.findById(item.roomId);
      if (!room) {
        return res.status(404).json({ success: false, message: `Room with ID ${item.roomId} not found.` });
      }

      // Check Room Conflict
      const conflict = await checkResourceConflict({
        resourceId: item.roomId,
        date: exam.date,
        startTime: exam.startTime,
        endTime: exam.endTime,
        excludeExamId: exam._id
      });

      if (conflict.conflict) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: `Cannot allocate room "${room.name}": ${conflict.message}`,
          details: conflict.conflictingItem,
          alternatives: conflict.alternatives || []
        });
      }

      // Check Invigilator Conflict if assigned
      if (item.invigilatorId) {
        const invigConflict = await checkInvigilatorConflict({
          invigilatorId: item.invigilatorId,
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          excludeExamId: exam._id
        });

        if (invigConflict.conflict) {
          return res.status(409).json({
            success: false,
            conflict: true,
            message: invigConflict.message,
            details: invigConflict
          });
        }
        invigilatorIds.push(item.invigilatorId);
      }

      const seatsAllocated = Number(item.allocatedStudents) || Math.min(room.capacity || 30, 40);

      const allocationDoc = await ExamAllocation.create({
        exam: exam._id,
        room: room._id,
        allocatedStudents: seatsAllocated,
        capacityUsed: seatsAllocated,
        invigilators: item.invigilatorId ? [item.invigilatorId] : []
      });

      updatedRoomAllocations.push({
        room: room._id,
        assignedInvigilator: item.invigilatorId || null,
        allottedSeats: seatsAllocated
      });

      roomIds.push(room._id);
    }

    exam.rooms = roomIds;
    exam.invigilators = invigilatorIds;
    exam.roomAllocations = updatedRoomAllocations;
    await exam.save();

    await logAudit({
      action: 'EXAM_ROOMS_ALLOCATED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: exam._id,
      details: { exam: exam.name, roomCount: roomIds.length, invigilatorCount: invigilatorIds.length }
    });

    const populatedExam = await Exam.findById(exam._id)
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity type')
      .populate('invigilators', 'name email designation')
      .populate('roomAllocations.room', 'name location capacity')
      .populate('roomAllocations.assignedInvigilator', 'name email');

    res.json({
      success: true,
      message: 'Exam rooms and invigilators allocated successfully with conflict verification.',
      data: populatedExam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-generate sequential student seat allocation across allocated exam rooms
// @route   POST /api/exams/:id/allocate-seats
// @access  Private (Admin, HOD)
const allocateStudentSeats = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('rooms')
      .populate('roomAllocations.room');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (!exam.roomAllocations || exam.roomAllocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No rooms allocated for this exam yet. Please allocate rooms first.'
      });
    }

    // Clear prior student allocations
    await StudentExamAllocation.deleteMany({ exam: exam._id });

    // Fetch enrolled students of this department (or general student users)
    let students = await User.find({
      role: 'student',
      $or: [
        { department: exam.department },
        { department: null }
      ]
    }).sort({ studentId: 1, name: 1 });

    if (students.length === 0) {
      // Fallback: fetch any active students in system
      students = await User.find({ role: 'student' }).sort({ name: 1 });
    }

    const createdAllocations = [];
    let studentIndex = 0;
    const totalStudentsToSeat = Math.min(exam.studentCount || exam.totalStudents || 60, students.length);

    // Sequential seating loop: Room by Room, Seat 1..N
    for (const alloc of exam.roomAllocations) {
      const room = alloc.room;
      const capacity = alloc.allottedSeats || room.capacity || 30;

      for (let seat = 1; seat <= capacity && studentIndex < totalStudentsToSeat; seat++) {
        const student = students[studentIndex];

        // Check if student has an overlapping exam
        const conflict = await checkStudentExamConflict({
          studentId: student._id,
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          excludeExamId: exam._id
        });

        if (!conflict.conflict) {
          const seatDoc = await StudentExamAllocation.create({
            exam: exam._id,
            student: student._id,
            room: room._id,
            seatNumber: seat,
            rollNumber: student.studentId || `EEC-26-CS${100 + studentIndex}`
          });
          createdAllocations.push(seatDoc);

          // Notify student
          await Notification.create({
            user: student._id,
            title: 'Exam Seat Allocated',
            message: `Seat #${seat} in ${room.name} (${room.location}) assigned for "${exam.name}" on ${exam.date}.`,
            type: 'seat_allocated',
            link: '/exams'
          });
        }

        studentIndex++;
      }
    }

    await logAudit({
      action: 'STUDENT_SEATS_ALLOCATED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: exam._id,
      details: { exam: exam.name, totalSeated: createdAllocations.length }
    });

    res.json({
      success: true,
      message: `Successfully allocated seats for ${createdAllocations.length} students across ${exam.roomAllocations.length} examination halls.`,
      count: createdAllocations.length,
      data: createdAllocations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's personal exam schedule & allocated seating
// @route   GET /api/exams/my-schedule
// @access  Private (Student)
const getMySchedule = async (req, res, next) => {
  try {
    // Find all student allocations for logged in student
    const allocations = await StudentExamAllocation.find({ student: req.user._id })
      .populate({
        path: 'exam',
        populate: { path: 'department', select: 'name code' }
      })
      .populate('room', 'name location capacity type')
      .sort({ createdAt: -1 });

    const schedule = allocations.map(a => ({
      allocationId: a._id,
      seatNumber: a.seatNumber,
      rollNumber: a.rollNumber,
      room: a.room,
      exam: a.exam
    }));

    res.json({
      success: true,
      count: schedule.length,
      data: schedule
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

// @desc    Get all invigilator assignments across campus (Admin view)
// @route   GET /api/exams/invigilators/all
// @access  Private (Admin, HOD)
const getAllInvigilators = async (req, res, next) => {
  try {
    const exams = await Exam.find()
      .populate('invigilators', 'name email department designation phone employeeId')
      .populate('department', 'name code')
      .populate('rooms', 'name location')
      .populate('roomAllocations.room', 'name location')
      .populate('roomAllocations.assignedInvigilator', 'name email designation department')
      .sort({ date: 1, startTime: 1 });

    const assignments = [];
    for (const ex of exams) {
      for (const invig of ex.invigilators || []) {
        // Find assigned room if mapped
        const allocation = (ex.roomAllocations || []).find(
          ra => ra.assignedInvigilator && ra.assignedInvigilator._id?.toString() === invig._id?.toString()
        );

        assignments.push({
          examId: ex._id,
          examName: ex.name,
          subject: ex.subject,
          department: ex.department,
          date: ex.date,
          startTime: ex.startTime,
          endTime: ex.endTime,
          status: ex.status,
          faculty: invig,
          room: allocation ? allocation.room : (ex.rooms?.[0] || null)
        });
      }
    }

    res.json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  publishExam,
  deleteExam,
  allocateExamRooms,
  allocateStudentSeats,
  getMySchedule,
  getMyDuties,
  getAllInvigilators
};
