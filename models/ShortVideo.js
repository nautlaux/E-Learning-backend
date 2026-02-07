const { Schema, model, Types } = require('mongoose');

const shortVideoSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    durationSeconds: { type: Number, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

shortVideoSchema.index({ organizationId: 1, isActive: 1, order: 1, createdAt: -1 });

module.exports = model('ShortVideo', shortVideoSchema);
