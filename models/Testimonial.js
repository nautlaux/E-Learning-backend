const { Schema, model, Types } = require('mongoose');

const testimonialSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    imageUrl: { type: String, default: '', trim: true },
    videoUrl: { type: String, default: '', trim: true },
    title: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

testimonialSchema.index({ organizationId: 1, isActive: 1, createdAt: -1 });

module.exports = model('Testimonial', testimonialSchema);

