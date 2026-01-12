const { Schema, model, Types } = require('mongoose');

const couponSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
    value: { type: Number, required: true, min: 0 },
    courseId: { type: Types.ObjectId, ref: 'Course', default: null },
    assignedTo: { type: Types.ObjectId, ref: 'User', default: null },
    isStackable: { type: Boolean, default: false }, // whether this coupon can combine with others
    usageLimit: { type: Number, required: true, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiryAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Coupon', couponSchema);

