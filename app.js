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

/* ───────── Theme/Meta/Loader ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG;

  // Title + theme-color
  if(cfg.meta?.appName) document.title = cfg.meta.appName;
  const mt = document.querySelector('meta[name="theme-color"]');
  if(mt && cfg.meta?.themeColor) mt.setAttribute('content', cfg.meta.themeColor);

  // Fondo + overlay
  if(cfg.layout?.pageBackground?.image) cssv('--bg-img', `url("${cfg.layout.pageBackground.image}")`);
  if(cfg.layout?.pageBackground?.overlay) cssv('--overlay', cfg.layout.pageBackground.overlay);

  // Loader
  const L = cfg.loader||{};
  const loader = $('#loader');
  if(loader){
    loader.innerHTML='';
    if (L.image){
      const img=el('img',{src:L.image,alt:'Pantalla de carga'});
      img.style.objectFit=L.objectFit||'cover';
      img.style.objectPosition=L.objectPosition||'50% 45%';
      loader.appendChild(img);
    }
    const MIN = +L.minVisibleMs||1500, FADE=+L.fadeMs||2000, HARD=(+L.hardFallbackMs||MIN+FADE+1500);
    const start=performance.now();
    const done=()=>{
      document.documentElement.classList.remove('loading');
      loader.classList.add('hide');
      $('#preload-style')?.remove();
      setTimeout(()=>{ try{ loader.remove(); }catch(_){ } }, FADE+100);
    };
    window.addEventListener('load', ()=>{
      const wait=Math.max(0, MIN - (performance.now()-start));
      setTimeout(done, wait);
    }, {once:true});
    setTimeout(done, HARD);
  }
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

/* ───────── ICS (martes/miércoles) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg=window.APP_CONFIG;
  const ICS_URL = cfg.ics?.url; if(!ICS_URL) return;
  const TZ = cfg.ics?.timeZone || 'America/Puerto_Rico';

  const toPR = d => new Date(d.toLocaleString('en-US',{timeZone:TZ}));
  const startOfDay = d => (d=new Date(d), d.setHours(0,0,0,0), d);
  const addDays = (d,n)=> (d=new Date(d), d.setDate(d.getDate()+n), d);
  const sameDayPR = (a,b)=>{a=toPR(a);b=toPR(b);return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()};
  const unfold = txt => txt.replace(/(?:\r\n|\n)[ \t]/g,'');

  (async function load(){
    try{
      const res=await fetch(ICS_URL+'?t='+(Date.now()), {cache:'no-store'}); if(!res.ok) throw new Error('HTTP '+res.status);
      const txt = unfold(await res.text());
      const blocks = txt.split(/BEGIN:VEVENT/).slice(1).map(b=>'BEGIN:VEVENT'+b.split('END:VEVENT')[0]);

      const now=new Date(), pr=toPR(now), sunday=startOfDay(addDays(pr,-pr.getDay()));
      const tue=addDays(sunday,2), wed=addDays(sunday,3);

      function getLineVal(block, prop){ const m = block.match(new RegExp('^'+prop+'(?:;[^:\\n]*)?:(.*)$','mi')); return m?m[1].trim():null; }
      function parseDTSTART(block){
        const m = block.match(/^DTSTART([^:\n]*)?:([^\n]+)$/mi); if(!m) return null;
        const params=(m[1]||'').toUpperCase(); const val=m[2].trim();
        const dOnly=val.match(/^(\d{4})(\d{2})(\d{2})$/);
        if(/VALUE=DATE/.test(params) && dOnly){ const [_,Y,M,D]=dOnly; return new Date(Date.UTC(+Y,+M-1,+D,4,0,0)); }
        const dt=val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
        if(dt){ const [_,Y,M,D,hh,mm,ss,Z]=dt; if(/TZID=AMERICA\/PUERTO_RICO/.test(params)) return new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss)); if(Z) return new Date(Date.UTC(+Y,+M-1,+D,+hh,+mm,+ss)); return new Date(Date.UTC(+Y,+M-1,+D,+hh+4,+mm,+ss)); }
        if(dOnly){ const [_,Y,M,D]=dOnly; return new Date(Date.UTC(+Y,+M-1,+D,4,0,0)); }
        return null;
      }

      let tueEv=null, wedEv=null;
      for(const ev of blocks){
        const dt=parseDTSTART(ev); if(!dt) continue;
        const obj={summary:getLineVal(ev,'SUMMARY'), location:getLineVal(ev,'LOCATION'), url:getLineVal(ev,'URL')};
        if(!tueEv && sameDayPR(dt,tue)) tueEv=obj;
        if(!wedEv && sameDayPR(dt,wed)) wedEv=obj;
        if(tueEv && wedEv) break;
      }

      const cultos = $('#ubicacion-cultos'); if(!cultos) return;
      cultos.innerHTML = `
        <h2>Ubicación de cultos evangelísticos</h2>
        <div class="card">
          <p>Algunos servicios se realizan en ubicaciones distintas:</p>
          <div class="grid cols-2">
            <div>
              <p class="subhead"><span id="lbl-martes">${(cfg.ics?.labels?.martesPrefix||'Martes')} ${tue.getDate()}</span></p>
              <p><strong id="title-martes">Culto evangelístico</strong><br><span id="addr-martes">(dirección)</span></p>
              <iframe height="260" loading="lazy" title="Culto martes"></iframe>
            </div>
            <div>
              <p class="subhead"><span id="lbl-miercoles">${(cfg.ics?.labels?.miercolesPrefix||'Miércoles')} ${wed.getDate()}</span></p>
              <p><strong id="title-miercoles">Culto evangelístico</strong><br><span id="addr-miercoles">(dirección)</span></p>
              <iframe height="260" loading="lazy" title="Culto miércoles"></iframe>
            </div>
          </div>
        </div>`;

      if($('#title-martes') && tueEv?.summary) $('#title-martes').textContent=tueEv.summary;
      if($('#title-miercoles') && wedEv?.summary) $('#title-miercoles').textContent=wedEv.summary;
      if($('#addr-martes') && tueEv?.location) $('#addr-martes').textContent=tueEv.location;
      if($('#addr-miercoles') && wedEv?.location) $('#addr-miercoles').textContent=wedEv.location;

      const tIframe = $('#ubicacion-cultos .grid.cols-2 > div:nth-child(1) iframe');
      const wIframe = $('#ubicacion-cultos .grid.cols-2 > div:nth-child(2) iframe');

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
      setMap(tIframe, tueEv?.location, tueEv?.url||null);
      setMap(wIframe, wedEv?.location, wedEv?.url||null);
    }catch(e){ console.error('No se pudo cargar el ICS:', e); }
  })();
})();

/* ───────── YouTube live ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg=window.APP_CONFIG;
  const sec = $('#redes'); if(!sec) return;
  const h2=el('h2',{textContent:'Redes sociales'});
  const card=el('div'); card.className='card';
  const box=el('div'); box.className='grid cols-1';
  const btn=el('a',{className:'btn btn-yt',href:`https://youtube.com/${(cfg.youtube?.handle||'@pipjm9752')}`,target:'_blank',rel:'noopener',textContent:'▶️ YouTube'});
  const liveWrap=el('div',{id:'live-wrap',className:'live-wrap'});
  liveWrap.innerHTML=`<div class="live-head"><span class="live-dot"></span> EN VIVO AHORA</div>
  <div class="live-player" id="live-player"></div>
  <a id="live-cta" class="live-cta" href="#" target="_blank" rel="noopener">Ver en YouTube</a>`;
  const mail=el('a',{className:'btn btn-d',href:'mailto:pipjm1@gmail.com',textContent:'✉️ pipjm1@gmail.com'});
  box.append(btn, liveWrap, mail); card.appendChild(box); sec.innerHTML=''; sec.append(h2,card);

  const handle = cfg.youtube?.handle || '@pipjm9752';
  const liveUrl = `https://www.youtube.com/${handle.replace(/^@/,'@')}/live`;
  $('#live-cta').href = liveUrl;
  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(liveUrl)}&format=json`;
  fetch(oembed,{mode:'cors'})
    .then(r=>{ if(!r.ok) throw new Error('offline'); return r.json(); })
    .then(()=>{
      $('#live-wrap').style.display='block';
      if(cfg.youtube?.channelId){
        const src=`https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(cfg.youtube.channelId)}&autoplay=1&mute=1&rel=0&modestbranding=1`;
        $('#live-player').innerHTML=`<iframe src="${src}" title="YouTube live" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      }else $('#live-player').innerHTML='';
    })
    .catch(()=>{ const lw=$('#live-wrap'); if(lw) lw.style.display='none'; });
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

/* ───────── PWA install ───────── */
/* ───────── PWA install ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG;
  const btn = $('#'+(cfg.pwa?.install?.buttonId||'btn-install')); 
  if(!btn) return;

  // Ocultar si ya está instalada
  const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) 
    || (window.navigator.standalone===true);
  if(isStandalone){ btn.style.display='none'; return; }

  // Detectamos plataforma
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS     = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Mantén soporte para Android (beforeinstallprompt)
  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    btn.style.display = '';
    btn.disabled = false;
  });

  // Click del botón
  btn.addEventListener('click', async (ev)=>{
    ev.preventDefault();

    if (isIOS) {
      alert(
        "📲 Para instalar la app en tu iPhone/iPad:\n\n" +
        "Paso 1. Tocar los 3 puntos abajo derecha o arriba.\n\n" +
        "(De no tener los 3 puntos [...]presiona boton compartir en la parte inferior cuadro con [flecha hacia arriba])
        "Paso 2. Presionar \"Compartir\".\n\n" +
        "Paso 3. Deslizar hacia abajo y presionar \"Agregar a Inicio\".\n\n" +
        "Paso 4. Presionar arriba derecha \"Agregar\" (botón azul)."
      );
      return;
    }

    if (isAndroid && deferredPrompt){
      try{
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      }catch(_){}
      deferredPrompt = null;
      return;
    }

    if (navigator.share){
      try{
        await navigator.share({
          title: document.title || (cfg.meta?.appName || 'Mi App'),
          text: cfg.pwa?.install?.shareText || 'Instala la app en tu pantalla de inicio',
          url: location.href
        });
      }catch(_){}
      return;
    }

    alert(
      cfg.pwa?.install?.fallbackTutorial ||
      'En tu navegador: abre el menú y elige "Agregar a la pantalla de inicio".'
    );
  });

  window.addEventListener('appinstalled', ()=>{ btn.style.display='none'; });
})();

/* ───────── Firebase + notifs (permiso/token UI) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg=window.APP_CONFIG; if(!cfg.firebase?.app) return;

  if(!window.firebase?.apps?.length) firebase.initializeApp(cfg.firebase.app);
  if(!window.db && firebase.firestore) window.db=firebase.firestore();
  const messaging = firebase.messaging ? firebase.messaging() : null;

  if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register(cfg.firebase.serviceWorkers?.app||'./service-worker.js',{scope:'./'})
        .then(reg=>{ window.appSW=reg })
        .catch(()=>{});

      navigator.serviceWorker.register(cfg.firebase.serviceWorkers?.fcm||'./firebase-messaging-sw.js',{scope:'./'})
        .then(reg=>{
          window.fcmSW=reg;
          // Asegura referencia al SW activo (muy importante para getToken y mensajes)
          navigator.serviceWorker.ready.then(r => { window.fcmSW = r; });
        })
        .catch(()=>{});
    },{once:true});
  }

  let __fcmRegPromise=null;
  function waitForFcmSW(){
    if(__fcmRegPromise) return __fcmRegPromise;
    __fcmRegPromise = new Promise(async (resolve,reject)=>{
      try{
        if(window.fcmSW) return resolve(window.fcmSW);
        if('serviceWorker' in navigator){
          try{
            const reg = await navigator.serviceWorker.register((cfg.firebase.serviceWorkers?.fcm || './firebase-messaging-sw.js'),{scope:'./'});
            window.fcmSW=reg; return resolve(reg);
          }catch(e){}
        }
        const start=Date.now();
        (function poll(){
          if(window.fcmSW) return resolve(window.fcmSW);
          if(Date.now()-start>1500) return reject(new Error('FCM SW no disponible'));
          setTimeout(poll,100);
        })();
      }catch(err){ reject(err); }
    });
    return __fcmRegPromise;
  }

  let __fcmTokenPromise=null;
  async function guardarTokenFCM(token){
    try{
      if(!window.db) return;
      const ua=navigator.userAgent||''; const ts=new Date().toISOString();
      await window.db.collection(cfg.firebase.firestore?.tokensCollection||'fcmTokens').doc(token).set({token,ua,ts},{merge:true});
    }catch(e){ console.error('Error guardando token FCM:',e); }
  }
  async function obtenerToken(){
    if(!messaging) return null;
    if(!('Notification' in window)) return null;
    if(Notification.permission!=='granted') return null;
    if(__fcmTokenPromise) return __fcmTokenPromise;

    __fcmTokenPromise=(async()=>{
      try{
        const fcmReg=await waitForFcmSW();
        const opts={ vapidKey: cfg.firebase.vapidPublicKey, serviceWorkerRegistration: fcmReg };
        const token = await messaging.getToken(opts);
        if(token && cfg.firebase.firestore?.enabled !== false){
          const prev = localStorage.getItem('fcm_token');
          if(token!==prev){ await guardarTokenFCM(token); localStorage.setItem('fcm_token', token); }
        }
        return token || null;
      }catch(e){ console.error('getToken FCM:',e); return null; }
      finally{ __fcmTokenPromise=null; }
    })();
    return __fcmTokenPromise;
  }
  async function hasValidToken(){
    try{
      const prev=localStorage.getItem('fcm_token');
      if(prev && prev.length>10) return prev;
      const t=await obtenerToken();
      return t||null;
    }catch{ return null; }
  }

  const nb = $('#'+(cfg.nav?.notifButton?.id||'btn-notifs'));
  if(!nb) return;

  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (window.navigator.standalone === true);

  nb.style.display = isStandalone ? '' : 'none';
  nb.style.pointerEvents='auto';

  async function setState(){
    const labels = cfg.nav?.notifButton?.labels || {};
    const p = (typeof Notification!=='undefined') ? Notification.permission : 'default';
    if (p==='granted'){
      const tok = await hasValidToken();
      if (tok){ nb.classList.add('ok'); nb.textContent = labels.ok || '✅ NOTIFICACIONES'; }
      else { nb.classList.remove('ok'); nb.textContent = labels.noToken || '⚠️ ACTIVAR NOTIFICACIONES'; }
    } else if (p==='denied'){
      nb.classList.remove('ok'); nb.textContent = labels.denied || '🚫 NOTIFICACIONES';
    } else {
      nb.classList.remove('ok'); nb.textContent = labels.default || 'NOTIFICACIONES';
    }
  }
  setState();

  nb.addEventListener('click', async (e)=>{
    e.preventDefault();
    if (typeof Notification==='undefined'){ alert('Este dispositivo no soporta notificaciones.'); return; }
    nb.classList.add('loading'); nb.textContent='⏳ NOTIFICACIONES';
    try{
      const perm = (Notification.permission==='granted')?'granted':await Notification.requestPermission();
      if(perm==='granted') await obtenerToken();
      await setState();
    } finally { nb.classList.remove('loading'); }
  });

  if(messaging){
    // 📥 Primer plano: guarda TODAS las notificaciones en la bandeja
    messaging.onMessage((payload)=>{
      try{
        const d = payload?.data || {};
        // comunicamos al módulo de bandeja mediante evento global
        window.dispatchEvent(new CustomEvent('app:notifIncoming',{ detail:{
          title: d.title || payload?.notification?.title || 'Notificación',
          body:  d.body  || payload?.notification?.body  || '',
          date:  d.date  || '',
          image: d.image || '',
          link:  d.link  || ''
        }}));
      }catch(e){ console.error('onMessage error',e); }
    });
  }

  if (window.matchMedia) {
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener?.('change', () => {
      const st = mq.matches || (window.navigator.standalone === true);
      nb.style.display = st ? '' : 'none';
    });
  }
})();

/* ───────── Logo giratorio ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg=window.APP_CONFIG;
  const logo=$('#floating-logo'); if(!logo) return;

  // Asegura SRC desde config y oculta si falla para que no se vea el ALT
  const src = cfg.floatingLogo?.src || cfg.assets?.logoRotating || '';
  if(src){
    logo.src = src;
    logo.onerror = ()=>{ logo.style.display='none'; };
  }else{
    logo.style.display='none';
  }
  const p=cfg.floatingLogo?.position||{};
  if(p.bottom) logo.style.bottom=p.bottom;
  if(p.left)   logo.style.left=p.left;
  if(p.width)  logo.style.width=p.width;
  if(cfg.floatingLogo?.spin?.speed) logo.style.animationDuration=cfg.floatingLogo.spin.speed;
})();

/* ───────── Hoja de Notificación (overlay) ───────── */
(function(){
  if(!window.__CFG_ALLOWED) return;
  const cfg = window.APP_CONFIG || {};

  function parseHashNotif(){
    if (!location.hash.startsWith('#/notif')) return null;
    const idx = location.hash.indexOf('?');
    const q = new URLSearchParams(idx >= 0 ? location.hash.slice(idx+1) : '');
    const raw = {
      title: q.get('title') || 'Notificación',
      body:  q.get('body')  || '',
      date:  q.get('date')  || '',
      image: q.get('image') || '',
      link:  q.get('link')  || ''
    };
    return normalizePayload(raw);
  }

  function toEmbedDate(s){
    if (!s) return null;
    const a = s.trim();
    let m = a.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[1]}${m[2]}${m[3]}`;
    m = a.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return `${m[3]}${m[2]}${m[1]}`;
    return null;
  }
  function normalizePayload(p){
    const dYmd = toEmbedDate(p.date);
    return {
      title: String(p.title||'Notificación').slice(0,140),
      body:  String(p.body||''),
      image: p.image || '',
      link:  p.link || '',
      ymd:   dYmd
    };
  }

  function ensureOverlay(){
    let ov = document.getElementById('notif-overlay');
    if (ov) return ov;
    ov = document.createElement('div');
    ov.id = 'notif-overlay';
    ov.style.cssText = `
      position: fixed; inset: 0; z-index: 100000;
      background: rgba(0,0,0,.65);
      display: none; align-items: center; justify-content: center;
      padding: 20px;
    `;
    const card = document.createElement('div');
    card.id = 'notif-card';
    card.style.cssText = `
      max-width: 880px; width: 96vw; max-height: 90vh; overflow: auto;
      background: #fff; border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,.3);
      padding: 16px;
    `;
    ov.appendChild(card);
    document.body.appendChild(ov);
    return ov;
  }

  function renderNotifView(payload){
    const ov = ensureOverlay();
    const card = document.getElementById('notif-card');
    const closeBtn = `
      <button id="notif-close" style="
        display:block;width:100%;margin:12px 0 0;padding:12px;
        background:#dc2626;color:#fff;border:0;border-radius:10px;
        font-weight:800
      ">Cerrar</button>`;

    const img = payload.image
      ? `<img src="${payload.image}" alt="" style="width:100%;border-radius:10px;margin:8px 0 12px 0;box-shadow:0 4px 12px rgba(0,0,0,.18)" loading="lazy">`
      : '';

    const link = payload.link
      ? `<p style="margin:10px 0 0"><a href="${payload.link}" target="_blank" rel="noopener" style="font-weight:700;color:#2563eb;text-decoration:none">Abrir enlace</a></p>`
      : '';

    let calendar = '';
    if (payload.ymd && cfg.calendars?.google?.calendarId){
      const calId = encodeURIComponent(cfg.calendars.google.calendarId);
      const tz    = encodeURIComponent((cfg.ics?.timeZone || 'America/Puerto_Rico'));
      const src = `https://calendar.google.com/calendar/embed?src=${calId}&ctz=${tz}&mode=AGENDA&showNav=0&showDate=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0&wkst=1&bgcolor=%23ffffff&dates=${payload.ymd}/${payload.ymd}`;
      calendar = `
        <div style="margin-top:14px">
          <iframe src="${src}" title="Agenda del día" style="width:100%;height:420px;border:0;border-radius:10px" loading="lazy"></iframe>
        </div>`;
    }

    card.innerHTML = `
      <h3 style="margin:4px 2px 8px;font:800 18px/1.25 system-ui,-apple-system,Segoe UI,Roboto,Arial">${payload.title}</h3>
      <div style="font:400 15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial;white-space:pre-wrap">${payload.body}</div>
      ${img}
      ${link}
      ${calendar}
      ${closeBtn}
    `;

    ov.style.display = 'flex';
    $('#notif-close', ov)?.addEventListener('click', ()=>{
      ov.style.display = 'none';
      history.replaceState(null, '', location.pathname + location.search);
    }, { once:true });
  }

  function maybeShowFromHash(){
    const p = parseHashNotif();
    if (!p) return;
    renderNotifView(p);
  }

  window.addEventListener('hashchange', maybeShowFromHash);
  window.addEventListener('load',       maybeShowFromHash, { once:true });
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
    // evita duplicados exactos recientes (5 min)
    const five = Date.now()-5*60*1000;
    const dup = list.find(x => x.ts>five && x.title===item.title && x.body===item.body);
    if (!dup) list.unshift(item);
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
    navigator.serviceWorker.addEventListener('message', (ev)=>{
      const d = ev.data || {};
      if (d.type === 'notif:new' && d.payload) {
        add(d.payload);
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
})();// ← importante punto y coma final