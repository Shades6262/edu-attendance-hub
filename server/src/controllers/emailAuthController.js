const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const sendEmail = require('../utils/sendEmail');
const { verifyEmailTemplate, resetPasswordTemplate } = require('../utils/emailTemplates');
const { createToken, hashToken } = require('../utils/tokens');

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

const findByEmail = (email) =>
  User.findOne({ email }).collation({ locale: 'en', strength: 2 }); // case-insensitive

// reused by registerUser and resend
const sendVerificationEmail = async (user) => {
  const { raw, hash } = createToken();
  user.verificationTokenHash = hash;
  user.verificationTokenExpires = new Date(Date.now() + VERIFY_TTL_MS);
  await user.save();

  const link = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your EduHub email',
    html: verifyEmailTemplate(user.name, link),
  });
};

// @route POST /api/auth/verify-email   Body: { token }
// POST (not GET) so email link scanners can't use up the token
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (typeof token !== 'string' || !token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationTokenHash: hashToken(token),
      verificationTokenExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'This verification link is invalid or has expired.' });
    }

    user.emailVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/resend-verification   Body: { email }
const resendVerification = async (req, res) => {
  const generic = { message: 'If that account exists and is unverified, a new link has been sent.' };
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || !email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await findByEmail(email);
    if (user && !user.emailVerified) {
      try {
        await sendVerificationEmail(user);
      } catch (e) {
        console.error('Resend verification failed:', e.message);
      }
    }
    res.json(generic);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/forgot-password   Body: { email }
const forgotPassword = async (req, res) => {
  const generic = { message: 'If an account exists for that email, a reset link has been sent.' };
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || !email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await findByEmail(email);
    if (user) {
      try {
        const { raw, hash } = createToken();
        user.resetTokenHash = hash;
        user.resetTokenExpires = new Date(Date.now() + RESET_TTL_MS);
        await user.save();

        const link = `${process.env.CLIENT_URL}/reset-password?token=${raw}`;
        await sendEmail({
          to: user.email,
          subject: 'Reset your EduHub password',
          html: resetPasswordTemplate(user.name, link),
        });
      } catch (e) {
        console.error('Forgot password email failed:', e.message);
      }
    }
    // same response whether or not the account exists
    res.json(generic);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/reset-password   Body: { token, password }
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== 'string' || !token || typeof password !== 'string') {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetTokenHash: hashToken(token),
      resetTokenExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    user.emailVerified = true; // they just proved they own this inbox
    await user.save();

    res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { sendVerificationEmail, verifyEmail, resendVerification, forgotPassword, resetPassword };