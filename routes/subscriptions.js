const express = require('express');
const {
  createSubscription,
  listSubscriptions,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  checkMySubscriptionStatus,
  getUserSubscriptions,
} = require('../controllers/subscriptionController');

const router = express.Router();

// Current user: check if subscription is active (must be before /:subscriptionId)
router.get('/me/status', checkMySubscriptionStatus);

// Subscription CRUD
router.post('/', createSubscription);
router.get('/', listSubscriptions);
router.get('/:subscriptionId', getSubscription);
router.put('/:subscriptionId', updateSubscription);
router.delete('/:subscriptionId', cancelSubscription);

// User-specific subscriptions
router.get('/user/:userId', getUserSubscriptions);

module.exports = router;
