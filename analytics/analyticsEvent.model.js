const { Schema, model, Types } = require('mongoose');

const analyticsEventSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Types.ObjectId, ref: 'User', default: null },
    role: { type: String, enum: ['ORG_ADMIN', 'SALES', 'USER'], required: true },
    eventType: {
      type: String,
      enum: [
        'COURSE_VIEW',
        'COURSE_PUBLISH',
        'COURSE_PURCHASE',
        'COUPON_APPLIED',
        'LESSON_START',
        'LESSON_COMPLETE',
        'LOGIN',
      ],
      required: true,
    },
    metadata: {
      courseId: { type: Types.ObjectId, ref: 'Course' },
      couponId: { type: Types.ObjectId, ref: 'Coupon' },
      pricePaid: { type: Number },
      soldBy: { type: Types.ObjectId, ref: 'User' }, // SALES user
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

analyticsEventSchema.index({ organizationId: 1, createdAt: -1 });
analyticsEventSchema.index({ eventType: 1 });
analyticsEventSchema.index({ 'metadata.courseId': 1 });
analyticsEventSchema.index({ 'metadata.soldBy': 1 });

module.exports = model('AnalyticsEvent', analyticsEventSchema);

