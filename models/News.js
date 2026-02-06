const { Schema, model, Types } = require('mongoose');

const newsSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    content: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

newsSchema.index({ organizationId: 1, createdAt: -1 });
newsSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = model('News', newsSchema);
