const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const fs = require('fs');
const path = require('path');

let firebaseMessaging = null;

try {
  let serviceAccount = null;

  // 1. Check if FIREBASE_SERVICE_ACCOUNT environment variable is set (Production / Render)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const envVal = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      if (envVal.startsWith('{')) {
        serviceAccount = JSON.parse(envVal);
      } else {
        const decoded = Buffer.from(envVal, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      }
    } catch (e) {
      console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT env var:', e.message);
    }
  }

  // 2. Check local config directory (Local development)
  if (!serviceAccount) {
    const configDir = path.join(__dirname, '../../config');
    if (fs.existsSync(configDir)) {
      const files = fs.readdirSync(configDir);
      const serviceAccountFile = files.find(
        (f) => f.includes('firebase-adminsdk') && f.endsWith('.json')
      );

      if (serviceAccountFile) {
        serviceAccount = require(path.join(configDir, serviceAccountFile));
      }
    }
  }

  if (serviceAccount) {
    let app;
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      app = getApps()[0];
    }
    firebaseMessaging = getMessaging(app);
    console.log('✅ Firebase Cloud Messaging (FCM) initialized successfully.');
  } else {
    console.warn('⚠️ Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT in your environment or place JSON in config/.');
  }
} catch (error) {
  console.warn('⚠️ Could not initialize Firebase Admin SDK:', error.message);
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
    if (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')) {
      expoTokens.push(token);
    } else {
      fcmTokens.push(token);
    }
  });

  let totalSuccess = 0;
  let totalFailure = 0;

  // 1. Send via FCM Direct (Primary for standalone Android APK)
  if (fcmTokens.length > 0) {
    if (firebaseMessaging) {
      try {
        const stringData = {};
        Object.keys(data || {}).forEach((key) => {
          stringData[key] = String(data[key]);
        });

        const message = {
          notification: {
            title,
            body,
          },
          data: stringData,
          android: {
            priority: 'high',
            notification: {
              channelId: 'default',
              sound: 'default',
              priority: 'high',
              defaultSound: true,
              defaultVibrateTimings: true,
            },
          },
          tokens: fcmTokens,
        };

        const response = await firebaseMessaging.sendEachForMulticast(message);
        totalSuccess += response.successCount;
        totalFailure += response.failureCount;

        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.warn(`[FCM] Delivery failed for token: ${fcmTokens[idx]} - ${resp.error?.message}`);
            }
          });
        }
      } catch (e) {
        console.error('❌ FCM Multicast error:', e);
      }
    } else {
      console.warn('⚠️ Cannot send FCM: Firebase Admin SDK is not initialized on this server.');
    }
  }

  // 2. Send via Expo Push API (Fallback for Expo Go tokens)
  if (expoTokens.length > 0) {
    const messages = expoTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      channelId: 'default',
      priority: 'high',
    }));

    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      const { successCount, failureCount } = await sendExpoPushChunk(chunk);
      totalSuccess += successCount;
      totalFailure += failureCount;
    }
  }

  return { successCount: totalSuccess, failureCount: totalFailure };
};

module.exports = {
  sendPushNotifications,
  firebaseMessaging,
};
