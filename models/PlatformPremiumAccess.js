const { Schema, model, Types } = require('mongoose');

const platformPremiumAccessSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Types.ObjectId, ref: 'Organization', default: null },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'CANCELLED'],
      default: 'ACTIVE',
    },
    grantedBy: { type: Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

platformPremiumAccessSchema.index({ userId: 1, status: 1 });
platformPremiumAccessSchema.index({ organizationId: 1, status: 1 });
platformPremiumAccessSchema.index({ endDate: 1 });

module.exports = model('PlatformPremiumAccess', platformPremiumAccessSchema);
