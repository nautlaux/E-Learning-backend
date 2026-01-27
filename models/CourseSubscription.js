const { Schema, model, Types } = require('mongoose');

const courseSubscriptionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Types.ObjectId, ref: 'Course', required: true },
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    subscribedBy: { type: Types.ObjectId, ref: 'User', required: true }, // salesman who created subscription
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'], 
      default: 'ACTIVE' 
    },
    notes: { type: String, default: '' }, // optional notes from salesman
  },
  { timestamps: true }
);

// Index for efficient querying
courseSubscriptionSchema.index({ userId: 1, courseId: 1 });
courseSubscriptionSchema.index({ organizationId: 1, status: 1 });
courseSubscriptionSchema.index({ endDate: 1 }); // for expiry checks

// Virtual to check if subscription is currently valid
courseSubscriptionSchema.virtual('isValid').get(function() {
  return this.status === 'ACTIVE' && new Date() <= this.endDate;
});

module.exports = model('CourseSubscription', courseSubscriptionSchema);
