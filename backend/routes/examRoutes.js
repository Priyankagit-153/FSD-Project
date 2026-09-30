const express = require('express');
const router = express.Router();
const {
  createExam,
  getExams,
  getMyDuties,
  getExamById,
  deleteExam
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getExams)
  .post(protect, authorize('admin', 'hod'), createExam);

router.get('/my-duties', protect, getMyDuties);

router.route('/:id')
  .get(protect, getExamById)
  .delete(protect, authorize('admin', 'hod'), deleteExam);

module.exports = router;
