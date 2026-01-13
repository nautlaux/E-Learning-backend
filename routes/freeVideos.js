const express = require('express');
const { createFreeVideo, listFreeVideos, getFreeVideoById } = require('../controllers/freeVideoController');

const router = express.Router();

router.post('/', createFreeVideo);
router.get('/', listFreeVideos);
router.get('/:videoId', getFreeVideoById);

module.exports = router;

