const { Schema, model, Types } = require('mongoose');

const assistantMessageSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, index: true },
    conversationId: { type: Types.ObjectId, ref: 'AssistantConversation', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

assistantMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = model('AssistantMessage', assistantMessageSchema);
