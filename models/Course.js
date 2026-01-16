const { Schema, model, Types } = require('mongoose');

const courseSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model('Course', courseSchema);

