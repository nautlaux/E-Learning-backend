const { Schema, model, Types } = require('mongoose');

const notificationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '' },
    source: {
      type: String,
      enum: ['ADMIN_PANEL', 'FIREBASE', 'CUSTOM'],
      default: 'CUSTOM',
    },
    read: { type: Boolean, default: false },
    linkUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = model('Notification', notificationSchema);
