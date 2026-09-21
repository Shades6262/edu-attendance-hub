const InstructorGroup = require('../../models/InstructorGroup');
const User = require('../../models/User');

// @route POST /api/groups
// Admin creates a group and assigns an instructor to it
const createGroup = async (req, res) => {
  try {
    const { name, instructorId } = req.body;

    if (!name || !instructorId) {
      return res.status(400).json({ message: 'Name and instructorId are required' });
    }

    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(400).json({ message: 'Invalid instructor' });
    }

    if (instructor.status !== 'approved') {
      return res.status(400).json({ message: 'Instructor is not approved yet' });
    }

    const group = await InstructorGroup.create({
      name,
      instructor: instructorId,
      students: []
    });

    res.status(201).json({ message: 'Group created', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/groups
// Admin sees all groups; instructor sees only their own
const getGroups = async (req, res) => {
  try {
    const filter = req.user.role === 'instructor' ? { instructor: req.user.id } : {};
    const groups = await InstructorGroup.find(filter)
      .populate('instructor', 'name email')
      .populate('students', 'name email barcodeId');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/groups/:id
const getGroupById = async (req, res) => {
  try {
    const group = await InstructorGroup.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('students', 'name email barcodeId');

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // instructors can only view their own group
    if (req.user.role === 'instructor' && group.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PATCH /api/groups/:id/add-student
const addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const group = await InstructorGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (req.user.role === 'instructor' && group.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }

    if (group.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already in this group' });
    }

    group.students.push(studentId);
    await group.save();

    // keep it two-way: also set this on the student for quick lookup
    student.instructorGroup = group._id;
    await student.save();

    res.json({ message: 'Student added', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PATCH /api/groups/:id/remove-student
const removeStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const group = await InstructorGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (req.user.role === 'instructor' && group.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    group.students = group.students.filter(s => s.toString() !== studentId);
    await group.save();

    const student = await User.findById(studentId);
    if (student && student.instructorGroup?.toString() === group._id.toString()) {
      student.instructorGroup = undefined;
      await student.save();
    }

    res.json({ message: 'Student removed', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route DELETE /api/groups/:id
const deleteGroup = async (req, res) => {
  try {
    const group = await InstructorGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // unassign all students from this group
    await User.updateMany({ instructorGroup: group._id }, { $unset: { instructorGroup: 1 } });

    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  addStudent,
  removeStudent,
  deleteGroup
};