const express = require('express');
const { getAppModules } = require('../controllers/appModuleController');

const router = express.Router();

router.get('/', getAppModules);

module.exports = router;
