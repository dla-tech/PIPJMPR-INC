
/* app.js */

const $  = (s,r=document)=>r.querySelector(s);
const el = (t,p={})=>Object.assign(document.createElement(t),p);
const cssv=(n,v)=>document.documentElement.style.setProperty(n,v);

/* ───────── Guard ───────── */
(function(){
  const {security}=window.APP_CONFIG||{};
  if(!security) return;
  const host=location.hostname;
  const ok = !security.enforceHostCheck ||
             (security.allowedHosts||[]).some(h=>host===h || host.endsWith('.'+h));
  window.__CFG_ALLOWED = ok;
  if(security.verbose) console.log(ok?'✅ host ok:':'⛔ host bloqueado:', host);
  if(!ok){
    const bar=el('div',{textContent:'Dominio no autorizado para esta configuración.'});
    bar.style.cssText='position:fixed;top:0;left:0;right:0;z-index:999999;padding:8px 12px;background:#b91c1c;color:#fff;font:600 13px system-ui;text-align:center';
    document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(bar));
  }
})();

/* ───────── HOTFIX: loader suave si el index lo mata ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG||{};
  const L   = cfg.loader||{};

  // Si el index ya quitó la clase 'loading' o borró el <style id="preload-style">,
  // entonces activamos un loader alterno (#loader2) SIN tocar index.html
  const killerRan = !document.documentElement.classList.contains('loading') ||
                    !document.getElementById('preload-style');
  if (!killerRan) return; // si el loader original sigue vivo, no hacemos nada

  // Style suave: oculta todo menos #loader2
  let s = document.getElementById('preload-style-soft');
  if(!s){
    s = document.createElement('style');
    s.id = 'preload-style-soft';
    s.textContent = 'body > *:not(#loader2){visibility:hidden}';
    document.head.appendChild(s);
  }
  document.documentElement.classList.add('loading');

  // Crear overlay #loader2 (copia visual del loader original)
  let ld = document.getElementById('loader2');
  if(!ld){
    ld = document.createElement('div');
    ld.id = 'loader2';
    ld.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:transparent;z-index:100001;opacity:1;transition:opacity '+(+L.fadeMs||800)+'ms ease';
    if (L.image){
      const img = document.createElement('img');
      img.src = L.image;
      img.alt = 'Cargando';
      img.style.cssText = 'position:absolute;inset:0;width:100vw;height:100vh;object-fit:'+(L.objectFit||'cover')+';object-position:'+(L.objectPosition||'50% 45%');
      ld.appendChild(img);
    }
    document.body.appendChild(ld);
  }

  // Tiempos tomados del config (loader)
  const MIN  = +L.minVisibleMs || 5000;         // mínimo visible
  const FADE = +L.fadeMs       || 9000;          // desvanecido
  const HARD = (+L.hardFallbackMs || MIN+FADE+2000); // tope duro
  const start = performance.now();

  function done2(){
    document.documentElement.classList.remove('loading');
    ld.style.opacity = '0';
    setTimeout(()=>{ try{ ld.remove(); }catch(_){ } }, FADE+100);
    document.getElementById('preload-style-soft')?.remove();
  }

  // Cierra cuando la página cargue + MIN visible
  window.addEventListener('load', ()=>{
    const wait = Math.max(0, MIN - (performance.now()-start));
    setTimeout(done2, wait);
  }, {once:true});

  // Failsafe para no quedarse pegado
  setTimeout(done2, HARD);
})();

/* ───────── Theme/Meta/Loader ───────── */
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

  /* ───────── Loader / Pantalla de carga (Editable) ─────────
     - Para activar “tipo Walmart”: usa video (mp4 h264) de 3–5s
     - Para activar con imagen: usa image
     - Para apagar: enabled:false  (o deja video/image vacío)
  */
  loader: {
    enabled: true,

    // ✅ Usa UNO:
    // video: "https://raw.githubusercontent.com/dla-tech/Media-privada/main/Loader/navidad.mp4",
    // image: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_8023.jpeg",

    // Por ahora lo dejo con tu imagen actual (hasta que subas el mp4):
    video: "",
    image: "https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_8023.jpeg",

    // Opcional (recomendado si usas video, por si tarda en cargar)
    poster: "",

    objectFit: "cover",
    objectPosition: "50% 45%",

    // ⏱️ “Intro” corta (ponlo a menos de 5000 si quieres <5s)
    minVisibleMs: 4500,
    fadeMs: 600,
    hardFallbackMs: 4500 + 600 + 2000,

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
  maxItems: 200,          // máximo de notificaciones guardadas
  badgeMax: 9,            // muestra "9+" cuando se excede el límite
  ui: {
    title: "Notificaciones",
    markAllLabel: "Marcar como leídas",
    closeLabel: "Cerrar",
    openLabel: "Abrir",
    deleteLabel: "Eliminar",
    emptyText: "No hay notificaciones"
  }
},

  /* ───────── Calendarios ───────── */
  calendars: {
    google: {
      apiKey: "AIzaSyAUEMnHkbmD989pm7hntFRW3eBBaJvbc2I",
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
    // ⚠️ Usa siempre el enlace RAW de GitHub para que cargue bien
    url: "https://raw.githubusercontent.com/dla-tech/Media-privada/main/calendarios/calendario.ics",

    // Zona horaria en la que se interpretarán los eventos
    timeZone: "America/Puerto_Rico",

    // Etiquetas que se muestran en la web
    labels: {
      martesPrefix: "Martes",
      miercolesPrefix: "Miércoles"
    },

    // Opciones extra para robustez
    cacheBuster: true,   // si es true, añade un timestamp al URL para evitar caché
    fallbackTown: "Maunabo, Puerto Rico" // localidad que se usará si no detecta ninguna
  },

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
      fcm: "./service-worker.js"
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

/* ───────── Logo fijo giratorio (config.floatingLogo) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG || {};
  const fl  = cfg.floatingLogo || {};
  const img = document.getElementById('floating-logo');
  if(!img || !fl.src) return;

  img.src = fl.src;
  img.alt = fl.alt || 'Logo';

  const pos = fl.position || {};
  img.style.position = 'fixed';
  img.style.bottom = pos.bottom || '20px';
  img.style.left   = pos.left   || '20px';
  img.style.width  = pos.width  || '80px';
  img.style.height = 'auto';
  img.style.zIndex = '9999';
  img.style.pointerEvents = 'none';

  const sp = fl.spin || {};
  img.style.animation = `spinY ${sp.speed || '6s'} linear infinite`;
})();
  /* ───────── Header/Nav + autohide ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG;
  const header = $('#header'); if(!header) return;

  header.style.backdropFilter = `saturate(${cfg.layout?.header?.glass?.saturate||1.2}) blur(${cfg.layout?.header?.glass||'8px'})`;
  header.style.background = cfg.layout?.header?.bg || 'rgba(255,255,255,.55)';
  header.style.borderBottom = `1px solid ${cfg.layout?.header?.borderColor || 'rgba(0,0,0,.08)'}`;

  const nav=el('nav'); nav.className='nav';
  const spacer=el('div'); spacer.className='spacer'; nav.appendChild(spacer);

  (cfg.nav?.links||[]).forEach(l=>{
    nav.appendChild(el('a',{href:l.href||'#',textContent:l.label||l.id||'Link',className:'navlink'}));
  });

  // Botón de activar notificaciones (permiso/token) — NO es la bandeja
  const nb = el('a',{
    id: cfg.nav?.notifButton?.id || 'btn-notifs',
    className: 'navlink',
    href: '#',
    textContent: cfg.nav?.notifButton?.labels?.default || 'NOTIFICACIONES'
  });
  // visible solo en PWA instalada
  const isStandaloneNow =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (window.navigator.standalone === true);
  nb.style.display = isStandaloneNow ? '' : 'none';

  // Botón de instalar
  const ibCfg = cfg.nav?.installButton;
  const ib = el('a',{id:ibCfg?.id||'btn-install',className:'navlink',href:'#',textContent:ibCfg?.label||'Descargar App'});
  ib.style.background = ibCfg?.styles?.bg || '#7c3aed';
  ib.style.color = ibCfg?.styles?.color || '#fff';
  ib.style.fontWeight = '800';

  nav.append(nb, ib);
  header.innerHTML=''; header.appendChild(nav);

  // autohide
  (function(){
    let lastY=window.scrollY||0, down=0, up=0; const TH=12, MIN_TOP=24;
    window.addEventListener('scroll',()=>{
      const y=window.scrollY||0, d=y-lastY;
      if(d>0){ down+=d; up=0; if(y>MIN_TOP && down>TH) header.classList.add('hide'); }
      else if(d<0){ up+=-d; down=0; if(up>TH) header.classList.remove('hide'); if(y<=0) header.classList.remove('hide'); }
      lastY=y;
    }, {passive:true});
  })();
})();

/* ───────── Calendarios (embed + botones + modal) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG;
  const sec = $('#calendarios'); if(!sec) return;

  const h1=el('h1'); h1.style.cssText='font-size:1.35em;line-height:1.25;font-weight:700;color:#fff;text-align:center;margin:10px 0 14px';
  h1.textContent = "Primera Iglesia Pentecostal de Jesucristo de Maunabo, P.R. Inc.";

  // Reutiliza el #promos del HTML y colócalo ARRIBA del calendario
  const promosWrap = $('#promos');
  if (promosWrap){
    promosWrap.className = 'promos-wrap';
    promosWrap.style.display = 'none';
    promosWrap.innerHTML = `
      <div id="promoGrid" class="promo-grid" style="--gap:12px;--radius:12px"></div>
      <div class="promo-actions" style="display:flex;justify-content:center;margin:10px 0 16px">
        <button id="btn-descargar-todo" class="promo-dl">${cfg.promos?.grid?.downloadAllLabel||'⬆️DESCARGAR PROMOS⬆️'}</button>
      </div>`;
  }

  const card=el('div'); card.className='card'; card.style.marginBottom='12px';
  const ifr=el('iframe',{src:cfg.calendars?.google?.embedUrl||'',title:'Calendario Google',loading:'lazy',referrerPolicy:'no-referrer-when-downgrade',height:'600'});
  card.appendChild(ifr);

  const grid=el('div'); grid.className='grid cols-3';
  grid.append(
    el('a',{id:'btn-gcal',className:'btn btn-g',href:'#',textContent:'🟢 Añadir en Google Calendar (Android/PC)'}),
    el('a',{id:'btn-ios', className:'btn btn-i', href:'#', textContent:'📱 Añadir en Apple Calendar (iPhone/Mac)'}),
    el('a',{id:'btn-download',className:'btn btn-y',href:'#',textContent:'⬇️ Descargar Google Calendar'})
  );

  const modal = el('div',{id:'gcal-choice',className:'contact-modal'});
  modal.innerHTML = `<div class="modal-content">
    <h3 style="margin:0 0 10px">¿Cómo quieres abrirlo?</h3>
    <a id="gcal-open-web" class="btn btn-g" href="#">🌐 Abrir en la web</a>
    <button id="gcal-open-app" class="btn-d">📱 Abrir en la app</button>
    <button id="gcal-cancel" class="btn-d" style="background:#6b7280">Cancelar</button>
  </div>`;

  const note = el('p'); note.className='card note'; note.style.marginTop='12px';
  note.textContent='📌 Todo cambio en la programación de la iglesia se reflejará automáticamente en tu calendario.';

  sec.innerHTML=''; 
  if (promosWrap) sec.append(h1, promosWrap, card, grid, modal, note);
  else            sec.append(h1, card, grid, modal, note);

  // Botones calendario
  (function(){
    const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid=/Android/i.test(navigator.userAgent);
    const CAL_ID = cfg.calendars?.google?.calendarId||'';
    const WEB_URL = (cfg.calendars?.google?.webUrlPrefix||'https://calendar.google.com/calendar/u/0/r?cid=') + encodeURIComponent(CAL_ID);
    const ICLOUD = cfg.calendars?.icloudWebcal||'';

    $('#btn-ios')?.addEventListener('click', (e)=>{
      e.preventDefault();
      if(!ICLOUD) return;
      const go=url=>{ if(window.self!==window.top && isIOS) window.top.location.href=url; else location.href=url; };
      go(ICLOUD);
      setTimeout(()=>alert("Si no se abrió el calendario, copia y pega este enlace en Safari:\n"+ICLOUD),2500);
    });

    const choice=$('#gcal-choice'), openWeb=$('#gcal-open-web'), openApp=$('#gcal-open-app'), cancel=$('#gcal-cancel');
    const show=()=>choice&&(choice.style.display='flex'), hide=()=>choice&&(choice.style.display='none');
    $('#btn-gcal')?.addEventListener('click',e=>{e.preventDefault();show();});
    cancel?.addEventListener('click',hide);
    choice?.addEventListener('click',e=>{ if(e.target===choice) hide(); });
    openWeb?.addEventListener('click',e=>{
      e.preventDefault(); hide();
      try{ const w=window.open(WEB_URL,'_blank','noopener'); if(!w) location.href=WEB_URL; }catch(_){ location.href=WEB_URL; }
    });
    openApp?.addEventListener('click',e=>{
      e.preventDefault(); hide();
      const go=u=>{ if(window.self!==window.top) window.top.location.href=u; else location.href=u; };
      if(isAndroid){
        const intent='intent://calendar.google.com/calendar/r?cid='+encodeURIComponent(CAL_ID)+'#Intent;scheme=https;package=com.google.android.calendar;S.browser_fallback_url='+encodeURIComponent(WEB_URL)+';end';
        let f=false; const fin=()=>{ if(f) return; f=true; clearTimeout(t1); clearTimeout(t2); };
        go(intent);
        const onHidden=()=>fin(); window.addEventListener('pagehide',onHidden,{once:true});
        document.addEventListener('visibilitychange',()=>{ if(document.hidden) fin(); },{once:true});
        window.addEventListener('blur',onHidden,{once:true});
        const t1=setTimeout(()=>{ if(!f && !document.hidden) go(WEB_URL); },2200);
        const t2=setTimeout(()=>{ if(!f && !document.hidden) go('https://play.google.com/store/apps/details?id=com.google.android.calendar'); },4500);
      }else go(WEB_URL);
    });

    $('#btn-download')?.addEventListener('click',e=>{
      e.preventDefault();
      if(isAndroid) location.href='https://play.google.com/store/apps/details?id=com.google.android.calendar';
      else if(isIOS) location.href='https://apps.apple.com/app/google-calendar/id909319292';
      else location.href='https://calendar.google.com/';
    });
  })();
})();

/* ───────── Secciones estáticas: templo+propósito ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const t = $('#ubicacion-templo');
  if(t){
    t.innerHTML = `
      <h2>Ubicación del templo</h2>
      <div class="card">
        <p><strong>Dirección:</strong> <a href="https://maps.app.goo.gl/4R9ZXAmw1ZcnBTL49?g_st=ipc" target="_blank" rel="noopener">Ver en Google Maps</a></p>
        <a href="https://maps.app.goo.gl/4R9ZXAmw1ZcnBTL49?g_st=ipc" target="_blank" rel="noopener">
          <img src="https://raw.githubusercontent.com/dla-tech/Media-privada/refs/heads/main/IMG_7782.jpeg" alt="Ubicación del templo" style="width:100%; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,.25)">
        </a>
      </div>`;
  }
  const p = $('#proposito');
  if(p){
    p.innerHTML = `
      <h2>Propósito</h2>
      <div class="card">
        <p><strong>Nuestro propósito</strong> es: “Llevar el evangelio a toda criatura, dar un mensaje de esperanza, mostrar el amor de Dios al mundo y ayudar al necesitado.”</p>
        <h3 style="margin-top:16px; font-size:1.1em; color:#0b1421;">Horarios de cultos y actividades</h3>
        <ul class="list">
          <li><strong>Lunes:</strong> Culto de oración en el templo — 7:00 p.m.</li>
          <li><strong>Martes y Miércoles:</strong> Cultos evangelísticos en Maunabo y lugares limítrofes — 7:00 p.m.</li>
          <li><strong>Jueves:</strong> Culto de la Sociedad de Niños, oración o estudio bíblico — 7:00 p.m.</li>
          <li><strong>Viernes:</strong> Culto de las Sociedades de Damas, Caballeros y Jóvenes — 7:00 p.m.</li>
          <li><strong>Sábado:</strong> Altar familiar. (Una vez al mes, ayuno congregacional) — 6:00 a.m.</li>
          <li><strong>Domingo:</strong>
            <ul>
              <li>Oración/Ayuno — desde las 6:00 a.m.</li>
              <li>Apertura de Escuela Bíblica — 8:45 a.m.</li>
              <li>Cierre de Escuela Bíblica — 10:45 a.m.</li>
              <li>Comienzo del culto de adoración — 11:15 a.m.</li>
            </ul>
          </li>
        </ul>
      </div>`;
  }
})();

/* ───────── Google Calendar API (cultos: rotación + navegación) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg=window.APP_CONFIG;
  const CAL_ID = cfg.calendars?.google?.calendarId;
  const API_KEY = cfg.calendars?.google?.apiKey;
  if(!CAL_ID || !API_KEY) return;
  const TZ = cfg.ics?.timeZone || 'America/Puerto_Rico';

  const toTZ = d => new Date(d.toLocaleString('en-US',{timeZone:TZ}));
  const addDays = (d,n)=> (d=new Date(d), d.setDate(d.getDate()+n), d);
  const dayKey = d => {
    const z = toTZ(d);
    const y = z.getFullYear();
    const m = String(z.getMonth()+1).padStart(2,'0');
    const da = String(z.getDate()).padStart(2,'0');
    return `${y}-${m}-${da}`;
  };

  function normalizeLocation(raw){
    if(!raw) return 'Maunabo, Puerto Rico';
    let txt=String(raw).split(/[-–—/|]/).pop().trim();
    txt=txt.replace(/\s*\(.*?\)\s*/g,' ').replace(/\s{2,}/g,' ').trim();
    const municipios=['Maunabo','Emajagua','Yabucoa','Humacao','Las Piedras','Patillas','Guayama','San Lorenzo'];
    const has=municipios.some(m=>new RegExp(`\\b${m}\\b`,'i').test(txt));
    if(has){ if(!/puerto\s*rico/i.test(txt)) txt+=', Puerto Rico'; return txt; }
    return `${txt}, ${window.APP_CONFIG?.maps?.defaultTownFallback||'Maunabo, Puerto Rico'}`;
  }

  function setMap(iframeEl, locationText, pinUrl){
    if(!iframeEl) return;
    const q=normalizeLocation(locationText);
    iframeEl.src='https://www.google.com/maps?output=embed&q='+encodeURIComponent(q);
    iframeEl.title='Mapa: '+q;
    let overlay = iframeEl.parentElement.querySelector('.map-overlay');
    if(!overlay){
      overlay = el('a'); overlay.className='map-overlay'; overlay.target='_blank'; overlay.rel='noopener';
      overlay.style.cssText='position:absolute;inset:0;z-index:5;';
      const holder=iframeEl.parentElement; const cs=getComputedStyle(holder);
      if(cs.position==='static') holder.style.position='relative'; holder.appendChild(overlay);
    }
    overlay.href = pinUrl || ('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q));
  }

  function getEventStart(ev){
    if (ev.start?.dateTime) return new Date(ev.start.dateTime);
    if (ev.start?.date) return new Date(ev.start.date + 'T00:00:00');
    return null;
  }
  function getEventEnd(ev){
    if (ev.end?.dateTime) return new Date(ev.end.dateTime);
    if (ev.end?.date) return new Date(ev.end.date + 'T23:59:59');
    return null;
  }
  function isUrl(s){
    return /^https?:\/\//i.test(String(s||'').trim());
  }
  function formatDayLabel(d){
    return d.toLocaleDateString('es-PR',{weekday:'long', day:'numeric', month:'long', timeZone:TZ});
  }
  function formatTimeRange(ev){
    if(ev.allDay) return 'Todo el día';
    const s = ev.start;
    const e = ev.end || null;
    const t1 = s.toLocaleTimeString('es-PR',{hour:'numeric', minute:'2-digit', timeZone:TZ});
    if(!e) return t1;
    const t2 = e.toLocaleTimeString('es-PR',{hour:'numeric', minute:'2-digit', timeZone:TZ});
    return `${t1}–${t2}`;
  }
  function extractPredicador(desc){
    if(!desc) return '';
    const txt = String(desc).trim();
    if(!txt) return '';
    const first = txt.split(/\r?\n/)[0].trim();
    return first;
  }

  (async function load(){
    try{
      const now=new Date();
      const timeMin = new Date(addDays(now, -30)).toISOString();
      const timeMax = new Date(addDays(now, 60)).toISOString();
      const url = 'https://www.googleapis.com/calendar/v3/calendars/' +
        encodeURIComponent(CAL_ID) +
        '/events?singleEvents=true&orderBy=startTime&timeMin=' +
        encodeURIComponent(timeMin) +
        '&timeMax=' +
        encodeURIComponent(timeMax) +
        '&key=' + encodeURIComponent(API_KEY);

      const res=await fetch(url, {cache:'no-store'}); if(!res.ok) throw new Error('HTTP '+res.status);
      const data=await res.json();
      const items = Array.isArray(data.items) ? data.items : [];

      const events = items
        .filter(ev=>!ev.status || ev.status!=='cancelled')
        .map(ev=>{
          const start = getEventStart(ev);
          const end   = getEventEnd(ev);
          if(!start) return null;
          return {
            start,
            end,
            allDay: !!ev.start?.date && !ev.start?.dateTime,
            summary: ev.summary || 'Culto',
            location: ev.location || '',
            desc: ev.description || '',
            url: ev.htmlLink || '',
            key: dayKey(start)
          };
        })
        .filter(Boolean)
        .sort((a,b)=>a.start-b.start);

      if(!events.length) return;

      const cultos = $('#ubicacion-cultos'); if(!cultos) return;
      cultos.innerHTML = `
        <h2>Ubicación de cultos evangelísticos</h2>
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">
            <p style="margin:0;flex:1">Algunos servicios se realizan en ubicaciones distintas:</p>
            <div style="display:flex;gap:8px">
              <button id="culto-prev" class="btn btn-d" style="padding:9px 16px;background:#fde047;border:2px solid #f59e0b;color:#dc2626;font-weight:800;border-radius:10px">Anterior</button>
              <button id="culto-next" class="btn btn-d" style="padding:9px 16px;background:#fde047;border:2px solid #f59e0b;color:#dc2626;font-weight:800;border-radius:10px">Siguiente</button>
            </div>
          </div>
          <div class="grid cols-2">
            <div>
              <p class="subhead"><span id="lbl-ev-1">Día</span></p>
              <p><strong id="title-ev-1">Culto</strong><br><span id="addr-ev-1">(predicador)</span></p>
              <iframe height="260" loading="lazy" title="Culto martes"></iframe>
            </div>
            <div>
              <p class="subhead"><span id="lbl-ev-2">Día</span></p>
              <p><strong id="title-ev-2">Culto</strong><br><span id="addr-ev-2">(predicador)</span></p>
              <iframe height="260" loading="lazy" title="Culto miércoles"></iframe>
            </div>
          </div>
        </div>`;

      const tIframe = $('#ubicacion-cultos .grid.cols-2 > div:nth-child(1) iframe');
      const wIframe = $('#ubicacion-cultos .grid.cols-2 > div:nth-child(2) iframe');

      let manualOffset = 0;
      let lastUserAction = 0;
      const IDLE_MS = 60 * 1000;

      function selectForDay(key, now){
        const list = events.filter(e=>e.key===key);
        if(!list.length) return null;
        if(!now) return list[0];
        const active = list.find(e=>e.start <= now && e.end && now <= e.end);
        if(active) return active;
        const next = list.find(e=>e.start > now);
        return next || list[0];
      }

      function indexByNow(){
        const now = new Date();
        const todayKey = dayKey(now);
        const ev = selectForDay(todayKey, now);
        if(ev){
          const idx = events.findIndex(x=>x===ev);
          if(idx >= 0) return idx;
        }
        const next = events.findIndex(e=>e.start > now);
        if(next >= 0) return next;
        return 0;
      }

      function getIndex(){
        const base = indexByNow();
        let idx = base + manualOffset;
        if(idx < 0) idx = 0;
        if(idx >= events.length) idx = events.length - 1;
        return idx;
      }

      function renderAt(index){
        const ev1 = events[index];
        const ev2 = events[index+1] || null;

        if(ev1){
          $('#lbl-ev-1').innerHTML = `${formatDayLabel(ev1.start)} — <strong style="color:#0b1421">${formatTimeRange(ev1)}</strong>`;
          $('#title-ev-1').textContent = ev1.summary;
          const pred1 = extractPredicador(ev1.desc);
          $('#addr-ev-1').textContent = pred1 || '(predicador)';
          const pin1 = isUrl(ev1.location) ? ev1.location : null;
          setMap(tIframe, ev1.location, pin1);
        }
        if(ev2){
          $('#lbl-ev-2').innerHTML = `${formatDayLabel(ev2.start)} — <strong style="color:#0b1421">${formatTimeRange(ev2)}</strong>`;
          $('#title-ev-2').textContent = ev2.summary;
          const pred2 = extractPredicador(ev2.desc);
          $('#addr-ev-2').textContent = pred2 || '(predicador)';
          const pin2 = isUrl(ev2.location) ? ev2.location : null;
          setMap(wIframe, ev2.location, pin2);
        } else {
          $('#lbl-ev-2').textContent = '';
          $('#title-ev-2').textContent = 'Sin próximo culto';
          $('#addr-ev-2').textContent = '';
          if(wIframe) wIframe.removeAttribute('src');
        }
      }

      function renderDayBased(){
        const now = new Date();
        const todayKey = dayKey(now);
        const tomorrow = addDays(toTZ(now), 1);
        const tomorrowKey = dayKey(tomorrow);

        const ev1 = selectForDay(todayKey, now);
        const ev2 = selectForDay(tomorrowKey, null);

        if(ev1){
          $('#lbl-ev-1').innerHTML = `${formatDayLabel(ev1.start)} — <strong style="color:#0b1421">${formatTimeRange(ev1)}</strong>`;
          $('#title-ev-1').textContent = ev1.summary;
          const pred1 = extractPredicador(ev1.desc);
          $('#addr-ev-1').textContent = pred1 || '(predicador)';
          const pin1 = isUrl(ev1.location) ? ev1.location : null;
          setMap(tIframe, ev1.location, pin1);
        } else {
          $('#lbl-ev-1').textContent = formatDayLabel(toTZ(now));
          $('#title-ev-1').textContent = 'Sin culto hoy';
          $('#addr-ev-1').textContent = '';
          if(tIframe) tIframe.removeAttribute('src');
        }

        if(ev2){
          $('#lbl-ev-2').innerHTML = `${formatDayLabel(ev2.start)} — <strong style="color:#0b1421">${formatTimeRange(ev2)}</strong>`;
          $('#title-ev-2').textContent = ev2.summary;
          const pred2 = extractPredicador(ev2.desc);
          $('#addr-ev-2').textContent = pred2 || '(predicador)';
          const pin2 = isUrl(ev2.location) ? ev2.location : null;
          setMap(wIframe, ev2.location, pin2);
        } else {
          $('#lbl-ev-2').textContent = formatDayLabel(tomorrow);
          $('#title-ev-2').textContent = 'Sin culto mañana';
          $('#addr-ev-2').textContent = '';
          if(wIframe) wIframe.removeAttribute('src');
        }
      }

      function renderAuto(){
        if(Date.now() - lastUserAction > IDLE_MS){
          manualOffset = 0;
          renderDayBased();
          return;
        }
        renderAt(getIndex());
      }

      $('#culto-prev')?.addEventListener('click', ()=>{
        manualOffset -= 1;
        lastUserAction = Date.now();
        renderAt(getIndex());
      });
      $('#culto-next')?.addEventListener('click', ()=>{
        manualOffset += 1;
        lastUserAction = Date.now();
        renderAt(getIndex());
      });

      renderAuto();
      setInterval(renderAuto, 60 * 1000);
    }catch(e){ console.error('No se pudo cargar Google Calendar API:', e); }
  })();
})();

