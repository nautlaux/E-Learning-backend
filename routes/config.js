const express = require('express');
const requireOrgAdmin = require('../middlewares/requireOrgAdmin');
const { getSocialLinks, updateSocialLinks } = require('../controllers/socialLinksController');

const router = express.Router();

router.get('/social-links', getSocialLinks);
router.put('/social-links', requireOrgAdmin, updateSocialLinks);

module.exports = router;

