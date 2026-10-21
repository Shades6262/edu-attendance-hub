const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createReport, getReports, getReportById, reviewReport } = require('../controllers/trackerController');

router.post('/', protect, restrictTo('instructor'), createReport);
router.get('/', protect, restrictTo('instructor', 'admin'), getReports);
router.get('/:id', protect, restrictTo('instructor', 'admin'), getReportById);
router.patch('/:id/review', protect, restrictTo('admin'), reviewReport);

module.exports = router;