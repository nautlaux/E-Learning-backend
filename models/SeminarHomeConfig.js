const { Schema, model, Types } = require('mongoose');

const seminarHomeConfigSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    achievements: { type: [String], default: [] },
    whatsapp_message: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

seminarHomeConfigSchema.index({ organizationId: 1 }, { unique: true });

module.exports = model('SeminarHomeConfig', seminarHomeConfigSchema);

