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
const { publicAnalyticsRoutes, protectedAnalyticsRoutes } = require('./analytics');
const newsRoutes = require('./news');
const userRoutes = require('./user');
const notificationRoutes = require('./notifications');
const appModuleRoutes = require('./appModules');
const shortVideoRoutes = require('./shortVideos');
const sheetSyncRoutes = require('./sheetSync');
const founderRoutes = require('./founder');
const journeyRoutes = require('./journey');
const chatRoutes = require('./chat');
const testimonialRoutes = require('./testimonials');
const configRoutes = require('./config');
const { logInstall } = require('../controllers/analyticsController');
const authenticate = require('../middlewares/auth');

const router = express.Router();

// GET /api/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Public routes (no auth required)
router.use('/auth', authRoutes);
router.post('/analytics/log-install', logInstall);
router.use(publicAnalyticsRoutes);
router.use('/app-modules', appModuleRoutes);
router.use('/sheet-sync', sheetSyncRoutes);

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
router.use('/analytics', authenticate, protectedAnalyticsRoutes);
router.use('/news', authenticate, newsRoutes);
router.use('/user', authenticate, userRoutes);
router.use('/notifications', authenticate, notificationRoutes);
router.use('/short-videos', authenticate, shortVideoRoutes);
router.use('/founder', authenticate, founderRoutes);
router.use('/journey', authenticate, journeyRoutes);
router.use('/chat', authenticate, chatRoutes);
router.use('/testimonials', authenticate, testimonialRoutes);
router.use('/config', authenticate, configRoutes);

module.exports = router;

