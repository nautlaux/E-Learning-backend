const { Schema, model, Types } = require('mongoose');

const freeVideoSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    durationSeconds: { type: Number, default: null },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

freeVideoSchema.index({ organizationId: 1, createdAt: -1 });
freeVideoSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = model('FreeVideo', freeVideoSchema);

