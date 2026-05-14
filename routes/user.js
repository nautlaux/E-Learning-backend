const express = require('express');
const { getProfile, updateProfile, listUsersAdmin, exportUsersAdmin } = require('../controllers/userController');
const {
  listPlatformPremiumAccess,
  createPlatformPremiumAccess,
  updatePlatformPremiumAccess,
  cancelPlatformPremiumAccess,
} = require('../controllers/platformPremiumController');

const router = express.Router();

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin: paginated list of users with courses
router.get('/admin/list', listUsersAdmin);

// Admin: export all users with courses (no pagination)
router.get('/admin/export', exportUsersAdmin);

// Admin: dashboard-managed platform premium (date range), separate from per-course subscriptions
router.get('/admin/premium-access', listPlatformPremiumAccess);
router.post('/admin/premium-access', createPlatformPremiumAccess);
router.put('/admin/premium-access/:grantId', updatePlatformPremiumAccess);
router.delete('/admin/premium-access/:grantId', cancelPlatformPremiumAccess);

module.exports = router;
