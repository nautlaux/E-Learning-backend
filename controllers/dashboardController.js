const { CtoBanner, Course, Enrollment, Progress, FreeVideo } = require('../models');

/**
 * Single dashboard API: banners (CAROUSEL + INLINE), most popular courses,
 * recommended courses, and continue (start from where you left) with progress.
 */
const getDashboard = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.userId;

    if (!organizationId) {
      return res.status(400).json({ message: 'User organization not found' });
    }

    const baseFilter = { organizationId, isActive: true };
    const courseFilter = { organizationId, isPublished: true };

    // 1) Banners: CAROUSEL and INLINE separately (single query, split by type)
    const banners = await CtoBanner.find({ ...baseFilter, type: { $in: ['CAROUSEL', 'INLINE'] } })
      .sort({ createdAt: -1 })
      .lean();
    console.log('banners', banners);
    const carouselBanners = banners.filter((b) => b.type === 'CAROUSEL');
    const inlineBanners = banners.filter((b) => b.type === 'INLINE');

    // 2) Most Popular Courses (by active enrollment count, org-scoped; exclude already enrolled)
    const enrolledByUser =
      userId ? await Enrollment.find({ userId, status: 'ACTIVE' }).distinct('courseId') : [];
    const enrolledSet = new Set(enrolledByUser.map((id) => String(id)));

    const popularCourseIds = await Enrollment.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      { $match: { 'course.organizationId': organizationId, 'course.isPublished': true } },
      { $group: { _id: '$courseId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 1 } },
    ]).then((ids) => ids.map((x) => x._id));

    const popularIdsExcludingEnrolled = popularCourseIds.filter((id) => !enrolledSet.has(String(id)));

    let popularCourses;
    if (popularIdsExcludingEnrolled.length) {
      popularCourses = await Course.find({
        _id: { $in: popularIdsExcludingEnrolled },
        ...courseFilter,
      })
        .lean()
        .then((courses) => {
          const byId = new Map(courses.map((c) => [String(c._id), c]));
          return popularIdsExcludingEnrolled
            .map((id) => byId.get(String(id)))
            .filter(Boolean);
        });
    } else {
      // Fallback: no popular left after excluding enrolled — show published courses not enrolled, latest first
      const excludeIds = enrolledByUser.length ? { _id: { $nin: enrolledByUser } } : {};
      popularCourses = await Course.find({ ...courseFilter, ...excludeIds })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    }

    // 3) Recommended Courses (published, not in "continue", limit)
    const continueCourseIds = userId
      ? await Progress.find({ userId }).distinct('courseId')
      : [];
    const recommendedFilter = {
      ...courseFilter,
      ...(continueCourseIds.length && userId
        ? { _id: { $nin: continueCourseIds } }
        : {}),
    };
    const recommendedCourses = await Course.find(recommendedFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 4) Start from where you left (with progress bar)
    let continueCourses = [];
    if (userId) {
      console.log('userId----->', userId);
      const progressList = await Progress.find({ userId })
        .sort({ updatedAt: -1 })
        .lean();
      console.log('progressList----->', progressList);
      const courseIds = progressList.map((p) => p.courseId);
      const courses = await Course.find({
        _id: { $in: courseIds },
        ...courseFilter,
      }).lean();
      console.log('courses----->', courses);
      const courseMap = new Map(courses.map((c) => [String(c._id), c]));
      continueCourses = progressList
        .map((p) => {
          const course = courseMap.get(String(p.courseId));
          if (!course) return null;
          return {
            ...course,
            completionPercentage: p.completionPercentage ?? 0,
            progressUpdatedAt: p.updatedAt,
          };
        })
        .filter(Boolean);
    }

    // 5 Free videos
    const freeVideos = await FreeVideo.find({ organizationId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Popup Banner hardcoded
    const popupBanner = {
      title: 'Welcome to the dashboard',
      description: 'This is a popup banner',
      imageUrl: 'https://png.pngtree.com/png-clipart/20220404/original/pngtree-supper-sale-discount-shopping-pop-up-banner-png-image_7515944.png',
      link: 'https://www.google.com',
    };

    return res.json({
      banners: {
        carousel: carouselBanners,
        inline: inlineBanners,
        popup: popupBanner,
      },
      mostPopularCourses: popularCourses,
      recommendedCourses,
      continueCourses,
      freeVideos,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getDashboard };
