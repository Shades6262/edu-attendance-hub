const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'InstructorGroup', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

chatMessageSchema.index({ group: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);