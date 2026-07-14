const { Schema, model, Types } = require('mongoose');

const assistantConversationSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New chat', trim: true },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastMessagePreview: { type: String, default: '', trim: true },
    messageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

assistantConversationSchema.index({ userId: 1, lastMessageAt: -1 });
assistantConversationSchema.index({ organizationId: 1, userId: 1, lastMessageAt: -1 });

module.exports = model('AssistantConversation', assistantConversationSchema);
