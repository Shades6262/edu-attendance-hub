const TrackerReport = require('../../models/TrackerReport');
const InstructorGroup = require('../../models/InstructorGroup');

// @route POST /api/tracker-reports
const createReport = async (req, res) => {
  try {
    const { title, content, groupId } = req.body;

    if (!title || !content || !groupId) {
      return res.status(400).json({ message: 'Title, content, and groupId are required' });
    }

    const group = await InstructorGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only report on your own group' });
    }

    const report = await TrackerReport.create({
      instructor: req.user.id,
      group: groupId,
      title,
      content
    });

    res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/tracker-reports
const getReports = async (req, res) => {
  try {
    const filter = req.user.role === 'instructor' ? { instructor: req.user.id } : {};
    const reports = await TrackerReport.find(filter)
      .populate('instructor', 'name email')
      .populate('group', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/tracker-reports/:id
const getReportById = async (req, res) => {
  try {
    const report = await TrackerReport.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('group', 'name students');

    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (req.user.role === 'instructor' && report.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PATCH /api/tracker-reports/:id/review
const reviewReport = async (req, res) => {
  try {
    const { feedback } = req.body;
    const report = await TrackerReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.adminFeedback = feedback || report.adminFeedback;
    report.status = 'reviewed';
    await report.save();

    res.json({ message: 'Report reviewed', report });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createReport, getReports, getReportById, reviewReport };