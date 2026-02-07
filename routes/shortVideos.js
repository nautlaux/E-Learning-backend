const express = require('express');
const {
  createShortVideo,
  listShortVideos,
  getShortVideoById,
  updateShortVideo,
  deleteShortVideo,
} = require('../controllers/shortVideoController');

const router = express.Router();

router.post('/', createShortVideo);
router.get('/', listShortVideos);
router.get('/:videoId', getShortVideoById);
router.patch('/:videoId', updateShortVideo);
router.delete('/:videoId', deleteShortVideo);

module.exports = router;
