const { Schema, model, Types } = require('mongoose');

const chatRoomSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

chatRoomSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

module.exports = model('ChatRoom', chatRoomSchema);

