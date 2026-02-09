const express = require('express');
const teacherRoutes = require('./teachers');
const courseRoutes = require('./courses');
const freeVideoRoutes = require('./freeVideos');
const ctoBannerRoutes = require('./ctoBanners');
const quizRoutes = require('./quizzes');
const authRoutes = require('./auth');
const salesRoutes = require('./sales');
const subscriptionRoutes = require('./subscriptions');
const dashboardRoutes = require('./dashboard');
const progressRoutes = require('./progress');
const analyticsRoutes = require('./analytics');
const newsRoutes = require('./news');
const userRoutes = require('./user');
const notificationRoutes = require('./notifications');
const appModuleRoutes = require('./appModules');
const shortVideoRoutes = require('./shortVideos');
const { logInstall } = require('../controllers/analyticsController');
const authenticate = require('../middlewares/auth');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Public routes (no auth required)
router.use('/auth', authRoutes);
router.post('/analytics/log-install', logInstall);
router.use('/app-modules', appModuleRoutes);

// Protected routes (require JWT token)
router.use('/teachers', authenticate, teacherRoutes);
router.use('/courses', authenticate, courseRoutes);
router.use('/free-videos', authenticate, freeVideoRoutes);
router.use('/cto-banners', authenticate, ctoBannerRoutes);
router.use('/quizzes', authenticate, quizRoutes);
router.use('/sales', authenticate, salesRoutes);
router.use('/subscriptions', authenticate, subscriptionRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);
router.use('/progress', authenticate, progressRoutes);
router.use('/analytics', authenticate, analyticsRoutes);
router.use('/news', authenticate, newsRoutes);
router.use('/user', authenticate, userRoutes);
router.use('/notifications', authenticate, notificationRoutes);
router.use('/short-videos', authenticate, shortVideoRoutes);

module.exports = router;

