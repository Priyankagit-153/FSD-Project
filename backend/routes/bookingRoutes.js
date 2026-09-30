const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getPendingApprovals,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createBooking)
  .get(protect, getBookings);

router.get('/pending-approvals', protect, authorize('hod', 'admin'), getPendingApprovals);

router.route('/:id')
  .get(protect, getBookingById);

router.put('/:id/status', protect, authorize('hod', 'admin'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
