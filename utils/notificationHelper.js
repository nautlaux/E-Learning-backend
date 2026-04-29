const fs = require('fs');
const path = require('path');

const admin = require('firebase-admin');

const { User } = require('../models');

let firebaseApp = null;

function getServiceAccountPath() {
  // Prefer env; fallback to the filename currently in repo
  return (
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(process.cwd(), 'importexport-645ff-firebase-adminsdk-fbsvc-85d2506060.json')
  );
}

function initFirebase() {
  if (firebaseApp) return firebaseApp;
  if (admin.apps && admin.apps.length) {
    firebaseApp = admin.app();
    return firebaseApp;
  }

  const serviceAccountPath = getServiceAccountPath();
  const raw = fs.readFileSync(serviceAccountPath, 'utf-8');
  const serviceAccount = JSON.parse(raw);

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return firebaseApp;
}

function buildMessage({ token, tokens, title, body, data }) {
  const payload = {
    notification: {
      title: String(title || ''),
      body: String(body || ''),
    },
    data: data && typeof data === 'object'
      ? Object.fromEntries(
          Object.entries(data).map(([k, v]) => [String(k), v == null ? '' : String(v)])
        )
      : {},
  };

  if (token) return { token, ...payload };
  if (tokens) return { tokens, ...payload };
  throw new Error('token or tokens is required');
}

async function sendToToken({ token, title, body, data }) {
  if (!token) return { success: false, skipped: true, reason: 'NO_TOKEN' };
  initFirebase();

  const message = buildMessage({ token, title, body, data });
  const messageId = await admin.messaging().send(message);
  return { success: true, messageId };
}

async function sendToTokens({ tokens, title, body, data }) {
  const list = Array.isArray(tokens) ? tokens.filter(Boolean) : [];
  if (!list.length) return { success: false, skipped: true, reason: 'NO_TOKENS' };
  initFirebase();

  const message = buildMessage({ tokens: list, title, body, data });
  const result = await admin.messaging().sendEachForMulticast(message);

  return {
    success: true,
    successCount: result.successCount,
    failureCount: result.failureCount,
    responses: result.responses?.map((r) => ({
      success: r.success,
      messageId: r.messageId || null,
      error: r.error ? { message: r.error.message, code: r.error.code } : null,
    })),
  };
}

async function sendToUserId({ userId, title, body, data }) {
  if (!userId) return { success: false, skipped: true, reason: 'NO_USER_ID' };

  const user = await User.findById(userId).lean();
  const token = user?.fcmToken ? String(user.fcmToken).trim() : '';
  if (!token) return { success: false, skipped: true, reason: 'NO_FCM_TOKEN' };

  return await sendToToken({ token, title, body, data });
}

module.exports = {
  initFirebase,
  sendToToken,
  sendToTokens,
  sendToUserId,
};

