const { Schema, model, Types } = require('mongoose');

const enrollmentSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Types.ObjectId, ref: 'Course', required: true },
    couponId: { type: Types.ObjectId, ref: 'Coupon', default: null },
    soldBy: { type: Types.ObjectId, ref: 'User', default: null },
    finalPricePaid: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['ACTIVE', 'CANCELLED', 'REFUNDED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

module.exports = model('Enrollment', enrollmentSchema);

