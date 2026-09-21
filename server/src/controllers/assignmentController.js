const Assignment = require('../../models/Assignment');
const InstructorGroup = require('../../models/InstructorGroup');
const User = require('../../models/User');

// @route POST /api/assignments
// Instructor posts an assignment to one of their groups
const createAssignment = async (req, res) => {
  try {
    const { title, description, groupId, dueDate } = req.body;

    if (!title || !description || !groupId) {
      return res.status(400).json({ message: 'Title, description, and groupId are required' });
    }

    const group = await InstructorGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only post assignments to your own group' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      instructor: req.user.id,
      group: groupId,
      dueDate
    });

    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/assignments
// Student sees assignments for their own group.
// Instructor sees assignments they've posted.
// Admin sees everything.
const getAssignments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id);
      if (!student.instructorGroup) {
        return res.json([]); // not in a group yet, nothing to show
      }
      filter = { group: student.instructorGroup };
    } else if (req.user.role === 'instructor') {
      filter = { instructor: req.user.id };
    }
    // admin: no filter, sees all

    const assignments = await Assignment.find(filter)
      .populate('instructor', 'name email')
      .populate('group', 'name')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/assignments/:id
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('group', 'name students');

    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // scoping check: student must belong to the assignment's group
    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id);
      if (!student.instructorGroup || student.instructorGroup.toString() !== assignment.group._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // instructor can only view their own assignment
    if (req.user.role === 'instructor' && assignment.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PATCH /api/assignments/:id
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (assignment.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own assignments' });
    }

    const { title, description, dueDate } = req.body;
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;

    await assignment.save();
    res.json({ message: 'Assignment updated', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route DELETE /api/assignments/:id
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (assignment.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
};