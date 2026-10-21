const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPresetMessages, getMessages, sendMessage } = require('../controllers/chatController');

router.get('/preset-messages', protect, getPresetMessages);
router.get('/:groupId', protect, getMessages);
router.post('/:groupId', protect, sendMessage);

module.exports = router;