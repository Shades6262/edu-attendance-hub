const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  createGroup,
  getGroups,
  getGroupById,
  addStudent,
  removeStudent,
  deleteGroup
} = require('../controllers/groupController');

router.post('/', protect, restrictTo('admin'), createGroup);
router.get('/', protect, restrictTo('admin', 'instructor'), getGroups);
router.get('/:id', protect, restrictTo('admin', 'instructor'), getGroupById);
router.patch('/:id/add-student', protect, restrictTo('admin', 'instructor'), addStudent);
router.patch('/:id/remove-student', protect, restrictTo('admin', 'instructor'), removeStudent);
router.delete('/:id', protect, restrictTo('admin'), deleteGroup);

module.exports = router;