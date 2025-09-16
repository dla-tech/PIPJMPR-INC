/* app.js
   Reconstruye la UI y la lógica usando window.APP_CONFIG
   Mantiene el look&feel y comportamiento del index original
*/

/* ───────────────────────── 0) Helpers ───────────────────────── */
const $    = (sel, root=document) => root.querySelector(sel);
const $$   = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const el   = (tag, props={}) => Object.assign(document.createElement(tag), props);
const cssv = (name, val) => document.documentElement.style.setProperty(name, val);

/* anti-caché fetch */
async function fetchNoCache(url, type='text'){
  const res = await fetch(url + (url.includes('?')?'&':'?') + 't=' + Date.now(), { cache:'no-store' });
  if (!res.ok) throw new Error('HTTP '+res.status);
  return type === 'json' ? res.json() : res.text();
}

/* ──────────────────────── 1) Guard / seguridad ──────────────────────── */
(function guardHost(){
  const cfg = window.APP_CONFIG || {};
  const sec = cfg.security || {};
  const allowed = sec.allowedHosts || [];
  const enforce = sec.enforceHostCheck !== false; // por defecto true
  const host = location.hostname;
  const ok = !enforce || allowed.some(h => host === h || host.endsWith('.'+h));
  window.__CFG_ALLOWED = ok;
  if (sec.verbose) console.log(ok ? '✅ Dominio autorizado:' : '⛔ Dominio NO autorizado:', host);
  if (!ok){
    // aviso sutil (puedes quitarlo si no lo quieres)
    const bar = el('div',{textContent:'Dominio no autorizado para aplicar configuración externa'});
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;padding:8px 12px;background:#b91c1c;color:#fff;font:600 13px system-ui;text-align:center';
    document.addEventListener('DOMContentLoaded', ()=>document.body.appendChild(bar));
  }
})();

