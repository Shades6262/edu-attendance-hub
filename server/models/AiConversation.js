const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const aiConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Chat'
  },
  messages: {
    type: [messageSchema],
    default: [],
    validate: [
      function(val) {
        return val.length <= 200;
      },
      'Conversation has reached the maximum limit of 200 messages.'
    ]
  }
}, { timestamps: true });

aiConversationSchema.index({ user: 1, updatedAt: -1 });
aiConversationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('AiConversation', aiConversationSchema);
