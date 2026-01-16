const express = require('express');
const teacherRoutes = require('./teachers');
const courseRoutes = require('./courses');
const freeVideoRoutes = require('./freeVideos');
const ctoBannerRoutes = require('./ctoBanners');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/teachers', teacherRoutes);
router.use('/courses', courseRoutes);
router.use('/free-videos', freeVideoRoutes);
router.use('/cto-banners', ctoBannerRoutes);

module.exports = router;

