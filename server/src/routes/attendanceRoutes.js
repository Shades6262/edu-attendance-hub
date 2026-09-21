const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  scanAttendance,
  getMyAttendance,
  getUserAttendance,
  getAllAttendanceByDate
} = require('../controllers/attendanceController');

// scanning device/kiosk hits this — likely no auth needed if it's a fixed physical kiosk,
// but we'll protect it for now and revisit if you want a public kiosk mode later
router.post('/scan', protect, scanAttendance);

router.get('/me', protect, getMyAttendance);
router.get('/user/:userId', protect, restrictTo('admin', 'instructor'), getUserAttendance);
router.get('/all', protect, restrictTo('admin'), getAllAttendanceByDate);

module.exports = router;