const express = require('express');
const router = express.Router();
const {
  createExam,
  getExams,
  getMyDuties,
  getMySchedule,
  getExamById,
  updateExam,
  publishExam,
  deleteExam,
  allocateExamRooms,
  allocateStudentSeats,
  getAllInvigilators
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getExams)
  .post(authorize('admin', 'super_admin', 'hod', 'department_admin'), createExam);

router.get('/my-duties', getMyDuties);
router.get('/my-schedule', getMySchedule);
router.get('/invigilators/all', authorize('admin', 'super_admin', 'hod', 'department_admin'), getAllInvigilators);

router.route('/:id')
  .get(getExamById)
  .put(authorize('admin', 'super_admin', 'hod', 'department_admin'), updateExam)
  .delete(authorize('admin', 'super_admin', 'hod', 'department_admin'), deleteExam);

router.put('/:id/publish', authorize('admin', 'super_admin', 'hod', 'department_admin'), publishExam);
router.post('/:id/allocate-rooms', authorize('admin', 'super_admin', 'hod', 'department_admin'), allocateExamRooms);
router.post('/:id/allocate-seats', authorize('admin', 'super_admin', 'hod', 'department_admin'), allocateStudentSeats);

module.exports = router;
