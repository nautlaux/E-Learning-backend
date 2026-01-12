const { Course, Lesson } = require('../models');
const paginate = require('../utils/pagination');

const getCourses = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await paginate(Course, {
      page,
      limit,
      sort: { createdAt: -1 },
      projection: {
        title: 1,
        description: 1,
        basePrice: 1,
        isPublished: 1,
        organizationId: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });
    return res.json(result);
  } catch (err) {
    console.error('getCourses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lessons = await Lesson.find({ courseId })
      .sort({ chapterOrder: 1, order: 1 })
      .lean();

    return res.json({ ...course, lessons });
  } catch (err) {
    console.error('getCourseById error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getCourses, getCourseById };

