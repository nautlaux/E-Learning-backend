const { ChatRoom, ChatMessage, User } = require('../models');

const toSlug = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const requireOrg = (req, res) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    res.status(400).json({ message: 'User organization not found' });
    return null;
  }
  return organizationId;
};

// GET /api/chat/rooms
const listRooms = async (req, res) => {
  try {
    const organizationId = requireOrg(req, res);
    if (!organizationId) return;

    const rooms = await ChatRoom.find({ organizationId, isActive: true })
      .sort({ createdAt: 1 })
      .lean();

    return res.json({
      success: true,
      data: rooms.map((r) => ({
        roomId: r._id,
        name: r.name,
        slug: r.slug,
        isActive: r.isActive,
      })),
    });
  } catch (err) {
    console.error('listRooms error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/chat/rooms (admin)
const createRoom = async (req, res) => {
  try {
    const organizationId = requireOrg(req, res);
    if (!organizationId) return;

    const userId = req.user?.userId;
    const { name, slug } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name is required' });

    const finalSlug = slug ? toSlug(slug) : toSlug(name);
    if (!finalSlug) return res.status(400).json({ message: 'slug is invalid' });

    const room = await ChatRoom.create({
      organizationId,
      name: String(name).trim(),
      slug: finalSlug,
      createdBy: userId || null,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      data: { roomId: room._id, name: room.name, slug: room.slug, isActive: room.isActive },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Room slug already exists' });
    }
    console.error('createRoom error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /api/chat/rooms/:roomId (admin)
const updateRoom = async (req, res) => {
  try {
    const organizationId = requireOrg(req, res);
    if (!organizationId) return;

    const { roomId } = req.params;
    const { name, slug, isActive } = req.body || {};
    const toSet = {};
    if (name !== undefined) toSet.name = String(name).trim();
    if (slug !== undefined) toSet.slug = toSlug(slug);
    if (isActive !== undefined) toSet.isActive = Boolean(isActive);

    const room = await ChatRoom.findOneAndUpdate(
      { _id: roomId, organizationId },
      { $set: toSet },
      { new: true, runValidators: true }
    ).lean();

    if (!room) return res.status(404).json({ message: 'Room not found' });

    return res.json({
      success: true,
      data: { roomId: room._id, name: room.name, slug: room.slug, isActive: room.isActive },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Room slug already exists' });
    }
    console.error('updateRoom error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/chat/rooms/:roomId (admin) (soft delete)
const deleteRoom = async (req, res) => {
  try {
    const organizationId = requireOrg(req, res);
    if (!organizationId) return;

    const { roomId } = req.params;
    const room = await ChatRoom.findOneAndUpdate(
      { _id: roomId, organizationId },
      { $set: { isActive: false } },
      { new: true }
    ).lean();

    if (!room) return res.status(404).json({ message: 'Room not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteRoom error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/chat/rooms/:roomId/messages?cursor=<messageId>&limit=50
// Privacy: never return senderUserId/phone/mobile.
const listMessages = async (req, res) => {
  try {
    const organizationId = requireOrg(req, res);
    if (!organizationId) return;

    const { roomId } = req.params;
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 50));
    const cursor = req.query.cursor ? String(req.query.cursor) : null;

    const room = await ChatRoom.findOne({ _id: roomId, organizationId, isActive: true }).lean();
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const filter = { organizationId, roomId };
    if (cursor) {
      filter._id = { $lt: cursor };
    }

    const messages = await ChatMessage.find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    const nextCursor = messages.length ? String(messages[messages.length - 1]._id) : null;

    return res.json({
      success: true,
      data: messages
        .reverse()
        .map((m) => ({
          messageId: m._id,
          senderName: m.senderName,
          message: m.message,
          timestamp: m.createdAt,
          isAdmin: m.isAdmin,
        })),
      meta: { nextCursor },
    });
  } catch (err) {
    console.error('listMessages error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/chat/rooms/:roomId/messages
const postMessage = async (req, res) => {
  try {
    const organizationId = requireOrg(req, res);
    if (!organizationId) return;

    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { roomId } = req.params;
    const { message } = req.body || {};
    if (!message || !String(message).trim()) return res.status(400).json({ message: 'message is required' });

    const room = await ChatRoom.findOne({ _id: roomId, organizationId, isActive: true }).lean();
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const user = await User.findById(userId).lean();
    const senderName = user?.name ? String(user.name).trim() : 'User';
    const isAdmin = role === 'ORG_ADMIN' || role === 'SUPER_ADMIN';

    const saved = await ChatMessage.create({
      organizationId,
      roomId,
      senderUserId: userId,
      senderName,
      message: String(message).trim(),
      isAdmin,
    });

    return res.status(201).json({
      success: true,
      data: {
        messageId: saved._id,
        senderName: saved.senderName,
        message: saved.message,
        timestamp: saved.createdAt,
        isAdmin: saved.isAdmin,
      },
    });
  } catch (err) {
    console.error('postMessage error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  listRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  listMessages,
  postMessage,
};

