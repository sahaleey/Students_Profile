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

// 🚀 Leave this here for logging, but DO NOT call showNotification!
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Firebase automatically handled this message: ",
    payload,
  );
});
