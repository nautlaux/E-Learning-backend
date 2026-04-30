const jwt = require('jsonwebtoken');

const { ChatRoom, ChatMessage, ChatRoomMembership, User } = require('../models');
const { containsNumericLikeText } = require('../utils/regex');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const IST_TZ = 'Asia/Kolkata';
const formatIST = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
    .format(date)
    .replace(/\//g, '-');
};

const safeMessagePayload = (m) => ({
  messageId: m._id,
  senderId: m.senderUserId,
  senderName: m.senderName,
  message: m.message,
  timestamp: m.createdAt,
  timestampIST: formatIST(m.createdAt),
  isAdmin: m.isAdmin,
});

const isAdminRole = (role) => role === 'ORG_ADMIN' || role === 'SUPER_ADMIN';

async function ensureMembership({ organizationId, roomId, userId }) {
  return await ChatRoomMembership.findOneAndUpdate(
    { organizationId, roomId, userId },
    { $setOnInsert: { joinedAt: new Date() } },
    { upsert: true, new: true }
  ).lean();
}

async function getMembership({ organizationId, roomId, userId }) {
  return await ChatRoomMembership.findOne({ organizationId, roomId, userId }).lean();
}

async function validateRoom({ organizationId, roomId }) {
  return await ChatRoom.findOne({ _id: roomId, organizationId, isActive: true }).lean();
}

function registerChatSocket(io) {
  // Auth middleware for socket
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (typeof socket.handshake.headers?.authorization === 'string' &&
          socket.handshake.headers.authorization.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.substring(7)
          : null);

      if (!token) return next(new Error('NO_TOKEN'));

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = {
        userId: decoded.userId,
        role: decoded.role,
        organizationId: decoded.organizationId,
      };
      return next();
    } catch (err) {
      return next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, role, organizationId } = socket.user || {};

    socket.on('rooms:list', async (payload, ack) => {
      try {
        const rooms = await ChatRoom.find({ organizationId, isActive: true }).sort({ createdAt: 1 }).lean();
        const roomIds = rooms.map((r) => r._id);
        const memberships = await ChatRoomMembership.find({ organizationId, userId, roomId: { $in: roomIds } })
          .select({ roomId: 1, joinedAt: 1 })
          .lean();
        const membershipByRoomId = new Map(
          memberships.map((m) => [String(m.roomId), { joined: true, joinedAt: m.joinedAt }])
        );

        const data = rooms.map((r) => ({
          roomId: r._id,
          name: r.name,
          slug: r.slug,
          isActive: r.isActive,
          joined: membershipByRoomId.get(String(r._id))?.joined ?? false,
          joinedAt: membershipByRoomId.get(String(r._id))?.joinedAt ?? null,
        }));

        ack && ack({ success: true, data });
      } catch (e) {
        ack && ack({ success: false, message: 'Internal server error' });
      }
    });

    socket.on('room:join', async ({ roomId }, ack) => {
      try {
        const room = await validateRoom({ organizationId, roomId });
        if (!room) return ack && ack({ success: false, message: 'Room not found' });

        const membership = await ensureMembership({ organizationId, roomId, userId });
        socket.join(`room:${String(roomId)}`);
        return ack && ack({ success: true, data: { roomId, joinedAt: membership.joinedAt } });
      } catch (e) {
        return ack && ack({ success: false, message: 'Internal server error' });
      }
    });

    socket.on('messages:fetch', async ({ roomId, cursor = null, limit = 50 }, ack) => {
      try {
        const room = await validateRoom({ organizationId, roomId });
        if (!room) return ack && ack({ success: false, message: 'Room not found' });

        const admin = isAdminRole(role);
        let joinedAt = null;

        if (!admin) {
          const membership = await getMembership({ organizationId, roomId, userId });
          if (!membership) return ack && ack({ success: true, data: [], meta: { nextCursor: null } });
          joinedAt = membership.joinedAt;
        }

        const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
        const filter = { organizationId, roomId };
        if (joinedAt) filter.createdAt = { $gte: joinedAt };
        if (cursor) filter._id = { $lt: String(cursor) };

        const messages = await ChatMessage.find(filter).sort({ _id: -1 }).limit(lim).lean();
        const nextCursor = messages.length ? String(messages[messages.length - 1]._id) : null;
        const data = messages.reverse().map(safeMessagePayload);

        return ack && ack({ success: true, data, meta: { nextCursor } });
      } catch (e) {
        return ack && ack({ success: false, message: 'Internal server error' });
      }
    });

    socket.on('message:send', async ({ roomId, message }, ack) => {
      try {
        const room = await validateRoom({ organizationId, roomId });
        if (!room) return ack && ack({ success: false, message: 'Room not found' });

        const msg = String(message || '').trim();
        if (!msg) return ack && ack({ success: false, message: 'message is required' });
        if (containsNumericLikeText(msg)) return ack && ack({ success: false, message: 'Numbers are not allowed in chat messages' });

        const admin = isAdminRole(role);
        let membership = await getMembership({ organizationId, roomId, userId });
        if (!membership) {
          if (!admin) return ack && ack({ success: false, message: 'Please join the room first', code: 403 });
          membership = await ensureMembership({ organizationId, roomId, userId });
        }

        // ensure this socket is in the room for receiving new messages
        socket.join(`room:${String(roomId)}`);

        const user = await User.findById(userId).lean();
        const senderName = user?.name ? String(user.name).trim() : 'User';

        const saved = await ChatMessage.create({
          organizationId,
          roomId,
          senderUserId: userId,
          senderName,
          message: msg,
          isAdmin: admin,
        });

        const payload = safeMessagePayload(saved);
        io.to(`room:${String(roomId)}`).emit('message:new', { roomId, data: payload });
        return ack && ack({ success: true, data: payload });
      } catch (e) {
        return ack && ack({ success: false, message: 'Internal server error' });
      }
    });
  });
}

module.exports = { registerChatSocket };

