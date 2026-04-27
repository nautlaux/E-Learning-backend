const { Schema, model, Types } = require('mongoose');

const chatMessageSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, index: true },
    roomId: { type: Types.ObjectId, ref: 'ChatRoom', required: true, index: true },

    senderUserId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    senderName: { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatMessageSchema.index({ organizationId: 1, roomId: 1, createdAt: -1 });

module.exports = model('ChatMessage', chatMessageSchema);

