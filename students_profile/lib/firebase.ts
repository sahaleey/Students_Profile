import { initializeApp, getApps } from "firebase/app";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from "firebase/analytics";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDb6VWyJJPARPfUbwPbhfvNdFJKGFiGjsQ",
  authDomain: "future-footing-457412-q1.firebaseapp.com",
  projectId: "future-footing-457412-q1",
  storageBucket: "future-footing-457412-q1.firebasestorage.app",
  messagingSenderId: "1054033141550",
  appId: "1:1054033141550:web:41afc979cb50af809364bf",
  measurementId: "G-X4LT5CGTWR",
};

// ✅ Initialize app safely
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Messaging (you already did this well)
export const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (supported && typeof window !== "undefined") {
    return getMessaging(app);
  }
  return null;
};

// ✅ Token fetch
export const fetchFirebaseToken = async () => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const currentToken = await getToken(messaging, {
      vapidKey:
        "BHpr6_sbxkJghLpyIanh1vqPSouiYuE02BvKdisLRgniKD3MC0KpnKRo6COewv4Wak4R7AEgGGxOXrcC01-btHg",
    });

    return currentToken || null;
  } catch (err) {
    console.error("Token error:", err);
    return null;
  }
};

// ✅ FIXED analytics (no more SSR crash)
export const getAnalyticsInstance = async () => {
  if (typeof window === "undefined") return null;

  const supported = await isAnalyticsSupported();
  if (!supported) return null;

  return getAnalytics(app);
};

export { app };
