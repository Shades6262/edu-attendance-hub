const { askGemini, GeminiError } = require('../utils/geminiService');
const AiConversation = require('../../models/AiConversation');
const mongoose = require('mongoose');

const MAX_CONTEXT_MESSAGES = 12; // recent context for Gemini
const MAX_CHARS = 2000;          // per message
const MAX_CONVERSATIONS = 50;    // per user
const MAX_TOTAL_MESSAGES = 200;  // per conversation

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route POST /api/ai/chat
// Body: { conversationId (optional), message }
const chat = async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    const cleanedMessage = message.trim().slice(0, MAX_CHARS);
    let conversation;

    if (conversationId) {
      if (!isValidObjectId(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID' });
      }
      conversation = await AiConversation.findOne({ _id: conversationId, user: req.user.id });
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      if (conversation.messages.length >= MAX_TOTAL_MESSAGES) {
        return res.status(400).json({ message: 'This chat is full, start a new one' });
      }
    } else {
      const count = await AiConversation.countDocuments({ user: req.user.id });
      if (count >= MAX_CONVERSATIONS) {
        const oldest = await AiConversation.findOne({ user: req.user.id }).sort({ updatedAt: 1 });
        if (oldest) {
          await AiConversation.findByIdAndDelete(oldest._id);
        }
      }

      const title = cleanedMessage.length > 60 ? cleanedMessage.substring(0, 57) + '...' : cleanedMessage;
      conversation = await AiConversation.create({
        user: req.user.id,
        title,
        messages: []
      });
    }

    const recentMessages = conversation.messages.slice(-MAX_CONTEXT_MESSAGES).map((m) => ({
      role: m.role,
      content: m.content
    }));

    const geminiContext = [...recentMessages, { role: 'user', content: cleanedMessage }];

    const reply = await askGemini({ role: req.user.role, messages: geminiContext });

    conversation.messages.push({ role: 'user', content: cleanedMessage, createdAt: new Date() });
    conversation.messages.push({ role: 'model', content: reply, createdAt: new Date() });
    await conversation.save();

    res.json({
      conversationId: conversation._id,
      title: conversation.title,
      reply
    });
  } catch (err) {
    if (err instanceof GeminiError) {
      return res.status(err.status).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/ai/conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await AiConversation.find({ user: req.user.id })
      .select('_id title updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/ai/conversations/:id
const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const conversation = await AiConversation.findOne({ _id: id, user: req.user.id });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PATCH /api/ai/conversations/:id
const renameConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    if (!title || typeof title !== 'string' || !title.trim() || title.trim().length > 80) {
      return res.status(400).json({ message: 'Title must be between 1 and 80 characters' });
    }

    const conversation = await AiConversation.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { title: title.trim() },
      { new: true }
    ).select('_id title updatedAt createdAt');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation renamed', conversation });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route DELETE /api/ai/conversations/:id
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const conversation = await AiConversation.findOneAndDelete({ _id: id, user: req.user.id });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route DELETE /api/ai/conversations
const deleteAllConversations = async (req, res) => {
  try {
    await AiConversation.deleteMany({ user: req.user.id });
    res.json({ message: 'All conversations deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  chat,
  getConversations,
  getConversationById,
  renameConversation,
  deleteConversation,
  deleteAllConversations
};
