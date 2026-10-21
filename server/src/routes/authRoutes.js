const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfilePicture, removeProfilePicture, upload } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile-picture', protect, upload.single('image'), updateProfilePicture);
router.delete('/profile-picture', protect, removeProfilePicture);

module.exports = router;