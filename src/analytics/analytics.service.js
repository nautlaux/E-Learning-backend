const AnalyticsEvent = require('./analyticsEvent.model');
const AnalyticsSummary = require('./analyticsSummary.model');
const paginate = require('../utils/pagination');

const recordEvent = async (payload) => {
  return AnalyticsEvent.create(payload);
};

const listEvents = async ({ filter = {}, page = 1, limit = 20, sort = { createdAt: -1 } }) => {
  return paginate(AnalyticsEvent, { filter, page, limit, sort });
};

const upsertSummary = async ({ organizationId, period, metrics, generatedAt = new Date() }) => {
  if (!organizationId || !period) {
    throw new Error('organizationId and period are required');
  }
  return AnalyticsSummary.findOneAndUpdate(
    { organizationId, period },
    { $set: { metrics, generatedAt } },
    { upsert: true, new: true }
  );
};

const getSummary = async ({ organizationId, period }) => {
  const filter = {};
  if (organizationId) filter.organizationId = organizationId;
  if (period) filter.period = period;
  return AnalyticsSummary.find(filter).sort({ period: -1 });
};

module.exports = {
  recordEvent,
  listEvents,
  upsertSummary,
  getSummary,
};

