const express = require('express');
const { createCtoBanner, listCtoBanners, deleteCtoBanner } = require('../controllers/ctoBannerController');

const router = express.Router();

router.post('/', createCtoBanner);
router.get('/', listCtoBanners);
router.delete('/:bannerId', deleteCtoBanner);

module.exports = router;

