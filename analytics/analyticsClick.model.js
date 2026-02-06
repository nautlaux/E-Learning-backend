const { Schema, model, Types } = require('mongoose');

const analyticsClickSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Types.ObjectId, ref: 'User', default: null },
    screenName: { type: String, required: true, trim: true },
    sectionKey: { type: String, default: '', trim: true },
    xPercent: { type: Number, required: true },
    yPercent: { type: Number, required: true },
    viewportWidth: { type: Number, default: null },
    viewportHeight: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

analyticsClickSchema.index({ organizationId: 1, screenName: 1, sectionKey: 1, createdAt: -1 });

module.exports = model('AnalyticsClick', analyticsClickSchema);
