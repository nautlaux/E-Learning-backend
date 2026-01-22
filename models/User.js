const { Schema, model, Types } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: false, trim: true },
    email: { type: String, required: false, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES', 'USER'], required: true },
    mobile: { type: String,required: true, trim: true }, // phone login; uniqueness enforced per role below
    organizationId: { type: Types.ObjectId, ref: 'Organization', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// same mobile can exist across roles, but unique within a role
userSchema.index({ role: 1, mobile: 1 }, { unique: true, sparse: true });

module.exports = model('User', userSchema);

