const express = require('express');
const { getJourneyConfig, upsertJourneyConfig } = require('../controllers/journeyController');
const { getJourneyProgress, upsertJourneyProgress } = require('../controllers/journeyProgressController');
const requireOrgAdmin = require('../middlewares/requireOrgAdmin');

const router = express.Router();

router.get('/config', getJourneyConfig);
router.put('/config', requireOrgAdmin, upsertJourneyConfig);
router.get('/progress', getJourneyProgress);
router.put('/progress', upsertJourneyProgress);

module.exports = router;

