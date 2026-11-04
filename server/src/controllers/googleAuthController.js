const { auth } = require('../../config/firebaseAdmin');
const User = require('../../models/User');
const generateToken = require('../utils/generateToken');
const generateBarcodeId = require('../utils/generateBarcodeId');

// keep this identical to the user object your loginUser returns
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

const VALID_ROLES = ['student', 'instructor', 'admin'];

// @route POST /api/auth/google
// Body: { idToken, role? }  (role is only sent from the Register page)
const googleAuth = async (req, res) => {
  try {
    const { idToken, role } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch (verifyErr) {
      console.error('verifyIdToken failed:', verifyErr.code, verifyErr.message);
      return res.status(401).json({ message: 'Invalid or expired Google sign-in. Please try again.' });
    }

    // only accept real Google sign-ins with a verified email
    if (decoded.firebase?.sign_in_provider !== 'google.com') {
      return res.status(400).json({ message: 'Unsupported sign-in method' });
    }
    if (!decoded.email || !decoded.email_verified) {
      return res.status(403).json({ message: 'Your Google email is not verified' });
    }

    const email = decoded.email.toLowerCase();

    let user =
      (await User.findOne({ googleUid: decoded.uid })) ||
      (await User.findOne({ email }).collation({ locale: 'en', strength: 2 })); // case-insensitive

    if (user) {
      // link an existing email/password account the first time it uses Google
      if (!user.googleUid) {
        user.googleUid = decoded.uid;
        await user.save();
      } else if (user.googleUid !== decoded.uid) {
        return res.status(409).json({ message: 'This email is linked to a different Google account' });
      }
    } else {
      // no account yet: only create one when the client sent a role (Register page)
      if (!role) {
        return res.status(404).json({
          message: 'No account found for this Google email. Please sign up first.',
        });
      }
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      user = await User.create({
        name: decoded.name || email.split('@')[0],
        email,
        role,
        googleUid: decoded.uid,
        profilePictureUrl: decoded.picture || undefined,
        barcodeId: role === 'student' ? generateBarcodeId(role) : undefined,
      });

      // new instructors/admins are pending, same as normal registration
      if (user.status === 'pending') {
        return res.status(201).json({
          message: 'Registration successful. Awaiting admin approval.',
          status: user.status,
        });
      }
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Account access denied' });
    }

    res.status(200).json({ token: generateToken(user), user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { googleAuth };