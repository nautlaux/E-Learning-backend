const express = require('express');
const {
  createNews,
  listNews,
  getNewsById,
  updateNews,
  deleteNews,
} = require('../controllers/newsController');

const router = express.Router();

router.post('/', createNews);
router.get('/', listNews);
router.get('/:newsId', getNewsById);
router.put('/:newsId', updateNews);
router.delete('/:newsId', deleteNews);

module.exports = router;
