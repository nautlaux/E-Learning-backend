const express = require('express');
const { upsertProgress } = require('../controllers/progressController');

const router = express.Router();

router.post('/', upsertProgress);

module.exports = router;
