const AnalyticsEvent = require('./analyticsEvent.model');
const AnalyticsSummary = require('./analyticsSummary.model');
const AnalyticsClick = require('./analyticsClick.model');
const AnalyticsLogEvent = require('./analyticsLogEvent.model');
const AnalyticsInstall = require('./analyticsInstall.model');
const analyticsService = require('./analytics.service');

module.exports = {
  AnalyticsEvent,
  AnalyticsSummary,
  AnalyticsClick,
  AnalyticsLogEvent,
  AnalyticsInstall,
  analyticsService,
};

