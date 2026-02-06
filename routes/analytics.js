const express = require('express');
const { recordClicks, getHeatmap, getScreens } = require('../controllers/analyticsController');

const router = express.Router();

router.post('/clicks', recordClicks);
router.get('/heatmap', getHeatmap);
router.get('/screens', getScreens);

module.exports = router;
