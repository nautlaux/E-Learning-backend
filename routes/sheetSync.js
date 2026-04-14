const express = require('express');
const { sheetSync } = require('../controllers/sheetSyncController');

const router = express.Router();

router.post('/', sheetSync);

module.exports = router;

