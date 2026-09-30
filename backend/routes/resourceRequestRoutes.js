const express = require('express');
const router = express.Router();
const {
  createResourceRequest,
  getResourceRequests,
  getResourceRequestById,
  updateResourceRequestStatus,
  cancelResourceRequest
} = require('../controllers/resourceRequestController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createResourceRequest)
  .get(getResourceRequests);

router.route('/:id')
  .get(getResourceRequestById);

router.route('/:id/status')
  .put(authorize('admin', 'super_admin', 'hod', 'department_admin'), updateResourceRequestStatus);

router.route('/:id/cancel')
  .put(cancelResourceRequest);

module.exports = router;
