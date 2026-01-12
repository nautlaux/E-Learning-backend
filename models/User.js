const { Schema, model, Types } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES', 'USER'], required: true },
    organizationId: { type: Types.ObjectId, ref: 'Organization', default: null },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);

