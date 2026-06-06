// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyDb6VWyJJPARPfUbwPbhfvNdFJKGFiGjsQ",
  authDomain: "future-footing-457412-q1.firebaseapp.com",
  projectId: "future-footing-457412-q1",
  storageBucket: "future-footing-457412-q1.firebasestorage.app",
  messagingSenderId: "1054033141550",
  appId: "1:1054033141550:web:41afc979cb50af809364bf",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",

    vibrate: [300, 150, 300, 150, 500],
    requireInteraction: true,
    data: {
      url: payload.data?.link || "/",
    },
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

self.addEventListener("notificationclick", function (event) {
  console.log("[firebase-messaging-sw.js] Notification clicked!");

  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url));
});
