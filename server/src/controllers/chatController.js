const ChatMessage = require('../../models/ChatMessage');
const InstructorGroup = require('../../models/InstructorGroup');
const User = require('../../models/User');
const PRESET_MESSAGES = require('../utils/presetMessages');

// helper: confirm the requesting user actually belongs to this group
// (as the instructor, or as a member student)
const userBelongsToGroup = async (user, group) => {
  if (user.role === 'admin') return true;
  if (user.role === 'instructor') return group.instructor.toString() === user.id;
  if (user.role === 'student') {
    const student = await User.findById(user.id);
    return student.instructorGroup?.toString() === group._id.toString();
  }
  return false;
};

// @route GET /api/chat/preset-messages
const getPresetMessages = (req, res) => {
  res.json(PRESET_MESSAGES);
};

// @route GET /api/chat/:groupId
const getMessages = async (req, res) => {
  try {
    const group = await InstructorGroup.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const allowed = await userBelongsToGroup(req.user, group);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });

    const messages = await ChatMessage.find({ group: req.params.groupId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 })
      .limit(100); // simple cap — keeps this lightweight, no need for real pagination here

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/chat/:groupId
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const group = await InstructorGroup.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const allowed = await userBelongsToGroup(req.user, group);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });

    // students are restricted to the preset list — enforced server-side,
    // not just hidden in the UI, so this can't be bypassed via direct API calls
    if (req.user.role === 'student' && !PRESET_MESSAGES.includes(content)) {
      return res.status(400).json({ message: 'Students can only send preset messages' });
    }

    const message = await ChatMessage.create({
      group: req.params.groupId,
      sender: req.user.id,
      content,
    });

    const populated = await message.populate('sender', 'name role');
    res.status(201).json({ message: 'Sent', chatMessage: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getPresetMessages, getMessages, sendMessage };