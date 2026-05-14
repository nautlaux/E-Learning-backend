const { CourseSubscription, PlatformPremiumAccess } = require('../models');

/**
 * Users who are "premium" right now: active course subscription window OR active dashboard platform grant.
 */
async function distinctUserIdsWithActivePremium(userIds, now = new Date()) {
  if (!userIds || !userIds.length) {
    return new Set();
  }
  const filter = {
    userId: { $in: userIds },
    status: 'ACTIVE',
    startDate: { $lte: now },
    endDate: { $gte: now },
  };
  const [fromCourses, fromPlatform] = await Promise.all([
    CourseSubscription.distinct('userId', filter),
    PlatformPremiumAccess.distinct('userId', filter),
  ]);
  return new Set([...fromCourses, ...fromPlatform].map((id) => String(id)));
}

module.exports = { distinctUserIdsWithActivePremium };
