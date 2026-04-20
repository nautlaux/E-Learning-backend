const express = require('express');
const {
  getDashboard,
  getDashboardBanners,
  getPopularCourses,
  getRecommendedCourses,
  getContinueCourses,
  getDashboardFreeVideos,
  getDashboardShorts,
  getDashboardSectionsConfig,
} = require('../controllers/dashboardController');
const { getConfig, updateConfig } = require('../controllers/dashboardConfigController');
const { getExchangeRates } = require('../controllers/exchangeRateController');

const router = express.Router();

router.get('/', getDashboard);
router.get('/sections', getDashboardSectionsConfig);
router.get('/banners', getDashboardBanners);
router.get('/courses/popular', getPopularCourses);
router.get('/courses/recommended', getRecommendedCourses);
router.get('/continue', getContinueCourses);
router.get('/free-videos', getDashboardFreeVideos);
router.get('/shorts', getDashboardShorts);
router.get('/exchange-rates', getExchangeRates);
router.get('/config', getConfig);
router.put('/config', updateConfig);

module.exports = router;