/* ───────────── 2) Meta/Theme/Fondo/Title/Overlay desde config ───────────── */
(function applyMetaAndTheme(){
  if (!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG || {};
  // Title
  if (cfg.meta?.appName) document.title = cfg.meta.appName;
  // Theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme && cfg.meta?.themeColor) metaTheme.setAttribute('content', cfg.meta.themeColor);
  // Fondo y overlay
  const bg = cfg.layout?.pageBackground?.image || cfg.assets?.pageBackgroundImage;
  if (bg) cssv('--bg-img', `url("${bg}")`);
  const overlay = cfg.layout?.pageBackground?.overlay || cfg.theme?.colors?.pageOverlay;
  if (overlay) cssv('--overlay', overlay);
})();

/* ───────────────────────── 3) Loader (pantalla) ───────────────────────── */
(function initLoader(){
  if (!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG || {};
  const L   = cfg.loader || {};
  const loader = $('#loader');
  if (!loader) return;

  // Imagen del loader
  loader.innerHTML = '';
  if (L.image){
    const img = el('img', { src: L.image, alt:'Pantalla de carga' });
    img.style.objectFit = L.objectFit || 'cover';
    img.style.objectPosition = L.objectPosition || '50% 45%';
    loader.appendChild(img);
  }

  const MIN_VISIBLE = Number(L.minVisibleMs ?? 1500);
  const FADE_TIME   = Number(L.fadeMs ?? 2000);
  const HARD_FALLBACK = Number(L.hardFallbackMs ?? (MIN_VISIBLE + FADE_TIME + 1500));

  const start = performance.now();
  const done = () => {
    document.body.classList.remove('loading');
    loader.classList.add('hide');
    setTimeout(()=>{ try{ loader.remove(); }catch(_){} }, FADE_TIME + 100);
  };

  window.addEventListener('load', () => {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, MIN_VISIBLE - elapsed);
    setTimeout(done, wait);
  }, { once:true });

  setTimeout(done, HARD_FALLBACK);

  // Texto/botón opcionales
  if (L.text?.enabled && L.text.content){
    const t = el('div', { innerHTML: L.text.content });
    t.style.cssText = `position:absolute;z-index:2;bottom:8vh;left:50%;transform:translateX(-50%);
      color:${L.text.color||'#fff'};font:600 16px/1.2 system-ui;text-align:center;text-shadow:${L.text.shadow||'0 6px 24px rgba(0,0,0,.35)'}`;
    loader.appendChild(t);
  }
  if (L.extraButton?.enabled){
    const b = L.extraButton;
    const a = el('a',{ href:b.href||'#', textContent:b.label||'Saber más' });
    a.style.cssText = `position:absolute;z-index:2;bottom:5vh;left:50%;transform:translateX(-50%);
      padding:10px 14px;border-radius:10px;text-decoration:none;font:800 14px/1 system-ui;
      background:${b.variant==='outline'?'transparent':(b.bg||'#facc15')};
      color:${b.color||'#000'};border:${b.border|| (b.variant==='outline'?'2px solid #fff':'none')}`;
    loader.appendChild(a);
  }
})();

/* ────────────────────── 4) Header + Nav + botones ────────────────────── */
(function initHeaderNav(){
  if (!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG || {};
  const header = $('#header');
  if (!header) return;

  // Estilos básicos desde config
  header.style.backdropFilter = `saturate(${cfg.layout?.header?.glass?.saturate||1.2}) blur(${cfg.layout?.header?.glass?.blur||'8px'})`;
  header.style.background = cfg.layout?.header?.bg || 'rgba(255,255,255,.55)';
  header.style.borderBottom = `1px solid ${cfg.layout?.header?.borderColor || 'rgba(0,0,0,.08)'}`;

  // Construir nav
  const nav = el('nav'); nav.className = 'nav';
  // Spacer para tablet+ (se maneja con CSS), pero añadimos por consistencia
  const spacer = el('div'); spacer.className = 'spacer';
  nav.appendChild(spacer);

  const links = (cfg.nav?.links || []).map(l=>{
    const a = el('a', { href: l.href||'#', textContent: l.label||l.id||'Link', className:'navlink' });
    nav.appendChild(a);
    return a;
  });

  // Botón de notificaciones
  const notifCfg = cfg.nav?.notifButton;
  if (notifCfg){
    const a = el('a',{ id:notifCfg.id||'btn-notifs', className:'navlink', href:'#', textContent: notifCfg.labels?.default || 'NOTIFICACIONES' });
    a.style.display = 'none'; // solo visible si standalone
    nav.appendChild(a);
  }

  // Botón instalar
  const installCfg = cfg.nav?.installButton;
  if (installCfg?.visible){
    const a = el('a',{ id: installCfg.id || 'btn-install', className:'navlink', href:'#', textContent: installCfg.label || 'Descargar Web' });
    a.style.background = installCfg.styles?.bg || '#7c3aed';
    a.style.color = installCfg.styles?.color || '#fff';
    a.style.fontWeight = '800';
    nav.appendChild(a);
  }

  header.innerHTML = '';
  header.appendChild(nav);

  /* Autohide header al hacer scroll (igual que original) */
  (function autoHide(){
    const elH = header;
    let lastY = window.scrollY||0, down=0, up=0;
    const THRESH=12, MIN_TOP=24;
    window.addEventListener('scroll', ()=>{
      const y = window.scrollY||0, d = y-lastY;
      if (d>0){ down+=d; up=0; if (y>MIN_TOP && down>THRESH) elH.classList.add('hide'); }
      else if (d<0){ up+=-d; down=0; if (up>THRESH) elH.classList.remove('hide'); if (y<=0) elH.classList.remove('hide'); }
      lastY = y;
    }, {passive:true});
  })();
})();

/* ───────────────────────── 5) Footer simple ───────────────────────── */
(function initFooter(){
  if (!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG || {};
  const footer = $('#footer'); if (!footer) return;
  footer.textContent = cfg.layout?.footer?.text || '© 2025 — Iglesia. Todos los derechos reservados.';
  footer.style.color = cfg.layout?.footer?.color || '#e5e7eb';
})();

/* ──────────────────────── 6) Logo giratorio fijo ──────────────────────── */
(function initFloatingLogo(){
  if (!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG || {};
  const logo = $('#floating-logo') || el('img',{ id:'floating-logo' });
  if (!logo.parentElement) document.body.appendChild(logo);
  logo.className = 'fixed-logo';
  logo.src = cfg.floatingLogo?.src || cfg.assets?.logoRotating || '';
  const p = cfg.floatingLogo?.position||{};
  if (p.bottom) logo.style.bottom = p.bottom;
  if (p.left)   logo.style.left = p.left;
  if (p.width)  logo.style.width = p.width;
  if (cfg.floatingLogo?.spin?.speed) logo.style.animationDuration = cfg.floatingLogo.spin.speed;
})();

/* ──────────────────────── 7) Mensaje/Banner global ──────────────────────── */
(function initGlobalNotice(){
  if (!window.__CFG_ALLOWED) return;
  const msg = (window.APP_CONFIG?.messages?.globalNotice)||{};
  if (!msg.enabled || !msg.content) return;
  const bar = el('a',{ innerHTML: msg.content, href: msg.href||'#', target: msg.target||'_self' });
  bar.style.cssText = `display:block;text-align:center;padding:10px 14px;font:700 14px/1.2 system-ui;text-decoration:none`;
  bar.style.background = msg.bg||'#2563eb';
  bar.style.color = msg.color||'#fff';
  document.addEventListener('DOMContentLoaded', ()=>document.body.prepend(bar));
})();

/* ──────────────── 8) Sección CALENDARIOS + modal elección ──────────────── */
(function initCalendars(){
  if (!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG || {};
  const sec = $('#calendarios'); if (!sec) return;

  // Título
  const h1 = el('h1'); h1.style.cssText='font-size:1.35em;line-height:1.25;font-weight:700;text-align:center;color:#fff;margin:10px 0 14px';
  h1.textContent = cfg.meta?.appName || 'Programaciones mensuales';
  // Calendario embed
  const card = el('div'); card.className='card'; card.style.marginBottom='12px';
  const iframe = el('iframe', {
    src: cfg.calendars?.google?.embedUrl || '',
    height: '600',
    title: 'Calendario Google',
    loading: 'lazy',
    referrerPolicy: 'no-referrer-when-downgrade'
  });
  card.appendChild(iframe);

  // Botones (GCal/iOS/Descargar)
  const grid = el('div'); grid.className='grid cols-3';
  const btnG = el('a',{ id:'btn-gcal', className:'btn btn-g', href:'#', textContent:'🟢 Añadir en Google Calendar (Android/PC)'}); btnG.target='_self';
  const btnI = el('a',{ id:'btn-ios',  className:'btn btn-i', href:'#', textContent:'📱 Añadir en Apple Calendar (iPhone/Mac)'}); btnI.target='_self';
  const btnD = el('a',{ id:'btn-download', className:'btn btn-y', href:'#', textContent:'⬇️ Descargar Google Calendar'}); btnD.target='_self';
  grid.append(btnG, btnI, btnD);

  // Modal elección (web/app)
  const modal = el('div',{ id:'gcal-choice', className:'contact-modal' });
  modal.innerHTML = `
    <div class="modal-content">
      <h3 style="margin:0 0 10px">¿Cómo quieres abrirlo?</h3>
      <a id="gcal-open-web" class="btn btn-g" href="#">🌐 Abrir en la web</a>
      <button id="gcal-open-app" class="btn-d">📱 Abrir en la app</button>
      <button id="gcal-cancel" class="btn-d" style="background:#6b7280">Cancelar</button>
    </div>
  `;

  const note = el('p'); note.className='card note'; note.style.marginTop='12px';
  note.textContent = '📌 Todo cambio en la programación de la iglesia se reflejará automáticamente en tu calendario.';

  sec.innerHTML=''; sec.append(h1, card, grid, modal, note);

  /* Lógica de botones (igual que el original, usando config) */
  (function calendarButtons(){
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const WEB_URL = (cfg.calendars?.google?.webUrlPrefix||'https
