import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, deleteToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function requestPermission() {
  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

export async function getFcmToken(vapidKey: string) {
  try {
    return await getToken(messaging, { vapidKey });
  } catch (e) {
    console.error('getFcmToken error', e);
    return null;
  }
}

export async function unsubscribeFcm() {
  try {
    await deleteToken(messaging);
  } catch (e) {
    console.error('unsubscribeFcm error', e);
  }
}
