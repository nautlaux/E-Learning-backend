const mongoose = require('mongoose');
const { Schema } = mongoose;

const dailyAnalyticsSchema = new Schema(
  {
    date: { type: String, required: true, trim: true }, // YYYY-MM-DD
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    event_name: { type: String, required: true, trim: true },
    // Optional dimension derived from `parameters` (e.g. screen_name, short_id, course_id)
    // We keep it as key/value to stay scalable (avoid storing full parameters).
    param_key: { type: String, default: '', trim: true },
    param_value: { type: String, default: '', trim: true },
    total_count: { type: Number, default: 0 },
    unique_users_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

dailyAnalyticsSchema.index(
  { organizationId: 1, event_name: 1, date: 1, param_key: 1, param_value: 1 },
  { unique: true }
);

module.exports = mongoose.models.DailyAnalytics || mongoose.model('DailyAnalytics', dailyAnalyticsSchema);

