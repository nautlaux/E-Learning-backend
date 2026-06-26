const express = require('express');
const requireOrgAdmin = require('../middlewares/requireOrgAdmin');
const {
  broadcastNotification,
  createNotification,
  listMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

const router = express.Router();

router.post('/broadcast', requireOrgAdmin, broadcastNotification);
router.post('/', requireOrgAdmin, createNotification);
router.get('/', listMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:notificationId/read', markAsRead);

module.exports = router;
