const { User, Enrollment, Progress, QuizAttempt } = require('../models');

const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [activeCourses, completedCourses, quizzesTaken] = await Promise.all([
      Enrollment.countDocuments({ userId, status: 'ACTIVE' }),
      Progress.countDocuments({ userId, completionPercentage: 100 }),
      QuizAttempt.countDocuments({ userId }),
    ]);

    const profile = {
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      email: user.email ?? '',
      avatarUrl: user.avatarUrl ?? '',
      stats: {
        activeCourses,
        completedCourses,
        quizzesTaken,
      },
    };

    return res.json(profile);
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, email, avatarUrl } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (email !== undefined) updates.email = String(email).toLowerCase().trim();
    if (avatarUrl !== undefined) updates.avatarUrl = String(avatarUrl).trim();

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [activeCourses, completedCourses, quizzesTaken] = await Promise.all([
      Enrollment.countDocuments({ userId, status: 'ACTIVE' }),
      Progress.countDocuments({ userId, completionPercentage: 100 }),
      QuizAttempt.countDocuments({ userId }),
    ]);

    const profile = {
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      email: user.email ?? '',
      avatarUrl: user.avatarUrl ?? '',
      stats: { activeCourses, completedCourses, quizzesTaken },
    };

    return res.json(profile);
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getProfile, updateProfile };
