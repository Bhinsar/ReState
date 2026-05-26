// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "sonner";
import { api } from "../api";
import { API_ENDPOINTS } from "./fcm.ApiEndPoints";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FCM_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FCM_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FCM_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FCM_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FCM_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FCM_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  return await Notification.requestPermission();
};

export const getFCMToken = async () => {
  try {
    if (typeof window === "undefined") {
      return;
    }
    const permission = await requestNotificationPermission();
    if (permission === "denied") {
      return;
    }
    if (!app || !navigator.serviceWorker) {
      return;
    }
    const messaging = getMessaging(app);
    const swUrl = `/firebase-messaging-sw.js?apiKey=${encodeURIComponent(process.env.NEXT_PUBLIC_FCM_API_KEY || "")}&authDomain=${encodeURIComponent(process.env.NEXT_PUBLIC_FCM_AUTH_DOMAIN || "")}&projectId=${encodeURIComponent(process.env.NEXT_PUBLIC_FCM_PROJECT_ID || "")}&storageBucket=${encodeURIComponent(process.env.NEXT_PUBLIC_FCM_STORAGE_BUCKET || "")}&messagingSenderId=${encodeURIComponent(process.env.NEXT_PUBLIC_FCM_MESSAGING_SENDER_ID || "")}&appId=${encodeURIComponent(process.env.NEXT_PUBLIC_FCM_APP_ID || "")}`;
    const registration = await navigator.serviceWorker.register(swUrl);
    
    // Wait for the service worker to become active before requesting the token
    if (!registration.active) {
      await new Promise<void>((resolve) => {
        const worker = registration.installing || registration.waiting;
        if (worker) {
          const stateListener = () => {
            if (worker.state === 'activated') {
              worker.removeEventListener('statechange', stateListener);
              resolve();
            }
          };
          worker.addEventListener('statechange', stateListener);
        } else {
          resolve();
        }
      });
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    return token;
  } catch (err) {
    console.log("Error getting FCM token", err);
  }
};

export const registerFCMToken = async (): Promise<boolean> => {
  try {
    console.log("Registering FCM token");
    const token = await getFCMToken();
    if (!token) {
      return false;
    }
    console.log("FCM token", token);
    const response = await api.post(API_ENDPOINTS.FCM_REGISTER, {
      fcmToken:   token,
      platform:   'WEB',
      deviceName: navigator.userAgent,
    });
    return response.data;
  } catch (err) {
    console.log("Error registering FCM token", err);
    return false;
  }
};

export const unRegisterFCMToken = async (): Promise<boolean> => {
  try {
    const token = await getFCMToken();
    if (!token) {
      return false;
    }
    const response = await api.delete(API_ENDPOINTS.FCM_UNREGISTER, {
      data: {
        fcmToken:   token,
        platform:   'WEB',
        deviceName: navigator.userAgent,
      }
    });
    return response.data;
  } catch (err) {
    console.log("Error unregistering FCM token", err);
    return false;
  }
};

export const listenToForegroundNotifications = () => {
  try {
    if (typeof window === "undefined" || !app) {
      return;
    }
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      const title = payload.notification?.title || payload.data?.title || "Notification";
      const body = payload.notification?.body || payload.data?.body || "";
      
      toast.info(title, {
        description: body,
      });
    });
  } catch (error) {
    console.error("Error setting up foreground notification listener:", error);
  }
};
