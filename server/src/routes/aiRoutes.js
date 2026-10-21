const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiRateLimit = require('../middleware/aiRateLimit');
const {
  chat,
  getConversations,
  getConversationById,
  renameConversation,
  deleteConversation,
  deleteAllConversations
} = require('../controllers/aiController');

router.post('/chat', protect, aiRateLimit, chat);
router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, getConversationById);
router.patch('/conversations/:id', protect, renameConversation);
router.delete('/conversations/:id', protect, deleteConversation);
router.delete('/conversations', protect, deleteAllConversations);

module.exports = router;
