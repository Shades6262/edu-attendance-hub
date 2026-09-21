const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getPendingUsers,
  approveUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser
} = require('../controllers/adminController');

router.get('/pending-users', protect, restrictTo('admin'), getPendingUsers);
router.patch('/approve/:id', protect, restrictTo('admin'), approveUser);

router.get('/users', protect, restrictTo('admin', 'instructor'), getAllUsers);
router.patch('/users/:id/role', protect, restrictTo('admin'), updateUserRole);
router.patch('/users/:id/status', protect, restrictTo('admin'), updateUserStatus);
router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);

module.exports = router;