const bcrypt = require('bcryptjs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const User = require('../../models/User');
const AiConversation = require('../../models/AiConversation');
const generateToken = require('../utils/generateToken');
const generateBarcodeId = require('../utils/generateBarcodeId');
const { sendVerificationEmail } = require('./emailAuthController');

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const upload = multer({ storage: multer.memoryStorage() });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  barcodeId: user.barcodeId,
  instructorGroup: user.instructorGroup,
  profilePictureUrl: user.profilePictureUrl,
});

// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      emailVerified: false,
      barcodeId: role === 'student' ? generateBarcodeId(role) : undefined,
    });

    // Nobody is logged in at registration anymore: they must verify their email first.
    // (Instructors/admins also still need admin approval after verifying.)
    let emailSent = true;
    try {
      await sendVerificationEmail(user);
    } catch (e) {
      emailSent = false;
      console.error('Verification email failed:', e.message);
    }

    return res.status(201).json({
      message: emailSent
        ? 'Account created. Check your email (and spam folder) to verify your address before logging in.'
        : 'Account created, but we could not send the verification email. Use "Resend verification" from the login page.',
      needsVerification: true,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.password) {
      return res.status(400).json({
        message: 'This account uses Google sign-in. Use "Continue with Google".',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Account access denied' });
    }

    const token = generateToken(user);
    res.status(200).json({ token, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PUT /api/auth/profile-picture
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ message: 'Cloudinary is not configured on the server. Please check environment variables.' });
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'eduattendance_profiles' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePictureUrl: result.secure_url },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile picture updated successfully',
      user: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading image', error: err.message });
  }
};

// @route DELETE /api/auth/profile-picture
const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePictureUrl: '' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile picture removed successfully',
      user: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error removing image', error: err.message });
  }
};

// @route DELETE /api/auth/account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await AiConversation.deleteMany({ user: userId });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { registerUser, loginUser, updateProfilePicture, removeProfilePicture, deleteAccount, upload };