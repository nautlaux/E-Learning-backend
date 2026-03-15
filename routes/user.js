const express = require('express');
const { getProfile, updateProfile, listUsersAdmin, exportUsersAdmin } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin: paginated list of users with courses
router.get('/admin/list', listUsersAdmin);

// Admin: export all users with courses (no pagination)
router.get('/admin/export', exportUsersAdmin);

module.exports = router;
