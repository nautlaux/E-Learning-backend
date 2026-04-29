const { Schema, model, Types } = require('mongoose');

const chatRoomMembershipSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, index: true },
    roomId: { type: Types.ObjectId, ref: 'ChatRoom', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },

    // When user clicks "Join", we store that time.
    joinedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

chatRoomMembershipSchema.index({ organizationId: 1, roomId: 1, userId: 1 }, { unique: true });

module.exports = model('ChatRoomMembership', chatRoomMembershipSchema);

