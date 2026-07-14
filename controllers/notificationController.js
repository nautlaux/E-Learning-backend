const { Types } = require('mongoose');
const { Notification, User } = require('../models');
const paginate = require('../utils/pagination');
const { distinctUserIdsWithActivePremium } = require('../utils/distinctUserIdsWithActivePremium');
const { sendPushBatches } = require('../services/newsNotify');

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildInterestedInFilter(interestedIn) {
  if (interestedIn === 'import') return { interestedIn: { $in: ['import', 'both'] } };
  if (interestedIn === 'export') return { interestedIn: { $in: ['export', 'both'] } };
  return {};
}

async function resolveTargetUserIds({ audience, customUsers, newUser, interestedIn, premium }) {
  const baseFilter = { role: 'USER', isActive: true, ...buildInterestedInFilter(interestedIn) };

  let userIds = [];

  if (audience === 'custom') {
    const rawIds = String(customUsers || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    const validIds = rawIds.filter((id) => Types.ObjectId.isValid(id));
    if (!validIds.length) return [];

    userIds = await User.find({ _id: { $in: validIds }, ...baseFilter }).distinct('_id');
  } else if (audience === 'new') {
    const mode = newUser?.mode || 'today';
    const anchor =
      mode === 'date' && newUser?.date
        ? startOfDay(new Date(newUser.date))
        : startOfDay(new Date());
    const end = new Date(anchor);
    end.setDate(end.getDate() + 1);

    userIds = await User.find({
      ...baseFilter,
      createdAt: { $gte: anchor, $lt: end },
    }).distinct('_id');
  } else {
    userIds = await User.find(baseFilter).distinct('_id');
  }

  if (!userIds.length || premium === 'any') return userIds;

  const premiumSet = await distinctUserIdsWithActivePremium(userIds);
  if (premium === 'premium') {
    return userIds.filter((id) => premiumSet.has(String(id)));
  }
  if (premium === 'non-premium') {
    return userIds.filter((id) => !premiumSet.has(String(id)));
  }
  return userIds;
}

// POST /api/notifications/broadcast (admin)
const broadcastNotification = async (req, res) => {
  try {
    const {
      audience = 'all',
      customUsers,
      newUser,
      interestedIn = 'any',
      premium = 'any',
      title,
      message,
      body,
      imageUrl,
      newsId,
      linkUrl,
      data,
    } = req.body;

    const notificationTitle = String(title || '').trim();
    const notificationBody = String(message ?? body ?? '').trim();
    const notificationImageUrl = String(imageUrl || '').trim();
    const resolvedNewsId = String(newsId || data?.newsId || '').trim();
    const notificationData =
      data && typeof data === 'object'
        ? { ...data }
        : resolvedNewsId
          ? { type: 'news', newsId: resolvedNewsId }
          : null;
    if (resolvedNewsId) {
      notificationData.type = notificationData.type || 'news';
      notificationData.newsId = resolvedNewsId;
    }
    const notificationLinkUrl = String(
      linkUrl || (resolvedNewsId ? `news://${resolvedNewsId}` : '')
    ).trim();

    if (!notificationTitle || !notificationBody) {
      return res.status(400).json({ message: 'title and message are required' });
    }
    if (!['all', 'custom', 'new'].includes(audience)) {
      return res.status(400).json({ message: 'Invalid audience' });
    }
    if (audience === 'custom' && !String(customUsers || '').trim()) {
      return res.status(400).json({ message: 'customUsers is required for custom audience' });
    }
    if (audience === 'new' && newUser?.mode === 'date' && !newUser?.date) {
      return res.status(400).json({ message: 'newUser.date is required when mode is date' });
    }

    const userIds = await resolveTargetUserIds({
      audience,
      customUsers,
      newUser,
      interestedIn,
      premium,
    });

    if (!userIds.length) {
      return res.json({
        success: true,
        message: 'No users matched the selected filters',
        sentCount: 0,
        push: { successCount: 0, failureCount: 0, skipped: true, reason: 'NO_USERS' },
      });
    }

    const notifications = userIds.map((userId) => ({
      userId,
      title: notificationTitle,
      body: notificationBody,
      imageUrl: notificationImageUrl,
      linkUrl: notificationLinkUrl,
      data: notificationData,
      source: 'ADMIN_PANEL',
    }));

    await Notification.insertMany(notifications, { ordered: false });

    const usersWithTokens = await User.find({
      _id: { $in: userIds },
      fcmToken: { $exists: true, $ne: '' },
    })
      .select('fcmToken')
      .lean();
    const tokens = usersWithTokens.map((u) => String(u.fcmToken).trim()).filter(Boolean);
    const push = await sendPushBatches(tokens, {
      title: notificationTitle,
      body: notificationBody,
      imageUrl: notificationImageUrl,
      data: notificationData || undefined,
    });

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${userIds.length} user(s)`,
      sentCount: userIds.length,
      push,
    });
  } catch (err) {
    console.error('broadcastNotification error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/notifications
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

// GET /api/notifications
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

// GET /api/notifications/unread-count
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

// PATCH /api/notifications/:notificationId/read
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

// PATCH /api/notifications/read-all
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
  broadcastNotification,
  createNotification,
  listMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
