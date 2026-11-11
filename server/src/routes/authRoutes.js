const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfilePicture, removeProfilePicture, deleteAccount, upload } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { googleAuth } = require('../controllers/googleAuthController');
const makeLimiter = require('../middleware/rateLimit');
const {
  verifyEmail, resendVerification, forgotPassword, resetPassword,
} = require('../controllers/emailAuthController');

const emailLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyFn: (req) => `${req.ip}:${String(req.body?.email || '').toLowerCase()}`,
  message: 'Too many requests. Please wait a few minutes and try again.',
});

router.post('/google', googleAuth);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile-picture', protect, upload.single('image'), updateProfilePicture);
router.delete('/profile-picture', protect, removeProfilePicture);
router.delete('/account', protect, deleteAccount);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', emailLimiter, resendVerification);
router.post('/forgot-password', emailLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;