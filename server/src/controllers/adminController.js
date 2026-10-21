const User = require('../../models/User');
const AiConversation = require('../../models/AiConversation');
const generateBarcodeId = require('../utils/generateBarcodeId');

// @route GET /api/admin/pending-users
const getPendingUsers = async (req, res) => {
  const pendingUsers = await User.find({ status: 'pending' }).select('-password');
  res.json(pendingUsers);
};

// @route PATCH /api/admin/approve/:id
const approveUser = async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;

  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ message: 'Invalid decision value' });
  }

  const updateData = { status: decision };

  if (decision === 'approved') {
    const existingUser = await User.findById(id);
    if (existingUser && !existingUser.barcodeId) {
      updateData.barcodeId = generateBarcodeId(existingUser.role);
    }
  }

  const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ message: `User ${decision}`, user });
};

// @route GET /api/admin/users?role=student&status=approved
const getAllUsers = async (req, res) => {
  const { role, status } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json(users);
};

// @route PATCH /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['student', 'instructor', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  // Prevent an admin from accidentally demoting/locking themselves out
  if (req.user.id === id) {
    return res.status(400).json({ message: 'You cannot change your own role' });
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ message: 'Role updated', user });
};

// @route PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  if (req.user.id === id) {
    return res.status(400).json({ message: 'You cannot change your own status' });
  }

  const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ message: 'Status updated', user });
};

// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.id === id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await AiConversation.deleteMany({ user: id });

  res.json({ message: 'User deleted' });
};

module.exports = {
  getPendingUsers,
  approveUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser
};