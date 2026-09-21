const Submission = require('../../models/Submission');
const Assignment = require('../../models/Assignment');
const User = require('../../models/User');

// @route POST /api/submissions
// Student submits work for an assignment (link or text, per our scope decision)
const createSubmission = async (req, res) => {
  try {
    const { assignmentId, content } = req.body;

    if (!assignmentId || !content) {
      return res.status(400).json({ message: 'assignmentId and content are required' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // confirm this student actually belongs to the assignment's group
    const student = await User.findById(req.user.id);
    if (!student.instructorGroup || student.instructorGroup.toString() !== assignment.group.toString()) {
      return res.status(403).json({ message: 'You are not part of this assignment\'s group' });
    }

    // check for existing submission (unique index also protects this at DB level)
    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user.id,
      content
    });

    res.status(201).json({ message: 'Submission created', submission });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/submissions/assignment/:assignmentId
// Instructor views all submissions for one of their assignments
const getSubmissionsForAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (req.user.role === 'instructor' && assignment.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/submissions/me
// Student views all their own submissions
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate('assignment', 'title dueDate')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PATCH /api/submissions/:id/review
// Instructor reviews a submission — adds feedback, marks as reviewed
const reviewSubmission = async (req, res) => {
  try {
    const { feedback } = req.body;
    const submission = await Submission.findById(req.params.id).populate('assignment');

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    if (submission.assignment.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only review submissions for your own assignments' });
    }

    submission.feedback = feedback || submission.feedback;
    submission.status = 'reviewed';
    await submission.save();

    res.json({ message: 'Submission reviewed', submission });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createSubmission,
  getSubmissionsForAssignment,
  getMySubmissions,
  reviewSubmission
};