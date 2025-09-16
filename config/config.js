// /config/config.js
// ──────────────────────────────────────────────────────────────────────────────
// CONTROL EXTERNO DE ESTILO + UI + ENLACES + AJUSTES TÉCNICOS (SIN TOCAR INDEX)
// NOTA: Valores prellenados con lo que usa actualmente tu página.
//       Sube meta.version cuando modifiques este archivo para forzar actualización.
// ──────────────────────────────────────────────────────────────────────────────

window.APP_CONFIG = {
  // ────────────────────────────────────────────────────────────────────────────
  // META / VERSIONADO
  // NOTA: Identidad básica y control de cache-busting para que el SW refresque.
  // ────────────────────────────────────────────────────────────────────────────
  meta: {
    appName: "Programaciones mensuales",
    version: "1.0.1",          // ⬅️ súbelo cuando cambies la config
    themeColor: "#0b1421",     // <meta name="theme-color">
    lastUpdated: "2025-09-16"
  },

  // ────────────────────────────────────────────────────────────────────────────
  // SECURITY / POLÍTICAS DE CARGA
  // NOTA: Declaras aquí tus dominios oficiales y banderas de seguridad.
  //       El app.js debe leer esto y aplicar el "guard" de dominio.
  // ────────────────────────────────────────────────────────────────────────────
  security: {
    // Dominios autorizados para aplicar esta configuración
    allowedHosts: [
      "localhost", "127.0.0.1",
      "dla-tech.github.io",
      "vercel.app"          // si usas Vercel: permite *.vercel.app
      // "tudominio.com"    // añade tu dominio personalizado si aplica
    ],

    // Si true, el app.js validará el hostname y NO aplicará la config en hosts no autorizados
    enforceHostCheck: true,

    // Si en el futuro mueves escrituras sensibles a backend/Cloud Functions
    useBackendForSensitiveWrites: false,

    // Opcional: activar logs de seguridad en consola
    verbose: true
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ASSETS GLOBALES
  // NOTA: Rutas de imágenes/íconos. Cambias aquí sin tocar HTML.
  // ────────────────────────────────────────────────────────────────────────────
  assets: {
    pageBackgroundImage: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_7782.jpeg",
    logoRotating: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/Logo%20de%20la%20iglesia%20PIPJM-2.png",
    icon180: "icons/icon-180.png",
    icon512: "icons/icon-512.png",
    icons: { youtube: "", notification: "", download: "", externalLink: "" }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // THEME (COLORES / TIPOGRAFÍA / RADIOS / SOMBRAS / TRANSICIONES)
  // NOTA: Refleja tus CSS variables actuales con extras listos para crecer.
  // ────────────────────────────────────────────────────────────────────────────
  theme: {
    mode: "auto", // "light" | "dark" | "auto"
    colors: {
      ink: "#0b1421",                   // texto oscuro en superficies claras
      primary: "#2563eb",               // azul activo/nav
      surfaceCard: "rgba(255,255,255,.86)", // cards
      bgBase: "#0b1421",                // fondo base
      textOnDark: "#ffffff",
      btnGreen: "#34C759",
      btnBlue: "#4285F4",
      btnDark: "#0f172a",
      btnYellow: "#facc15",
      btnYouTube: "#ff0000",
      headerGlassBg: "rgba(255,255,255,.55)",
      headerBorder: "rgba(0,0,0,.08)",
      navActiveBg: "#e9efff",
      navActiveText: "#2563eb",
      liveHeadGradient: "linear-gradient(90deg,#b91c1c,#ef4444)",
      pageOverlay: "linear-gradient(180deg,rgba(8,11,20,.35),rgba(8,11,20,.6))"
    },
    typography: {
      family: "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
      scale: { base: "16px", h1: "", h2: "", h3: "", body: "", caption: "" }
    },
    radii: {
      uiRadius: "14px",
      card: "14px",
      button: "12px",
      modal: "12px",
      navLink: "10px",
      promoImage: "14px"
    },
    shadows: {
      soft: "0 8px 20px rgba(0,0,0,.15)",
      promoImg: "0 10px 34px rgba(0,0,0,.20)",
      modal: "0 6px 16px rgba(0,0,0,.25)",
      btn: "0 2px 8px rgba(0,0,0,.25)"
    },
    transitions: {
      fast: "150ms",
      normal: "280ms",
      slow: "450ms",
      loaderFade: "2000ms" // debe coordinar con CSS del loader
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // LAYOUT / ESTRUCTURA VISUAL
  // NOTA: Header/Nav, fondo, grid, footer: todo editable aquí.
  // ────────────────────────────────────────────────────────────────────────────
  layout: {
    maxWidth: 1100, // .wrap
    header: {
      sticky: true,
      glass: { blur: "8px", saturate: 1.2 },
      bg: "rgba(255,255,255,.55)",
      borderColor: "rgba(0,0,0,.08)",
      hideOnScroll: true,
      nav: { linkActiveBg: "#e9efff", linkActiveText: "#2563eb" }
    },
    pageBackground: {
      image: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_7782.jpeg",
      css: "center/cover no-repeat",
      overlay: "linear-gradient(180deg,rgba(8,11,20,.35),rgba(8,11,20,.6))"
    },
    footer: { text: "© 2025 — Iglesia. Todos los derechos reservados.", color: "#e5e7eb" }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // LOADER / PANTALLA DE CARGA
  // NOTA: Imagen de pantalla completa + tiempos. Activa extras (texto, botón).
  // ────────────────────────────────────────────────────────────────────────────
  loader: {
    visible: true,
    image: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_8023.jpeg",
    objectFit: "cover",
    objectPosition: "50% 45%",
    minVisibleMs: 1500,
    fadeMs: 2000,
    hardFallbackMs: 4500, // 1500 + 2000 + 1500
    text: { enabled: false, content: "", color: "#FFFFFF", shadow: "0 6px 24px rgba(0,0,0,.35)" },
    extraButton: {
      enabled: false, label: "", href: "",
      variant: "filled", bg: "#facc15", color: "#000", border: ""
    },
    effectCanvas: { enabled: false }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // LOGO FIJO GIRATORIO
  // NOTA: Controla la imagen fija y su animación sin tocar estilos.
  // ────────────────────────────────────────────────────────────────────────────
  floatingLogo: {
    src: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/Logo%20de%20la%20iglesia%20PIPJM-2.png",
    position: { bottom: "20px", left: "20px", width: "80px" },
    spin: { enabled: true, axis: "Y", speed: "6s", timing: "linear" }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // NAVEGACIÓN / BOTONES SUPERIORES
  // NOTA: Puedes renombrar/mostrar/ocultar enlaces del header y añadir nuevos.
  // ────────────────────────────────────────────────────────────────────────────
  nav: {
    links: [
      { id: "calendarios", label: "Calendarios", href: "#calendarios", active: false },
      { id: "redes", label: "Redes sociales", href: "#redes", active: false },
      { id: "ubicacion-templo", label: "Ubicación del templo", href: "#ubicacion-templo", active: false },
      { id: "ubicacion-cultos", label: "Ubicación de los cultos", href: "#ubicacion-cultos", active: false },
      { id: "proposito", label: "Propósito", href: "#proposito", active: false }
    ],
    purposeButton: {
      enabled: false, label: "Propósito", href: "#proposito",
      variant: "filled", bg: "#2563eb", color: "#ffffff", border: ""
    },
    installButton: {
      id: "btn-install", visible: true, label: "Descargar Web",
      styles: { bg: "#7c3aed", color: "#fff" }
    },
    notifButton: {
      id: "btn-notifs",
      visibleInStandalone: true,
      labels: { default: "NOTIFICACIONES", ok: "✅ NOTIFICACIONES", denied: "🚫 NOTIFICACIONES" },
      colors: { base: "#ef4444", ok: "#22c55e" }
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CALENDARIOS / ENLACES (iCloud, Google)
  // NOTA: Todo lo de los botones de suscripción/apertura se controla aquí.
  // ────────────────────────────────────────────────────────────────────────────
  calendars: {
    icloudWebcal:
      "webcal://p158-caldav.icloud.com/published/2/MTYyMzg4NDUwMjAxNjIzOFc_RCw-iCOSeM_LMqkWZcQMuX9sTzZF-PyrU9d06Oy4V0VhxUSZVqCmqzUsygyCHgAllfl2DFW34WcFi8EvPD8",
    google: {
      calendarId:
        "72086005a3ac9a324642e6977fb8f296d531c3520b03c6cf342495ed215e0186@group.calendar.google.com",
      embedUrl:
        "https://calendar.google.com/calendar/embed?src=72086005a3ac9a324642e6977fb8f296d531c3520b03c6cf342495ed215e0186%40group.calendar.google.com&ctz=America%2FPuerto_Rico&bgcolor=%23f4f7fb&hl=en",
      webUrlPrefix: "https://calendar.google.com/calendar/u/0/r?cid="
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ICS (PARSEAR EVENTOS) — SIGUE EXTERNO
  // NOTA: URL ICS en GitHub + TZ y labels para encabezados.
  // ────────────────────────────────────────────────────────────────────────────
  ics: {
    controlledOutside: true,
    url:
      "https://raw.githubusercontent.com/dla-tech/Media-privada/e3d2ade1012edc154134d5aeb3af46a5755643e5/calendarios/calendario.ics",
    timeZone: "America/Puerto_Rico",
    labels: { martesPrefix: "Martes", miercolesPrefix: "Miércoles" }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // PROMOS (EXTERNO POR JSON)
  // NOTA: Declaras el manifest actual y algunas opciones de UI.
  // ────────────────────────────────────────────────────────────────────────────
  promos: {
    manifestUrl:
      "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/Promo/Promos.json",
    grid: {
      minWidthByCount: { "1": "480px", "2": "300px", "<=4": "280px", "<=6": "240px", "<=9": "200px", ">9": "180px" },
      titleColor: "#ffffff",
      showDownloadAllButton: true,
      downloadAllLabel: "⬆️DESCARGAR PROMOS⬆️"
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // YOUTUBE LIVE (DETECTAR EN VIVO)
  // NOTA: Controla handle y, si quieres, el channelId para embeber el player.
  // ────────────────────────────────────────────────────────────────────────────
  youtube: {
    handle: "@pipjm9752",
    channelId: "",       // si lo añades, el embed se arma solo
    liveUrlSuffix: "/live"
  },

  // ────────────────────────────────────────────────────────────────────────────
  // MAPAS / UBICACIONES
  // NOTA: Mapas embebidos se ajustan según LOCATION del ICS; defaults por si falta.
  // ────────────────────────────────────────────────────────────────────────────
  maps: {
    defaultTownFallback: "Maunabo, Puerto Rico",
    municipios: ["Maunabo","Emajagua","Yabucoa","Humacao","Las Piedras","Patillas","Guayama","San Lorenzo"]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // FIREBASE / NOTIFICACIONES
  // NOTA: Mismo config actual (compat) + VAPID + colección donde guardas tokens.
  // ────────────────────────────────────────────────────────────────────────────
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
    firestore: {
      enabled: true,
      tokensCollection: "fcmTokens"
    },
    serviceWorkers: {
      app: "./service-worker.js",
      fcm: "./firebase-messaging-sw.js"
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // PWA (INSTALACIÓN)
  // NOTA: Textos/visibilidad y fallback de tutorial si no hay beforeinstallprompt.
  // ────────────────────────────────────────────────────────────────────────────
  pwa: {
    install: {
      showButton: true,
      buttonId: "btn-install",
      fallbackTutorial:
        "Paso 1: Presiona los tres puntos (abajo derecha o arriba)\n\nPaso 2: presiona \"Compartir\"\n\nPaso 3: Desliza hacia abajo selecciona \"Agregar a Inicio\"\n\nPaso 4: Presiona (Boton Azul) \"Agregar\""
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // MENSAJES / BANNERS GLOBAL
  // NOTA: Mensaje visible en la web que podrás activar sin tocar el index.
  // ────────────────────────────────────────────────────────────────────────────
  messages: {
    globalNotice: {
      enabled: false,
      content: "",           // HTML simple permitido
      href: "",
      target: "_self",
      bg: "#2563eb",
      color: "#ffffff"
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CAPAS / Z-INDEX
  // NOTA: Controlas prioridades de apilado (loader arriba del todo, etc.).
  // ────────────────────────────────────────────────────────────────────────────
  layers: {
    zIndex: {
      header: 50,
      live: 10,
      modal: 10000,
      loader: 100000,
      floatingLogo: 9999
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // RESPONSIVE
  // NOTA: Breakpoints por si quieres customizar sin tocar CSS.
  // ────────────────────────────────────────────────────────────────────────────
  responsive: {
    breakpoints: { xs: 0, sm: 480, md: 768, lg: 1024, xl: 1280 }
  }
};
