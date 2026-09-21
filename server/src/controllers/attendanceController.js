const User = require('../../models/User');
const Attendance = require('../../models/Attendance');

// helper: get today's date as "YYYY-MM-DD"
const getTodayString = () => new Date().toISOString().split('T')[0];

// @route POST /api/attendance/scan
// Body: { barcodeId: "STU-4F9A21C3" }
// This single endpoint handles BOTH sign-in and sign-out based on current state
const scanAttendance = async (req, res) => {
  try {
    const { barcodeId } = req.body;
    console.log('--- SCAN REQUEST ---');
    console.log('barcodeId:', barcodeId);

    if (!barcodeId) {
      return res.status(400).json({ message: 'Barcode ID is required' });
    }

    const user = await User.findOne({ barcodeId });
    if (!user) {
      return res.status(404).json({ message: 'Invalid barcode — user not found' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ message: 'User is not an approved account' });
    }

    const today = getTodayString();
    console.log('today:', today);

    let record = await Attendance.findOne({ user: user._id, date: today });
    console.log('existing record found:', record);

    if (!record) {
      record = await Attendance.create({
        user: user._id,
        date: today,
        signInTime: new Date()
      });
      console.log('CREATED NEW RECORD (sign-in):', record);
      return res.status(201).json({
        message: `Signed in: ${user.name}`,
        action: 'sign-in',
        record
      });
    }

    if (record.signInTime && !record.signOutTime) {
      record.signOutTime = new Date();
      await record.save();
      console.log('UPDATED RECORD (sign-out):', record);
      return res.status(200).json({
        message: `Signed out: ${user.name}`,
        action: 'sign-out',
        record
      });
    }

    return res.status(400).json({
      message: `${user.name} has already completed attendance for today`,
      record
    });
  } catch (err) {
    console.log('SCAN ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/attendance/me
const getMyAttendance = async (req, res) => {
  const records = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
  res.json(records);
};

// @route GET /api/attendance/user/:userId  (admin/instructor view)
const getUserAttendance = async (req, res) => {
  const { userId } = req.params;
  const records = await Attendance.find({ user: userId }).sort({ date: -1 });
  res.json(records);
};

// @route GET /api/attendance/all?date=YYYY-MM-DD  (admin view of everyone for a given day)
const getAllAttendanceByDate = async (req, res) => {
  const date = req.query.date || getTodayString();
  const records = await Attendance.find({ date }).populate('user', 'name email role');
  res.json(records);
};

module.exports = {
  scanAttendance,
  getMyAttendance,
  getUserAttendance,
  getAllAttendanceByDate
};