/* ───────── YouTube live ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG;
  const sec = $('#redes'); if(!sec) return;

  // Título de sección
  const h2 = el('h2',{textContent:'Redes sociales'});
  const card = el('div'); card.className='card';
  const box  = el('div'); box.className='grid cols-1';

  // Botón YouTube
  const btn = el('a',{
    className:'btn btn-yt',
    href:`https://youtube.com/${(cfg.youtube?.handle||'@pipjm9752')}`,
    target:'_blank', rel:'noopener',
    textContent:'▶️ YouTube'
  });

  // Contenedor Live
  const liveWrap = el('div',{id:'live-wrap',className:'live-wrap'});
  liveWrap.innerHTML = `
    <div class="live-head"><span class="live-dot"></span> EN VIVO AHORA</div>
    <div class="live-player" id="live-player"></div>
    <a id="live-cta" class="live-cta" href="#" target="_blank" rel="noopener">Ver en YouTube</a>
  `;

  // Correo
  const mail = el('a',{
    className:'btn btn-d',
    href:'mailto:pipjm1@gmail.com',
    textContent:'✉️ pipjm1@gmail.com'
  });

  // Montar estructura
  box.append(btn, liveWrap, mail);
  card.appendChild(box);
  sec.innerHTML=''; 
  sec.append(h2,card);

  // Configurar enlaces/live
  const handle  = cfg.youtube?.handle || '@pipjm9752';
  const liveUrl = `https://www.youtube.com/${handle.replace(/^@/,'@')}/live`;
  $('#live-cta').href = liveUrl;

  if (cfg.youtube?.channelId) {
    // Mostrar bloque y embeber directamente el player
    liveWrap.style.display = 'block';
    const src = `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(cfg.youtube.channelId)}&autoplay=1&mute=1&rel=0&modestbranding=1`;
    $('#live-player').innerHTML = `
      <iframe src="${src}" 
              title="YouTube live" 
              allow="autoplay; encrypted-media; picture-in-picture" 
              allowfullscreen></iframe>`;

    // Fallback si el iframe no carga en ~4s
    setTimeout(() => {
      const ifr = $('#live-player iframe');
      if (!ifr || !ifr.contentWindow) {
        liveWrap.style.display = 'block'; // deja visible el CTA aunque no cargue el iframe
      }
    }, 4000);

  } else {
    // Sin channelId: muestra solo el CTA
    liveWrap.style.display = 'block';
    $('#live-player').innerHTML = '';
  }
})();

/* ───────── Promos (JSON) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const url = window.APP_CONFIG?.promos?.manifestUrl; if(!url) return;
  const section = $('#promos'); const grid = el('div',{id:'promoGrid',className:'promo-grid'});
  section.innerHTML=''; section.appendChild(grid);
  const actions=el('div',{className:'promo-actions'});
  const btnAll=el('button',{id:'btn-descargar-todo',className:'promo-dl',textContent:(window.APP_CONFIG?.promos?.grid?.downloadAllLabel)||'⬆️DESCARGAR PROMOS⬆️'}); 
  actions.appendChild(btnAll);
  section.appendChild(actions);

  // ⚖️ Promos más finas y responsivas
  function computeMinWidthByCount(n){
    if(n===1) return '340px';
    if(n===2) return '280px';
    if(n<=4) return '240px';
    if(n<=6) return '200px';
    if(n<=9) return '180px';
    return '160px';
  }

  function render(promos){
    section.classList.toggle('one',promos.length===1);
    section.classList.toggle('two',promos.length===2);
    section.classList.toggle('many',promos.length>=3);

    const minW = computeMinWidthByCount(promos.length);
    grid.style.setProperty('--min', minW);
    grid.style.display='grid';
    grid.style.gridTemplateColumns='repeat(auto-fill, minmax(var(--min), 1fr))';
    grid.style.gap='12px';

    grid.innerHTML = promos.map((p,i)=>`
      <article class="promo-card" data-index="${i}" style="width:var(--min);max-width:100%;overflow:hidden">
        <a class="promo-link" href="${p.img}" data-filename="${p.filename || `promo-${i+1}.jpg`}" download style="display:block">
          <div class="promo-media">
            <img src="${p.img}" alt="${p.title?p.title:`Promoción ${i+1}`}" 
                 loading="lazy" decoding="async" 
                 style="display:block;width:100%;height:auto;border-radius:12px" />
          </div>
        </a>
        ${p.title?`<div class="promo-title" style="padding:6px 4px 0;font:600 14px system-ui;text-align:center">${p.title}</div>`:''}
      </article>`).join('');

    section.style.display = promos.length?'block':'none';

    btnAll.onclick = async ()=>{
      for(const p of promos){ await downloadImage(p.img, p.filename||'promocion.jpg'); }
    };
    grid.addEventListener('click', (e)=>{
      const a=e.target.closest('a.promo-link'); if(!a) return;
      e.preventDefault();
      downloadImage(a.href, a.dataset.filename||'promocion.jpg');
    });
  }

  async function downloadImage(url, filename){
    try{
      const res=await fetch(url,{cache:'no-store'}); if(!res.ok) throw new Error('HTTP '+res.status);
      const blob=await res.blob(); const o=URL.createObjectURL(blob);
      const a=el('a',{href:o,download:filename}); document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(o);
    }catch{ const a=el('a',{href:url,download:filename}); document.body.appendChild(a); a.click(); a.remove(); }
  }

  (async function load(){
    try{
      const res=await fetch(url+'?t='+Date.now(),{cache:'no-store'}); if(!res.ok) throw new Error('HTTP '+res.status);
      const data=await res.json();
      const activos=(data||[]).filter(p=>p.active).sort((a,b)=>(a.order||0)-(b.order||0));
      const promos=activos.map((p,i)=>({title:p.title||'',img:p.imageUrl||'',filename:p.filename||`promo-${(p.order||i)+1}.jpg`})).filter(p=>!!p.img);
      render(promos);
    }catch(e){ console.error('No se pudo cargar Promos.json:', e); }
  })();
})();

/* === PWA install — compacto, draggable, con minimizar (Android+iOS) === */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG || {};
  const btn = document.getElementById((cfg.pwa?.install?.buttonId)||'btn-install');
  if(!btn) return;

  // Ocultar si ya está instalada
  const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone===true);
  if (isStandalone){ btn.style.display='none'; return; }

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS     = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Captura / reutiliza el beforeinstallprompt
  let deferredPrompt = window.__deferredPrompt || null;
  window.addEventListener('beforeinstallprompt', (e)=>{
    try{ e.preventDefault(); }catch(_){}
    deferredPrompt = e;
    window.__deferredPrompt = e;
    // Asegura visibilidad del botón si el navegador lo soporta
    btn.style.display = '';
    btn.disabled = false;
  });

  // ───────── UI compacta (widget) ─────────
  let widget = null;
  function ensureWidget(){
    if (widget) return widget;
    const w = document.createElement('div');
    w.id = 'pwa-mini-widget';
    w.style.cssText = `
      position:fixed; right:14px; bottom:14px; z-index:100000;
      width: 300px; max-width: 92vw;
      font: 400 14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial;
      color:#111;
    `;
    w.innerHTML = `
      <div id="pwa-card" style="
        background:#fff; border:1px solid #e5e7eb; border-radius:12px;
        box-shadow:0 8px 22px rgba(0,0,0,.18);
      ">
        <div id="pwa-head" style="
          cursor:move; display:flex; align-items:center; gap:8px;
          padding:8px 10px; border-bottom:1px solid #eef0f2; background:#f9fafb; border-radius:12px 12px 0 0;
        ">
          <strong style="font:700 13px system-ui">Instalar app</strong>
          <span style="margin-left:auto"></span>
          <button id="pwa-min" title="Minimizar" style="border:0;background:#e5e7eb;border-radius:8px;padding:4px 8px">–</button>
          <button id="pwa-close" title="Cerrar" style="border:0;background:#e11d48;color:#fff;border-radius:8px;padding:4px 8px">×</button>
        </div>
        <div id="pwa-body" style="padding:10px 10px 8px 10px"></div>
        <div id="pwa-cta" style="display:flex;gap:8px;justify-content:flex-end;padding:8px 10px;border-top:1px solid #eef0f2">
          <button id="pwa-back"  style="display:none;border:0;background:#e5e7eb;border-radius:8px;padding:6px 10px">Atrás</button>
          <button id="pwa-next"  style="border:0;background:#111;color:#fff;border-radius:8px;padding:6px 10px">Siguiente</button>
        </div>
      </div>
      <button id="pwa-pill" style="
        display:none; position:absolute; right:0; bottom:0; transform:translate(0,0);
        border:1px solid #e5e7eb; background:#fff; border-radius:20px;
        padding:7px 10px; box-shadow:0 6px 16px rgba(0,0,0,.15); font-weight:600;
      ">Instalar app ⤴</button>
    `;
    document.body.appendChild(w);

    // Drag (card y píldora)
    function makeDraggable(el, handle){
      let sx=0, sy=0, ox=0, oy=0, dragging=false;
      const onDown = (ev)=>{
        dragging=true;
        const r = w.getBoundingClientRect();
        ox = r.right; oy = r.bottom; // anclaje conservador
        sx = (ev.touches?ev.touches[0].clientX:ev.clientX);
        sy = (ev.touches?ev.touches[0].clientY:ev.clientY);
        ev.preventDefault();
      };
      const onMove = (ev)=>{
        if(!dragging) return;
        const cx = (ev.touches?ev.touches[0].clientX:ev.clientX);
        const cy = (ev.touches?ev.touches[0].clientY:ev.clientY);
        const dx = cx - sx, dy = cy - sy;
        // mover el contenedor w (right/bottom) sin romper layout
        const nr = Math.max(6, 14 - dx);
        const nb = Math.max(6, 14 - dy);
        w.style.right  = nr + 'px';
        w.style.bottom = nb + 'px';
      };
      const onUp = ()=>{ dragging=false; };
      (handle||el).addEventListener('mousedown',onDown,{passive:false});
      (handle||el).addEventListener('touchstart',onDown,{passive:false});
      window.addEventListener('mousemove',onMove,{passive:false});
      window.addEventListener('touchmove',onMove,{passive:false});
      window.addEventListener('mouseup',onUp,{passive:true});
      window.addEventListener('touchend',onUp,{passive:true});
    }
    makeDraggable(w, w.querySelector('#pwa-head'));
    makeDraggable(w.querySelector('#pwa-pill'));

    // Minimizar / Restaurar / Cerrar
    const card = w.querySelector('#pwa-card');
    const pill = w.querySelector('#pwa-pill');
    w.querySelector('#pwa-min').onclick = ()=>{ card.style.display='none'; pill.style.display='inline-block'; };
    w.querySelector('#pwa-close').onclick= ()=>{ w.style.display='none'; };
    pill.onclick = ()=>{ pill.style.display='none'; card.style.display='block'; };

    widget = w;
    return w;
  }

  // Helper: detectar versión mayor de iOS (18, 26, etc.)
