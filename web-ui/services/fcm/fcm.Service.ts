import { initializeApp, getApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { toast } from "sonner";
import { api } from "../api";
import { API_ENDPOINTS } from "./fcm.ApiEndPoints";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FCM_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FCM_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FCM_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FCM_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FCM_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FCM_APP_ID
};

// Safe Next.js initialization pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Safely retrieve Messaging instance only on the client
const getMessagingInstance = (): Messaging | null => {
  if (typeof window !== "undefined" && "Notification" in window) {
    return getMessaging(app);
  }
  return null;
};

const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  return await Notification.requestPermission();
};

export const getFCMToken = async (): Promise<string | undefined> => {
  try {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const permission = await requestNotificationPermission();
    if (permission !== "granted") return;

    const messaging = getMessagingInstance();
    if (!messaging) return;
    // Build query parameters to pass Firebase config to the Service Worker
    const queryParams = new URLSearchParams({
      apiKey: firebaseConfig.apiKey || "",
      authDomain: firebaseConfig.authDomain || "",
      projectId: firebaseConfig.projectId || "",
      storageBucket: firebaseConfig.storageBucket || "",
      messagingSenderId: firebaseConfig.messagingSenderId || "",
      appId: firebaseConfig.appId || ""
    }).toString();

    const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${queryParams}`);
    
    // Wait for activation
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

    return await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
      serviceWorkerRegistration: registration
    });
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }
};

export const registerFCMToken = async (): Promise<boolean> => {
  try {
    const token = await getFCMToken();
    if (!token) {
      console.log("No FCM token");
      return false;
    }

    const response = await api.post(API_ENDPOINTS.FCM_REGISTER, {
      fcmToken: token,
      platform: 'WEB',
      deviceName: navigator.userAgent,
    });
    return !!response.data;
  } catch (err) {
    console.error("Error registering FCM token:", err);
    return false;
  }
};

export const unRegisterFCMToken = async (): Promise<boolean> => {
  try {
    if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return false;
    
    const messaging = getMessagingInstance();
    if (!messaging) return false;

    // Retrieve active service worker registration or register it with config
    const queryParams = new URLSearchParams({
      apiKey: firebaseConfig.apiKey || "",
      authDomain: firebaseConfig.authDomain || "",
      projectId: firebaseConfig.projectId || "",
      storageBucket: firebaseConfig.storageBucket || "",
      messagingSenderId: firebaseConfig.messagingSenderId || "",
      appId: firebaseConfig.appId || ""
    }).toString();
    const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${queryParams}`);

    const token = await getToken(messaging, { 
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    if (!token) return false;

    const response = await api.delete(API_ENDPOINTS.FCM_UNREGISTER, {
      data: {
        fcmToken: token,
        platform: 'WEB',
        deviceName: navigator.userAgent,
      }
    });
    return !!response.data;
  } catch (err) {
    console.error("Error unregistering FCM token:", err);
    return false;
  }
};

export const listenToForegroundNotifications = (onMessageReceived?: (payload: any) => void) => {
  try {
    const messaging = getMessagingInstance();
    if (!messaging) return;

    // Returns the native Firebase Unsubscribe method
    return onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      if (onMessageReceived) {
        onMessageReceived(payload);
      } else {
        const title = payload.notification?.title || payload.data?.title || "Notification";
        const body = payload.notification?.body || payload.data?.body || "";
        
        toast.info(title, {
          description: body,
        });
      }
    });
  } catch (error) {
    console.error("Error setting up foreground notification listener:", error);
  }
};