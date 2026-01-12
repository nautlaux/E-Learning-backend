const { Schema, model, Types } = require('mongoose');

const analyticsSummarySchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    period: { type: String, required: true }, // e.g., "2024-03"
    metrics: {
      totalCourses: { type: Number, default: 0 },
      totalStudents: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      couponsUsed: { type: Number, default: 0 },
      topCourse: {
        courseId: { type: Types.ObjectId, ref: 'Course' },
        title: { type: String },
        enrollments: { type: Number },
      },
      topSalesPerson: {
        salesUserId: { type: Types.ObjectId, ref: 'User' },
        name: { type: String },
        revenue: { type: Number },
      },
    },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

analyticsSummarySchema.index({ organizationId: 1, period: 1 }, { unique: true });

module.exports = model('AnalyticsSummary', analyticsSummarySchema);

