/* config/config.js */
window.APP_CONFIG = {
  /* ───────── Meta/branding ───────── */
  meta: {
    appName: "Programaciones mensuales",
    themeColor: "#0b1421"
  },

  /* ───────── Seguridad de dominio ───────── */
  security: {
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "dla-tech.github.io"   // tu GitHub Pages
    ],
    enforceHostCheck: true,
    useBackendForSensitiveWrites: false,
    verbose: true
  },

  /* ───────── Tema / Layout ───────── */
  theme: {
    colors: {
      pageOverlay: "linear-gradient(180deg,rgba(8,11,20,.35),rgba(8,11,20,.6))"
    }
  },
  layout: {
    pageBackground: {
      image: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_7782.jpeg",
      overlay: "linear-gradient(180deg,rgba(8,11,20,.35),rgba(8,11,20,.6))"
    },
    header: {
      bg: "rgba(255,255,255,.55)",
      borderColor: "rgba(0,0,0,.08)",
      glass: { saturate: 1.2, blur: "8px" }
    },
    footer: { text: "© 2025 — Iglesia. Todos los derechos reservados.", color: "#e5e7eb" }
  },

  /* ───────── Assets ───────── */
  assets: {
    loaderImage: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_8023.jpeg",
    pageBackgroundImage: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_7782.jpeg",
    logoRotating: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/Logo%20de%20la%20iglesia%20PIPJM-2.png"
  },

  /* ───────── Loader / Pantalla de carga ───────── */
  loader: {
    image: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_8023.jpeg",
    objectFit: "cover",
    objectPosition: "50% 45%",
    minVisibleMs: 7500,
    fadeMs: 8000,
    hardFallbackMs: 7500 + 8000 + 7500,
    text: { enabled: false }
  },

  /* ───────── Nav / botones de arriba ───────── */
  nav: {
    links: [
      { id: "cal",  label: "Calendarios",           href: "#calendarios" },
      { id: "red",  label: "Redes sociales",        href: "#redes" },
      { id: "tpl",  label: "Ubicación del templo",  href: "#ubicacion-templo" },
      { id: "ctos", label: "Ubicación de los cultos", href: "#ubicacion-cultos" },
      { id: "prop", label: "Propósito",             href: "#proposito" }
    ],
    notifButton: {
      id: "btn-notifs",
      labels: {
        default: "NOTIFICACIONES",
        ok: "✅ NOTIFICACIONES",
        denied: "🚫 NOTIFICACIONES",
        noToken: "⚠️ ACTIVAR NOTIFICACIONES"
      }
    },
    installButton: {
      id: "btn-install",
      visible: true,
      label: "Descargar App",
      styles: { bg: "#7c3aed", color: "#fff" }
    }
  },

  /* ───────── Bandeja interna de notificaciones (campanita) ───────── */
  inbox: {
    enabled: true,
    storageKey: "notifs",   // donde se guardan en localStorage
    maxItems: 200,          // máximo guardadas
    badgeMax: 9,            // muestra "9+" cuando excede
    ui: {
      title: "Notificaciones",
      markAllLabel: "Marcar leídas",
      closeLabel: "Cerrar",
      openLabel: "Abrir",
      deleteLabel: "Borrar",
      emptyText: "Sin notificaciones"
    }
  },

  /* ───────── Calendarios ───────── */
  calendars: {
    google: {
      calendarId: "72086005a3ac9a324642e6977fb8f296d531c3520b03c6cf342495ed215e0186@group.calendar.google.com",
      embedUrl:
        "https://calendar.google.com/calendar/embed?src=72086005a3ac9a324642e6977fb8f296d531c3520b03c6cf342495ed215e0186%40group.calendar.google.com&ctz=America%2FPuerto_Rico&bgcolor=%23f4f7fb&hl=en",
      webUrlPrefix: "https://calendar.google.com/calendar/u/0/r?cid="
    },
    icloudWebcal:
      "webcal://p158-caldav.icloud.com/published/2/MTYyMzg4NDUwMjAxNjIzOFc_RCw-iCOSeM_LMqkWZcQMuX9sTzZF-PyrU9d06Oy4V0VhxUSZVqCmqzUsygyCHgAllfl2DFW34WcFi8EvPD8"
  },

  /* ───────── ICS (martes/miércoles) ───────── */
  ics: {
  // Siempre apunta a la rama MAIN para leer la última versión del .ics
  url: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/calendarios/calendario.ics",
  timeZone: "America/Puerto_Rico",
  labels: { martesPrefix: "Martes", miercolesPrefix: "Miércoles" }
},
maps: { defaultTownFallback: "Maunabo, Puerto Rico" }

  /* ───────── Promos (JSON externo) ───────── */
  promos: {
    manifestUrl: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/Promo/Promos.json",
    grid: { downloadAllLabel: "⬆️DESCARGAR PROMOS⬆️", titleColor: "#fff" }
  },

  /* ───────── YouTube Live ───────── */
  youtube: {
    handle: "@pipjm9752",
    channelId: "UCIecC8LfuWsK82SnPIjbqGQ" // opcional
  },

  /* ───────── PWA / install copy ───────── */
  pwa: {
    install: {
      buttonId: "btn-install",
      fallbackTutorial:
        'Paso 1: Presiona los tres puntos\n\nPaso 2: "Compartir"\n\nPaso 3: "Agregar a Inicio"\n\nPaso 4: "Agregar"',
      shareText: "Instala la app en tu pantalla de inicio"
    }
  },

  /* ───────── Firebase/FCM ───────── */
  firebase: {
    app: {
      apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
      authDomain: "miappiglesia-c703a.firebaseapp.com",
      projectId: "miappiglesia-c703a",
      storageBucket: "miappiglesia-c703a.appspot.com",
      messagingSenderId: "501538616252",
      appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
    },
    vapidPublicKey: "BGEv9r_6M-xZbyqhUzYYgMT9N6cMtJvLAmE64_H2WoB_tJA_L0qWlTQC3Lhz5tCnpbEd267QMHYvjASiHCOb7gU",
    serviceWorkers: {
      app: "./service-worker.js",
      fcm: "./firebase-messaging-sw.js"
    },
    firestore: { enabled: true, tokensCollection: "fcmTokens" }
  },

  /* ───────── Logo fijo girando ───────── */
  floatingLogo: {
    src: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/Logo%20de%20la%20iglesia%20PIPJM-2.png",
    position: { bottom: "20px", left: "20px", width: "80px" },
    spin: { speed: "6s" }
  },

  /* ───────── Mensajes/otros ───────── */
  messages: {
    globalNotice: { enabled: false },
    notifDefaults: { image: "https://example.com/fallback.jpg" }
  }
};