// public/firebase-messaging-sw.js

// Import Firebase libraries into the service worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

// Initialize the Firebase app in the service worker
const firebaseConfig = {
  // PASTE THE EXACT SAME CONFIG HERE AS YOU DID IN lib/firebase.ts
  apiKey: "AIzaSyDb6VWyJJPARPfUbwPbhfvNdFJKGFiGjsQ",
  authDomain: "future-footing-457412-q1.firebaseapp.com",
  projectId: "future-footing-457412-q1",
  storageBucket: "future-footing-457412-q1.firebasestorage.app",
  messagingSenderId: "1054033141550",
  appId: "1:1054033141550:web:41afc979cb50af809364bf",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Customize the background notification
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png", // Add a 192x192 icon in your public folder!
    badge: "/icon.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
