const { Schema, model } = require('mongoose');

/**
 * Install source tracking for mobile app.
 * Public endpoint: /api/analytics/log-install
 */
const analyticsInstallSchema = new Schema(
  {
    // When the app called the API (client timestamp)
    timestamp: { type: Date, required: true },
    // Raw attribution payload from the app (installer_store, utm_*, etc.)
    parameters: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

analyticsInstallSchema.index({ timestamp: -1 });

module.exports = model('AnalyticsInstall', analyticsInstallSchema);

