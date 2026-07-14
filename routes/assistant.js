const express = require('express');
const requireOrgAdmin = require('../middlewares/requireOrgAdmin');
const {
  getStarters,
  upsertStarters,
  listConversations,
  getConversation,
  sendMessage,
} = require('../controllers/assistantController');

const router = express.Router();

// New chat screen
router.get('/starters', getStarters);
router.put('/starters', requireOrgAdmin, upsertStarters);

// Old chats (WhatsApp-style list + open one thread)
router.get('/conversations', listConversations);
router.get('/conversations/:conversationId', getConversation);

// Send message (new chat or continue old chat)
router.post('/chat', sendMessage);

module.exports = router;
