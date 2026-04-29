const express = require('express');
const requireOrgAdmin = require('../middlewares/requireOrgAdmin');
const {
  listRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  listMessages,
  joinRoom,
  postMessage,
} = require('../controllers/chatController');

const router = express.Router();

router.get('/rooms', listRooms);
router.post('/rooms', requireOrgAdmin, createRoom);
router.patch('/rooms/:roomId', requireOrgAdmin, updateRoom);
router.delete('/rooms/:roomId', requireOrgAdmin, deleteRoom);

router.get('/rooms/:roomId/messages', listMessages);
router.post('/rooms/:roomId/join', joinRoom);
router.post('/rooms/:roomId/messages', postMessage);

module.exports = router;

