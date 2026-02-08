const express = require('express');
const { recordClicks, getHeatmap, getScreens, logEvent } = require('../controllers/analyticsController');

const router = express.Router();

router.post('/clicks', recordClicks);
router.post('/log-event', logEvent);
router.get('/heatmap', getHeatmap);
router.get('/screens', getScreens);

module.exports = router;
