const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let firebaseAdmin = null;

try {
  const configDir = path.join(__dirname, '../../config');
  if (fs.existsSync(configDir)) {
    const files = fs.readdirSync(configDir);
    const serviceAccountFile = files.find(
      (f) => f.includes('firebase-adminsdk') && f.endsWith('.json')
    );

    if (serviceAccountFile) {
      const serviceAccount = require(path.join(configDir, serviceAccountFile));
      const adminApp = admin.default || admin;
      if (adminApp.credential && adminApp.initializeApp) {
        firebaseAdmin = adminApp.initializeApp({
          credential: adminApp.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin SDK initialized successfully.');
      }
    }
  }
} catch (error) {
  console.warn('Could not initialize Firebase Admin SDK:', error.message);
}

const sendExpoPushChunk = async (messages) => {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
    const result = await response.json();
    let successCount = 0;
    let failureCount = 0;
    if (result && Array.isArray(result.data)) {
      result.data.forEach((ticket) => {
        if (ticket.status === 'ok') successCount++;
        else failureCount++;
      });
    }
    return { successCount, failureCount };
  } catch (err) {
    console.error('Expo push sending error:', err);
    return { successCount: 0, failureCount: messages.length };
  }
};

const sendPushNotifications = async ({ pushTokens, title, body, data = {} }) => {
  const validTokens = (pushTokens || []).filter(Boolean);
  if (!validTokens.length) return { successCount: 0, failureCount: 0 };

  const expoTokens = [];
  const fcmTokens = [];

  validTokens.forEach((token) => {
    if (token.startsWith('ExpoPushToken[')) {
      expoTokens.push(token);
    } else {
      fcmTokens.push(token);
    }
  });

  let totalSuccess = 0;
  let totalFailure = 0;

  // Send via Expo Push API
  if (expoTokens.length > 0) {
    const messages = expoTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      const { successCount, failureCount } = await sendExpoPushChunk(chunk);
      totalSuccess += successCount;
      totalFailure += failureCount;
    }
  }

  // Send via FCM Direct
  if (fcmTokens.length > 0 && firebaseAdmin) {
    try {
      const stringData = {};
      Object.keys(data).forEach((key) => {
        stringData[key] = String(data[key]);
      });

      const message = {
        notification: { title, body },
        data: stringData,
        tokens: fcmTokens,
      };

      const adminApp = admin.default || admin;
      const response = await adminApp.messaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;
    } catch (e) {
      console.error('FCM Multicast error:', e);
    }
  }

  return { successCount: totalSuccess, failureCount: totalFailure };
};

module.exports = {
  sendPushNotifications,
  firebaseAdmin,
};
