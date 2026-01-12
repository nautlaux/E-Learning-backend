const { Schema, model, Types } = require('mongoose');

const teacherSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    expertise: { type: String, default: '' },
    bio: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    userId: { type: Types.ObjectId, ref: 'User', default: null }, // optional link to user auth if needed
  },
  { timestamps: true }
);

teacherSchema.index({ organizationId: 1, name: 1 }, { unique: true });

module.exports = model('Teacher', teacherSchema);

