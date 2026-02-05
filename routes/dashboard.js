const express = require('express');
const { getDashboard } = require('../controllers/dashboardController');
const { getConfig, updateConfig } = require('../controllers/dashboardConfigController');

const router = express.Router();

router.get('/', getDashboard);
router.get('/config', getConfig);
router.put('/config', updateConfig);

module.exports = router;
