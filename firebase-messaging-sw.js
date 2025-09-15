// Importa Firebase en el Service Worker
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Configuración de tu proyecto (la misma del index.html)
firebase.initializeApp({
  apiKey: "AIzaSyA0Yj_GIZqNzMaH5ChzWsSz_spORbHKMiY",
  authDomain: "miappiglesia.firebaseapp.com",
  projectId: "miappiglesia",
  storageBucket: "miappiglesia.firebasestorage.app",
  messagingSenderId: "624809525779",
  appId: "1:624809525779:web:2608aa1d23a84e466a35e6",
  measurementId: "G-8LLBP4ZB45"
});

// Inicializa Messaging en este SW
const messaging = firebase.messaging();

// Maneja notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Notificación recibida en segundo plano:", payload);

  const notificationTitle = payload.notification?.title || "Nueva notificación";
  const notificationOptions = {
    body: payload.notification?.body || "Tienes un nuevo mensaje",
    icon: "/icons/icon-192.png", // asegúrate de tener este icono en /icons/
    badge: "/icons/icon-72.png"  // opcional, para iOS/Android
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
