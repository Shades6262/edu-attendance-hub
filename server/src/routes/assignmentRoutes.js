const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');

router.post('/', protect, restrictTo('instructor'), createAssignment);
router.get('/', protect, getAssignments); // all roles allowed, filtering happens inside
router.get('/:id', protect, getAssignmentById);
router.patch('/:id', protect, restrictTo('instructor'), updateAssignment);
router.delete('/:id', protect, restrictTo('instructor', 'admin'), deleteAssignment);

module.exports = router;