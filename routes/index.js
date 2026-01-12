const express = require('express');
const teacherRoutes = require('./teachers');
const courseRoutes = require('./courses');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/teachers', teacherRoutes);
router.use('/courses', courseRoutes);

module.exports = router;