function getIOSMajorVersion(){
  const ua = navigator.userAgent || '';
  const m = ua.match(/OS (\d+)[._]\d+/i); 
  return m ? parseInt(m[1], 10) : null;
}

// Pasos de instalación según plataforma y versión
function stepsFor(platform){
  if (platform === 'ios') {
    const v = getIOSMajorVersion();
    if (v === 18) {
      // iOS 18 → botón Compartir directo
      return [
        'Paso 1: Presiona "compartir" <strong>Compartir</strong> (cuadrado con flecha hacia arriba).',
        'Paso 2: Desliza hacia abajo hasta encontrar "agregar a inicio" .',
        'Paso 3: Confirma el nombre "PIPJM" <strong>“Agregar a Inicio”</strong>.',
        'Paso 4: Arriba a la derecha presiona agregar <strong>“Agregar”</strong> (botón azul).'
      ];
    }
    if (v >= 26) {
      // iOS 26+ → menú de tres puntos primero
      return [
        'Paso 1: Toca los tres puntos <strong>tres puntos</strong> (⋮).',
        'Paso 2: Presiona compartir <strong>Compartir</strong>.',
        'Paso 3: Desliza hacia abajo y presiona "agregar a inicio" <strong>“Agregar a Inicio”</strong>.',
        'Paso 4: Arriba a la derecha presiona "agregar" <strong>“Agregar”</strong> (botón azul).'
      ];
    }
    // fallback si no reconoce versión → usar pasos estilo iOS 18
    return [
      'Paso 1: Toca el botón <strong>Compartir</strong>.',
      'Paso 2: Desliza hacia abajo.',
      'Paso 3: Presiona <strong>“Agregar a Inicio”</strong>.',
      'Paso 4: Presiona <strong>Agregar</strong> arriba a la derecha.'
    ];
  }
    // Android (fallback)
    return [
      'Paso 1: Toca el menú ⋮ (arriba derecha).',
      'Paso 2: Presiona “Agregar a la pantalla de inicio”.',
      'Paso 3: Confirma en el diálogo.',
      'Listo: La app quedará en tu pantalla de inicio.'
    ];
  }

  // Render de guía compacta (sin overlay, con “Siguiente”)
  function openGuide(platform){
    const w = ensureWidget();
    w.style.display = 'block';
    const body = w.querySelector('#pwa-body');
    const back = w.querySelector('#pwa-back');
    const next = w.querySelector('#pwa-next');

    const steps = stepsFor(platform);
    let idx = 0;
    const done = steps.map(()=>false);

    function paint(){
      body.innerHTML = `
        <ol style="margin:0;padding-left:18px">
          ${steps.map((s,i)=>{
            const ok = done[i], active = (i===idx);
            const color = ok ? '#059669' : active ? '#111' : '#6b7280';
            const icon = ok ? '✔︎ ' : '';
            return `<li style="margin:6px 0;color:${color};${active?'font-weight:700':''}">${icon}${s}</li>`;
          }).join('')}
        </ol>
        ${
          (platform!=='ios' && deferredPrompt)
          ? `<div style="margin-top:8px">
               <button id="pwa-try" style="border:0;background:#2563eb;color:#fff;border-radius:8px;padding:6px 10px">Probar instalar ahora</button>
             </div>`
          : ''
        }
        <div style="margin-top:6px;color:#6b7280;font-size:12px">Puedes arrastrar este recuadro donde te quede cómodo.</div>
      `;
      back.style.display = (idx>0)?'':'none';
      next.textContent   = (idx<steps.length-1)?'Siguiente':'Listo';

      const tryBtn = body.querySelector('#pwa-try');
      if (tryBtn){
        tryBtn.onclick = async ()=>{
          if (!deferredPrompt) return;
          try{ deferredPrompt.prompt(); await deferredPrompt.userChoice; }catch(_){}
          deferredPrompt = null; window.__deferredPrompt = null;
        };
      }
    }

    back.onclick = ()=>{ if(idx>0){ idx--; paint(); } };
    next.onclick = ()=>{
      done[idx] = true;
      if (idx < steps.length-1) { idx++; paint(); }
      else { w.style.display='none'; }
    };

    paint();
  }

  // Click del botón instalar
  btn.addEventListener('click', async (e)=>{
    e.preventDefault();

    // Si ya instalada, no hacemos nada (button debería estar oculto)
    const isStandaloneNow = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone===true);
    if (isStandaloneNow) return;

    // Android con prompt disponible → prompt nativo directo
    if (isAndroid && deferredPrompt){
      try{ deferredPrompt.prompt(); await deferredPrompt.userChoice; }catch(_){}
      deferredPrompt = null; window.__deferredPrompt = null;
      return;
    }

    // iOS o Android sin prompt → guía compacta
    openGuide(isIOS ? 'ios' : 'android');
  });

  // Si el navegador dispara “appinstalled”, ocultamos el botón
  window.addEventListener('appinstalled', ()=>{ btn.style.display='none'; });
})();

