const { Notification } = require('../models');
const paginate = require('../utils/pagination');

/** Create notification (admin / system / Firebase webhook) */
const createNotification = async (req, res) => {
  try {
    const { userId, title, body, source, linkUrl, imageUrl, data } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ message: 'userId and title are required' });
    }

    const notification = await Notification.create({
      userId,
      title,
      body: body ?? '',
      source: source ?? 'CUSTOM',
      linkUrl: linkUrl ?? '',
      imageUrl: imageUrl ?? '',
      data: data ?? null,
    });

    return res.status(201).json(notification);
  } catch (err) {
    console.error('createNotification error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** List current user's notifications (read/unread filter, paginated) */
const listMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { page, limit, read } = req.query;
    const filter = { userId };
    if (read !== undefined && read !== '') {
      filter.read = read === 'true' || read === true;
    }

    const result = await paginate(Notification, {
      filter,
      page,
      limit,
      sort: { createdAt: -1 },
    });

    return res.json(result);
  } catch (err) {
    console.error('listMyNotifications error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** Unread count for badge */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const count = await Notification.countDocuments({ userId, read: false });
    return res.json({ unreadCount: count });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** Mark one as read */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { notificationId } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return res.json(notification);
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** Mark all as read for current user */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    return res.json({ message: 'All marked as read', modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('markAllAsRead error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createNotification,
  listMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
