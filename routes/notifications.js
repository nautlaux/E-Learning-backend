const express = require('express');
const {
  createNotification,
  listMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

const router = express.Router();

router.post('/', createNotification);
router.get('/', listMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:notificationId/read', markAsRead);

module.exports = router;