/* ───────── Firebase + notifs (permiso/token UI) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;

  // Evita duplicar inicialización si el script se evalúa 2 veces
  if (window.__FCM_UI_INIT__) return;
  window.__FCM_UI_INIT__ = true;

  const cfg = window.APP_CONFIG;
  if(!cfg?.firebase?.app) return;

  // Init Firebase compat
  if(!window.firebase?.apps?.length) firebase.initializeApp(cfg.firebase.app);
  if(!window.db && firebase.firestore) window.db = firebase.firestore();
  const messaging = firebase.messaging ? firebase.messaging() : null;

  // ───────── SW registrations (APP SW solamente) ─────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        window.appSW = await navigator.serviceWorker.register(
          cfg.firebase.serviceWorkers?.app || './service-worker.js',
          { scope: './' }
        );
        // Limpieza: desregistrar SW viejo de FCM si existe
        try{
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r=>{
            const url = r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || '';
            if (url.includes('firebase-messaging-sw')) return r.unregister();
          }));
        }catch(_){}
      } catch (e) {
        console.error('Error registrando SW app:', e);
      }
    }, { once: true });
  }

  // ───────── Registrar/Esperar SW exclusivo para FCM ─────────
  let __fcmRegPromise = null;

  async function waitForActiveSW(reg, timeoutMs = 12000){
    if (reg?.active) return reg.active;
    return await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('FCM SW no activó a tiempo')), timeoutMs);

      const check = () => {
        if (reg.active){
          clearTimeout(t);
          resolve(reg.active);
        }
      };

      if (reg.installing) reg.installing.addEventListener('statechange', check);
      if (reg.waiting)    reg.waiting.addEventListener('statechange', check);

      const iv = setInterval(() => {
        if (reg.active){
          clearInterval(iv);
          clearTimeout(t);
          resolve(reg.active);
        }
      }, 200);
    });
  }

  async function waitForFcmSW(){
    if(__fcmRegPromise) return __fcmRegPromise;

    __fcmRegPromise = (async ()=>{
      if (!('serviceWorker' in navigator)) return null;

      // Si ya lo tenemos cacheado
      if(window.fcmSW) return window.fcmSW;

      // Registrar explícitamente SW de FCM (scope igual que el sitio)
      const swPath = (cfg.firebase.serviceWorkers?.fcm || './service-worker.js');

      // Si ya existe un registration para ese scope, úsalo (evita duplicados)
      let reg = await navigator.serviceWorker.getRegistration('./');
      if (!reg) {
        reg = await navigator.serviceWorker.register(swPath, { scope:'./' });
      } else {
        // si existe, intenta actualizarlo para coger el SW nuevo
        try { await reg.update(); } catch(_) {}
      }

      await waitForActiveSW(reg);
      window.fcmSW = reg;
      return reg;
    })();

    return __fcmRegPromise;
  }

  // ✅ DocId seguro para Firestore (no usa token crudo)
  async function tokenDocId(token){
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(String(token)));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  // ✅ Indicador visual (✅/❌) sin mensajes técnicos
  function ensureTokenIndicator(btn){
    if(!btn) return null;
    let ind = document.getElementById('fcm-token-indicator');
    if(ind) return ind;

    ind = document.createElement('span');
    ind.id = 'fcm-token-indicator';
    ind.style.cssText = `
      margin-left:8px;
      font:900 14px/1 system-ui,-apple-system,Segoe UI,Roboto,Arial;
      display:inline-block;
      vertical-align:middle;
    `;
    btn.insertAdjacentElement('afterend', ind);
    return ind;
  }
  function setIndicator(ind, state){
    if(!ind) return;
    if(state === 'ok'){
      ind.textContent = '✅';
      ind.title = 'Token confirmado';
    }else if(state === 'bad'){
      ind.textContent = '❌';
      ind.title = 'Token no confirmado';
    }else{
      ind.textContent = '';
      ind.title = '';
    }
  }

  async function guardarTokenFCM(token){
    try{
      if(!window.db) return false;

      const ua   = navigator.userAgent || '';
      const host = location.hostname || '';
      const ts   = new Date().toISOString();

      const id  = await tokenDocId(token);
      const col = cfg.firebase.firestore?.tokensCollection || 'fcmTokens';

      await window.db.collection(col).doc(id).set(
        { token, ua, host, ts, updatedAt: ts },
        { merge:true }
      );

      return true;
    }catch(e){
      console.error('⛔ Error guardando token FCM en Firestore:', e);
      return false;
    }
  }

  let __fcmTokenPromise = null;
  const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

  async function obtenerToken(){
    if(!messaging) return null;
    if(!('Notification' in window)) return null;
    if(Notification.permission !== 'granted') return null;
    if(__fcmTokenPromise) return __fcmTokenPromise;

    __fcmTokenPromise = (async ()=>{
      try{
        const fcmReg = await waitForFcmSW();
        if(!fcmReg) return null;

        const opts = {
          vapidKey: cfg.firebase.vapidPublicKey,
          serviceWorkerRegistration: fcmReg
        };

        const token = await messaging.getToken(opts);

        // Guarda local + Firestore (si aplica)
        if (token) {
          try{ localStorage.setItem('fcm_token', token); }catch(_){}
          try{ localStorage.setItem('fcm_token_ts', String(Date.now())); }catch(_){}
          if(cfg.firebase.firestore?.enabled !== false){
            await guardarTokenFCM(token);
          }
        }

        return token || null;
      }catch(e){
        console.error('⛔ getToken FCM:', e);
        return null;
      }finally{
        __fcmTokenPromise = null;
      }
    })();

    return __fcmTokenPromise;
  }

  // ✅ Validación suave: si hay token local, lo aceptamos (no bloquea UI por Firestore)
  async function hasTokenLocal(){
    const t = localStorage.getItem('fcm_token') || '';
    return (t && t.length > 10) ? t : null;
  }

  // ✅ Auto-gestión: si hay permiso pero falta token (o falta en Firestore), lo re-genera/guarda
  async function ensureTokenHealth(){
    try{
      if(Notification.permission !== 'granted') return;
      const tok = await hasTokenLocal();
      if(!tok){
        await obtenerToken();
        return;
      }
      // Si el token es viejo, forzar refresh
      const ts = parseInt(localStorage.getItem('fcm_token_ts') || '0', 10);
      if (ts && (Date.now() - ts) > TOKEN_TTL_MS) {
        await refreshTokenHard();
        return;
      }
      // Si Firestore está habilitado, verifica que el doc exista (si no, lo re-guardamos)
      if(cfg.firebase.firestore?.enabled !== false && window.db){
        try{
          const id = await tokenDocId(tok);
          const col = cfg.firebase.firestore?.tokensCollection || 'fcmTokens';
          const snap = await window.db.collection(col).doc(id).get();
          if(!snap.exists){
            // si el doc no existe, intentamos re-guardar o refrescar el token
            await guardarTokenFCM(tok);
          }
        }catch(_){}
      }
    }catch(_){}
  }

  // Refresh fuerte (por si el token quedó inválido)
  async function refreshTokenHard(){
    try{
      if(!messaging) return null;
      const fcmReg = await waitForFcmSW();
      if(!fcmReg) return null;

      const opts = {
        vapidKey: cfg.firebase.vapidPublicKey,
        serviceWorkerRegistration: fcmReg
      };

      // Intentar borrar token actual (si existe)
      try{
        const current = await messaging.getToken(opts);
        if (current && typeof messaging.deleteToken === 'function') {
          await messaging.deleteToken(current);
        }
      }catch(_){}

      // Pedir uno nuevo
      const fresh = await messaging.getToken(opts);
      if (fresh) {
        try{ localStorage.setItem('fcm_token', fresh); }catch(_){}
        try{ localStorage.setItem('fcm_token_ts', String(Date.now())); }catch(_){}
        if(cfg.firebase.firestore?.enabled !== false){
          await guardarTokenFCM(fresh);
        }
      }
      return fresh || null;
    }catch(_){
      return null;
    }
  }

  // ───────── UI button (activar notificaciones) ─────────
  const nb = document.getElementById(cfg.nav?.notifButton?.id || 'btn-notifs');
  if(!nb) return;

  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (window.navigator.standalone === true);

  nb.style.display = isStandalone ? '' : 'none';
  nb.style.pointerEvents = 'auto';

  const indicator = ensureTokenIndicator(nb);

  async function setState(){
    const labels = cfg.nav?.notifButton?.labels || {};
    const p = (typeof Notification!=='undefined') ? Notification.permission : 'default';

    if(p === 'granted'){
      const tok = await hasTokenLocal();
      if(tok){
        nb.classList.add('ok');
        nb.textContent = labels.ok || '✅ NOTIFICACIONES';
        setIndicator(indicator, 'ok');
      }else{
        nb.classList.remove('ok');
        nb.textContent = labels.noToken || '⚠️ ACTIVAR NOTIFICACIONES';
        setIndicator(indicator, 'bad');
      }
    }else if(p === 'denied'){
      nb.classList.remove('ok');
      nb.textContent = labels.denied || '🚫 NOTIFICACIONES';
      setIndicator(indicator, 'bad');
    }else{
      nb.classList.remove('ok');
      nb.textContent = labels.default || 'NOTIFICACIONES';
      setIndicator(indicator, '');
    }
  }

  setState();
  // Auto-reparación al cargar
  ensureTokenHealth();

  nb.addEventListener('click', async (e)=>{
    e.preventDefault();

    if(typeof Notification === 'undefined'){
      alert('Este dispositivo no soporta notificaciones.');
      return;
    }

    nb.classList.add('loading');
    nb.textContent = '⏳ NOTIFICACIONES';
    setIndicator(indicator, '');

    try{
      const perm = (Notification.permission === 'granted')
        ? 'granted'
        : await Notification.requestPermission();

      if(perm === 'granted'){
        await obtenerToken();
      }

      await setState();
    }finally{
      nb.classList.remove('loading');
    }
  });

  // ✅ Token refresh (evita que “se invalide solo” con el tiempo)
  if (messaging && typeof messaging.onTokenRefresh === 'function') {
    try{
      messaging.onTokenRefresh(async ()=>{
        try{
          // Solo si ya están concedidas
          if (Notification.permission !== 'granted') return;

          const fcmReg = await waitForFcmSW();
          if(!fcmReg) return;

          const opts = {
            vapidKey: cfg.firebase.vapidPublicKey,
            serviceWorkerRegistration: fcmReg
          };

          const newToken = await messaging.getToken(opts);
          if(newToken){
            try{ localStorage.setItem('fcm_token', newToken); }catch(_){}
            if(cfg.firebase.firestore?.enabled !== false){
              await guardarTokenFCM(newToken);
            }
            await setState();
          }
        }catch(e){
          console.error('⛔ onTokenRefresh error:', e);
        }
      });
    }catch(_){}
  }
  // Refresh suave periódico (por si onTokenRefresh no dispara)
  if (messaging) {
    const REFRESH_MS = 6 * 60 * 60 * 1000; // 6 horas
    setInterval(async ()=>{
      try{
        if (Notification.permission !== 'granted') return;
        await obtenerToken();
        await setState();
      }catch(_){}
    }, REFRESH_MS);
  }

  // Primer plano: manda a bandeja interna
  if(messaging){
    messaging.onMessage((payload)=>{
      try{
        const d = payload?.data || {};
        window.dispatchEvent(new CustomEvent('app:notifIncoming',{ detail:{
          id:    payload?.messageId || d.id || '',
          ts:    Date.now(),
          title: d.title || payload?.notification?.title || 'Notificación',
          body:  d.body  || payload?.notification?.body  || '',
          date:  d.date  || '',
          image: d.image || '',
          link:  d.link  || ''
        }}));
      }catch(e){
        console.error('⛔ onMessage error', e);
      }
    });
  }

  // Reaccionar a cambios de modo standalone
  if(window.matchMedia){
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener?.('change', ()=>{
      const st = mq.matches || (window.navigator.standalone === true);
      nb.style.display = st ? '' : 'none';
    });
  }
})();
/* ───────── Bandeja interna + badge (campanita SOLO PWA) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;

  const cfg = window.APP_CONFIG || {};
  const inboxCfg = cfg.inbox || { enabled: true, storageKey:'notifs', maxItems:200, badgeMax:9,
    ui:{ title:'Notificaciones', markAllLabel:'Marcar leídas', closeLabel:'Cerrar', openLabel:'Abrir', deleteLabel:'Borrar', emptyText:'Sin notificaciones' }
  };
  if (inboxCfg.enabled === false) return;

  // Detecta PWA instalada (la UI solo aparece ahí)
  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (window.navigator.standalone === true);

  // === Storage (activo SIEMPRE, para que entren notifs aun sin UI)
  const KEY = inboxCfg.storageKey || 'notifs';
  const MAX = +inboxCfg.maxItems > 0 ? +inboxCfg.maxItems : 200;

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } };
  const save = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch {} };
  const seenMap = window.__notifSeenMap || (window.__notifSeenMap = new Map());
  const SEEN_TTL = 10 * 1000; // evita duplicados inmediatos (10s)

  const add  = (n) => {
    const list = load();
    const item = {
      id:   n.id   || (Date.now()+'-'+Math.random().toString(36).slice(2,8)),
      ts:   +n.ts  || Date.now(),
      title: String(n.title||'Notificación').slice(0,140),
      body:  String(n.body||''),
      date:  String(n.date||''),
      image: n.image||'',
      link:  n.link ||'',
      read:  !!n.read
    };
    const now = Date.now();
    // Limpieza simple del mapa
    for (const [k, t] of seenMap) {
      if (now - t > SEEN_TTL) seenMap.delete(k);
    }
    if (item.id) {
      if (seenMap.has(item.id)) return item;
      if (list.find(x => x.id === item.id)) return item;
      seenMap.set(item.id, now);
    } else {
      const fp = [item.title, item.body, item.date, item.link].join('|');
      if (seenMap.has(fp)) return item;
      seenMap.set(fp, now);
    }
    // Evitar duplicar si ya existe el mismo id (puede venir por SW + batch)
    // Guardar SIEMPRE, aunque se repita contenido
    list.unshift(item);
    save(list);
    return item;
  };
  const markAllRead = ()=>{ const a=load(); a.forEach(x=>x.read=true); save(a); return a; };
  const delById     = (id)=>{ const a=load().filter(x=>x.id!==id); save(a); return a; };

  // === UI: campana flotante + badge (SOLO si es standalone)
  let bell=null, badge=null, panel=null;

  if (isStandalone) {
    bell = document.createElement('button');
    bell.id='notif-bell';
    bell.setAttribute('aria-label','Bandeja de notificaciones');
    bell.innerHTML='🔔';
    bell.style.cssText='position:fixed;right:16px;bottom:16px;width:52px;height:52px;border-radius:999px;border:0;background:#111;color:#fff;font-size:22px;box-shadow:0 10px 30px rgba(0,0,0,.25);z-index:100002';
    document.body.appendChild(bell);

    badge = document.createElement('span');
    badge.id='notif-badge';
    badge.style.cssText='position:absolute;top:-6px;right:-4px;background:#ef4444;color:#fff;border-radius:999px;padding:2px 7px;font:700 11px system-ui;line-height:1;display:none';
    bell.appendChild(badge);

    panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.style.cssText = 'position:fixed;bottom:76px;right:16px;width:min(92vw,420px);max-height:70vh;overflow:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);display:none;z-index:100001';
    panel.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #eee;position:sticky;top:0;background:#fff;border-top-left-radius:12px;border-top-right-radius:12px">
        <strong style="font:700 14px system-ui">${inboxCfg.ui?.title||'Notificaciones'}</strong>
        <span style="margin-left:auto"></span>
        <button id="notif-markall" style="background:#111;color:#fff;border:0;border-radius:8px;padding:6px 10px">${inboxCfg.ui?.markAllLabel||'Marcar leídas'}</button>
        <button id="notif-closep" style="background:#6b7280;color:#fff;border:0;border-radius:8px;padding:6px 10px">${inboxCfg.ui?.closeLabel||'Cerrar'}</button>
      </div>
      <div id="notif-list" style="padding:8px 0"></div>
    `;
    document.body.appendChild(panel);

    const openPanel = ()=>{ render(); panel.style.display='block'; };
    const closePanel= ()=>{ panel.style.display='none'; };

    bell.addEventListener('click', ()=>{ panel.style.display==='block'?closePanel():openPanel(); });
    document.getElementById('notif-markall')?.addEventListener('click', ()=>{ save(markAllRead()); render(); updateBadge(); });
    document.getElementById('notif-closep')?.addEventListener('click', closePanel);
  }

  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c])); }

  function render(){
    const list = load();
    const box  = document.getElementById('notif-list');
    if (!box){ return; } // si no hay UI (no standalone), no renderizamos
    box.innerHTML = '';
    if (!list.length) {
      box.innerHTML = `<div style="padding:14px;color:#6b7280">${inboxCfg.ui?.emptyText||'Sin notificaciones'}</div>`;
      return;
    }
    for (const n of list) {
      const row = document.createElement('div');
      row.style.cssText = `padding:10px 12px;border-bottom:1px solid #eee;${n.read?'opacity:.65':''}`;
      row.innerHTML = `
        <div style="display:flex;gap:8px;align-items:baseline">
          <strong style="font:700 14px system-ui;flex:1">${esc(n.title)}</strong>
          <small style="color:#6b7280">${new Date(n.ts).toLocaleString()}</small>
        </div>
        <div style="font:400 13px/1.5 system-ui;white-space:pre-wrap;margin:4px 0 8px">${esc(n.body)}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button data-id="${n.id}" data-act="open" style="background:#2563eb;color:#fff;border:0;border-radius:8px;padding:6px 10px">${inboxCfg.ui?.openLabel||'Abrir'}</button>
          <button data-id="${n.id}" data-act="del"  style="background:#dc2626;color:#fff;border:0;border-radius:8px;padding:6px 10px">${inboxCfg.ui?.deleteLabel||'Borrar'}</button>
        </div>`;
      box.appendChild(row);
    }
  }

  // Badge (funciona aun sin UI; solo actualiza si existe)
  const BADGE_MAX = +inboxCfg.badgeMax > 0 ? +inboxCfg.badgeMax : 9;
  function updateBadge(){
    if (!badge) return;
    const c = load().filter(x=>!x.read).length;
    if (c>0){ badge.textContent = c > BADGE_MAX ? (BADGE_MAX + '+') : String(c); badge.style.display=''; }
    else { badge.style.display='none'; }
  }

  // Mensajes del SW → guarda nuevas (SIEMPRE activos)
  if ('serviceWorker' in navigator) {
    function pullFromSw(){
      navigator.serviceWorker.ready.then(reg=>{
        try{ reg.active?.postMessage({ type:'notif:pull' }); }catch(_){}
      });
    }
    navigator.serviceWorker.addEventListener('message', (ev)=>{
      const d = ev.data || {};
      if (d.type === 'notif:new' && d.payload) {
        add(d.payload);
        updateBadge();
      }
      if (d.type === 'notif:batch' && Array.isArray(d.payload)) {
        for (const n of d.payload) {
          add(n);
        }
        updateBadge();
      }
      if (d.type === 'notif:open' && typeof d.url === 'string') {
        try{
          const u = new URL(d.url, location.origin);
          const q = new URLSearchParams(u.hash.split('?')[1]||'');
          const t = decodeURIComponent(q.get('title') || '');
          const b = decodeURIComponent(q.get('body')  || '');
          const list = load(); let changed = false;
          for (const x of list) {
            if (!x.read && x.title===t && x.body===b) { x.read = true; changed = true; }
          }
          if (changed) save(list);
          updateBadge();
        }catch(_){}
      }
    });
    // Pedir notifs guardadas en SW (por si iOS no entregó postMessage)
    pullFromSw();
    // Reintentos suaves cuando la app vuelve al frente
    document.addEventListener('visibilitychange', ()=>{
      if (!document.hidden) pullFromSw();
    });
    window.addEventListener('focus', pullFromSw);
  }

  // Primer plano (evento que manda el módulo FCM UI) — SIEMPRE activo
  window.addEventListener('app:notifIncoming',(e)=>{
    add(e.detail||{});
    updateBadge();
  });

  // Abrir item → hoja (solo si existe UI)
  if (isStandalone) {
    panel.addEventListener('click', (e)=>{
      const b = e.target.closest('button'); if(!b) return;
      const id = b.getAttribute('data-id');
      const act = b.getAttribute('data-act');

      if (act === 'open') {
        const it = load().find(x=>x.id===id);
        if (it) {
          const qs = new URLSearchParams();
          qs.set('title', it.title);
          qs.set('body',  it.body);
          if (it.date)  qs.set('date',  it.date);
          if (it.image) qs.set('image', it.image);
          if (it.link)  qs.set('link',  it.link);
          location.hash = '/notif?'+qs.toString();

          // marcar leída
          const list = load();
          const i = list.findIndex(x=>x.id===id);
          if (i>=0) { list[i].read = true; save(list); }
          updateBadge();
        }
        panel.style.display='none';
      }
      if (act === 'del') {
        save(delById(id));
        render();
        updateBadge();
      }
    });
  }

  // Arranque
  updateBadge();
})();
/* ───────── Extra: auto-link en notificaciones ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;

  // Convierte fechas y URLs en <a> clickeables
  function autoLink(text){
    if(!text) return '';
    let out = String(text);

    // Detecta URLs (http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    out = out.replace(urlRegex, u=>{
      return `<a href="${u}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline">${u}</a>`;
    });

    // Detecta fechas en formato YYYY-MM-DD
    const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/g;
    out = out.replace(dateRegex, d=>{
      if(window.APP_CONFIG?.calendars?.google?.calendarId){
        const calId = encodeURIComponent(window.APP_CONFIG.calendars.google.calendarId);
        const tz    = encodeURIComponent(window.APP_CONFIG.ics?.timeZone || 'America/Puerto_Rico');
        const dPlain = d.replace(/-/g,'');
        const calUrl = `https://calendar.google.com/calendar/embed?src=${calId}&ctz=${tz}&dates=${dPlain}/${dPlain}`;
        return `<a href="${calUrl}" target="_blank" rel="noopener" style="color:#16a34a;text-decoration:underline">${d}</a>`;
      }
      return d;
    });

    return out;
  }

  // Hook: cuando mostramos la notificación en overlay
  window.renderNotifView = (function(orig){
    return function(payload){
      // Escapar contenido y aplicar autoLink
      if(payload && payload.body){
        payload.body = autoLink(payload.body);
      }
      orig(payload);
    };
  })(window.renderNotifView);
})(); // ← importante punto y coma 

/* ───────── Vista/overlay de notificación (hash #/notif) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;

  function esc(s){ return String(s ?? '').replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c])); }

  function parseNotifFromHash(){
    const h = location.hash || '';
    if (!h.startsWith('#/notif')) return null;
    const q = h.split('?')[1] || '';
    const qs = new URLSearchParams(q);
    return {
      title: qs.get('title') || 'Notificación',
      body:  qs.get('body')  || '',
      date:  qs.get('date')  || '',
      image: qs.get('image') || '',
      link:  qs.get('link')  || ''
    };
  }

  function ensureOverlay(){
    let wrap = document.getElementById('notif-view');
    if (wrap) return wrap;

    wrap = document.createElement('div');
    wrap.id = 'notif-view';
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);display:none;align-items:center;justify-content:center;z-index:100003;padding:18px';
    wrap.innerHTML = `
      <div id="notif-card" style="background:#fff;max-width:520px;width:100%;border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.25);overflow:hidden">
        <div style="display:flex;gap:10px;align-items:center;padding:12px 14px;border-bottom:1px solid #eee">
          <strong id="notif-title" style="font:800 16px system-ui;flex:1">Notificación</strong>
          <button id="notif-close" style="background:#111;color:#fff;border:0;border-radius:10px;padding:6px 10px">Cerrar</button>
        </div>
        <div style="padding:14px 16px">
          <div id="notif-date" style="color:#6b7280;font:600 12px system-ui;margin-bottom:6px"></div>
          <div id="notif-body" style="font:400 14px/1.5 system-ui;white-space:pre-wrap"></div>
          <img id="notif-image" alt="" style="display:none;margin-top:12px;width:100%;border-radius:10px;object-fit:cover;max-height:280px"/>
          <a id="notif-link" href="#" target="_blank" rel="noopener" style="display:none;margin-top:12px;color:#2563eb;text-decoration:underline;font:600 14px system-ui">Abrir enlace</a>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    wrap.addEventListener('click', (e)=>{
      if (e.target === wrap) hide();
    });
    wrap.querySelector('#notif-close')?.addEventListener('click', hide);

    return wrap;
  }

  function hide(){
    const wrap = document.getElementById('notif-view');
    if (wrap) wrap.style.display = 'none';
    // limpiar hash sin recargar
    if (location.hash.startsWith('#/notif')) {
      history.replaceState(null, '', location.pathname + location.search + '#');
    }
  }

  // Render público (para el auto-link hook)
  window.renderNotifView = function(payload){
    const wrap = ensureOverlay();
    const t = esc(payload?.title || 'Notificación');
    const b = payload?.body  || '';
    const d = esc(payload?.date || '');
    const img = payload?.image || '';
    const link = payload?.link || '';

    wrap.querySelector('#notif-title').textContent = t;
    wrap.querySelector('#notif-date').textContent = d ? ('📅 ' + d) : '';
    wrap.querySelector('#notif-body').innerHTML = b ? b : '';

    const imgEl = wrap.querySelector('#notif-image');
    if (img){
      imgEl.src = img;
      imgEl.style.display = '';
    } else {
      imgEl.style.display = 'none';
      imgEl.removeAttribute('src');
    }

    const linkEl = wrap.querySelector('#notif-link');
    if (link){
      linkEl.href = link;
      linkEl.style.display = '';
    } else {
      linkEl.style.display = 'none';
      linkEl.removeAttribute('href');
    }

    wrap.style.display = 'flex';
  };

  function handleHash(){
    const p = parseNotifFromHash();
    if (p) window.renderNotifView(p);
  }

  window.addEventListener('hashchange', handleHash);
  window.addEventListener('DOMContentLoaded', handleHash);
})();

/* ───────── Banner flotante de anuncio (versión directa y estable, X centrada) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;

  // 💬 Aquí escribes tu texto — usa \n para saltos de línea
  const promoText = ``.trim();

  // 🖼️ Imagen opcional (déjalo vacío si no quieres fondo)
  const promoImage = "https://raw.githubusercontent.com/dla-tech/Media-privada/main/IMG_8023.jpeg";

  // Si no hay texto, no muestra nada
  if(!promoText) return;

  // Crear fondo general
  const overlay = document.createElement('div');
  overlay.id = 'promo-overlay';
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:100000;
    background:rgba(0,0,0,.75);
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:20px;
    animation:fadeIn .3s ease;
  `;

  // Crear tarjeta principal
  const card = document.createElement('div');
  card.style.cssText = `
    position:relative;
    background:#fff;
    max-width:600px; width:90%;
    border-radius:16px;
    box-shadow:0 10px 40px rgba(0,0,0,.45);
    overflow:hidden;
    font:500 18px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial;
    text-align:center;
    color:#111;
  `;

  // Fondo de imagen opcional
  if(promoImage){
    const bg = document.createElement('img');
    bg.src = promoImage;
    bg.alt = "";
    bg.loading = "lazy";
    bg.style.cssText = `
      position:absolute; inset:0;
      width:100%; height:100%;
      object-fit:cover;
      filter:brightness(0.45) blur(1px);
      z-index:0;
    `;
    card.appendChild(bg);
  }

  // Contenido del texto
  const textBox = document.createElement('div');
  textBox.innerHTML = promoText.replace(/\n/g,'<br>');
  textBox.style.cssText = `
    position:relative; z-index:1;
    padding:28px 16px 34px;
    color:#fff;
    font-weight:600;
    text-shadow:0 2px 4px rgba(0,0,0,.4);
  `;
  card.appendChild(textBox);

  // Botón de cerrar (centrado debajo)
  const close = document.createElement('button');
  close.textContent = '✕';
  close.setAttribute('aria-label','Cerrar anuncio');
  close.style.cssText = `
    margin-top:18px;
    border:0;
    background:#e11d48;
    color:#fff;
    font-size:20px;
    font-weight:700;
    border-radius:50%;
    width:50px; height:50px;
    cursor:pointer;
    box-shadow:0 4px 12px rgba(0,0,0,.4);
  `;

  // Al hacer clic, cierra suavemente
  close.addEventListener('click',()=>{
    overlay.style.opacity='0';
    overlay.style.transition='opacity .3s ease';
    setTimeout(()=>overlay.remove(),300);
  });

  // Montar estructura
  overlay.appendChild(card);
  overlay.appendChild(close);
  document.body.appendChild(overlay);
})();
