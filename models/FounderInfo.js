const { Schema, model, Types } = require('mongoose');

const founderInfoSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, default: '', trim: true },
    designation: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true },
    videoUrl: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

founderInfoSchema.index({ organizationId: 1 }, { unique: true });

module.exports = model('FounderInfo', founderInfoSchema);

