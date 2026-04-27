const express = require('express');
const { getFounderInfo, upsertFounderInfo } = require('../controllers/founderController');
const requireOrgAdmin = require('../middlewares/requireOrgAdmin');

const router = express.Router();

router.get('/', getFounderInfo);
router.put('/', requireOrgAdmin, upsertFounderInfo);

module.exports = router;

