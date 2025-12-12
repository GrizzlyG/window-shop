import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Replace escaped newlines with actual newlines in the private key
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/gm, '\n');
  
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: { [key: string]: string }
) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          priority: 'high' as const,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
          requireInteraction: true,
          vibrate: [200, 100, 200],
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

export const sendMulticastNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data?: { [key: string]: string }
) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens,
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          priority: 'high' as const,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
          requireInteraction: true,
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`${response.successCount} messages sent successfully`);
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    throw error;
  }
};

export function getAdminStorage() {
  return admin.storage();
}

export default admin;
