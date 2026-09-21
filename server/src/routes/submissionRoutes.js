const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  createSubmission,
  getSubmissionsForAssignment,
  getMySubmissions,
  reviewSubmission
} = require('../controllers/submissionController');

router.post('/', protect, restrictTo('student'), createSubmission);
router.get('/me', protect, restrictTo('student'), getMySubmissions);
router.get('/assignment/:assignmentId', protect, restrictTo('instructor', 'admin'), getSubmissionsForAssignment);
router.patch('/:id/review', protect, restrictTo('instructor'), reviewSubmission);

module.exports = router;