const { Schema, model, Types } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: false, trim: true },
    email: { type: String, required: false, lowercase: true, trim: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES', 'USER'], required: true },
    mobile: { type: String,required: true, trim: true }, // phone login; uniqueness enforced per role below
    organizationId: { type: Types.ObjectId, ref: 'Organization', default: null },
    avatarUrl: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
    // Last known FCM token for push notifications
    fcmToken: { type: String, default: '', trim: true },
    device_id: { type: String, default: '', trim: true },
    // User interest: 'import', 'export', or 'both' (optional)
    interestedIn: { type: String, enum: ['import', 'export', 'both', ''], default: '' },
  },
  { timestamps: true }
);

// same mobile can exist across roles, but unique within a role
userSchema.index({ role: 1, mobile: 1 }, { unique: true, sparse: true });
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $exists: true, $ne: null } },
  }
);


module.exports = model('User', userSchema);

