/* Live content on the public pages: projects and case studies, the Now working on feed and the wallpaper strip.
   They read /api/projects, /api/updates and /api/wallpapers (edited in the dashboard) and fall back to js/content.js. */
function getJSON(url) { return fetch(url, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
function loadProjects() { return getJSON('/api/projects').then(function (j) { return (j && j.items && j.items.length ? j.items : SITE.projects).filter(function (p) { return p.visible !== false; }); }); }
/* Where a project opens: its case study, else its own link, else nowhere. */
function projectHref(p) { return p.caseStudy && p.caseStudy.on !== false ? 'case-study.html?p=' + encodeURIComponent(p.id) : (p.link || ''); }
/* Thumbnails show the grey image and fade to the colour version on hover. A missing colour file is dropped, so it stays grey. */
function colourLayer(box, src) {
  if (!src) return; var c = document.createElement('img'); c.className = 'clr'; c.alt = ''; c.setAttribute('aria-hidden', 'true');
  c.addEventListener('error', function () { c.remove(); }); c.src = src; box.appendChild(c);
}
/* Home page content: the copy saved in the dashboard, laid over the built in one from js/content.js. */
function siteHome(saved) {
  var b = { hero: SITE.hero, about: SITE.about, portrait: SITE.portrait, skills: SITE.skills, process: SITE.process, calendly: SITE.contact && SITE.contact.calendly };
  return saved ? Object.assign(b, saved) : b;
}
/* js/theme.js has already asked /api/site (for the page colours) as window.fcSite, so reuse that answer. */
function loadHome() { return (window.fcSite || getJSON('/api/site')).then(function (j) { return siteHome(j && j.home); }); }
function loadUpdates() { return getJSON('/api/updates').then(function (j) { return j && j.items && j.items.length ? j.items : SITE.updates; }); }
function loadWallpapers() { return getJSON('/api/wallpapers').then(function (j) { return j && j.items && j.items.length ? j.items : SITE.wallpapers; }); }
function money(p, c) { return p > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: c || 'USD', minimumFractionDigits: p % 1 ? 2 : 0 }).format(p) : 'Free'; }
function fmtDate(d) { try { return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return d; } }
function mk(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
/* Work in progress snippets: a small image or looping clip beside an update. Click to see it large. */
var STILL = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function mediaEl(u, big) {
  var v = u.mediaType === 'video', m = document.createElement(v ? 'video' : 'img'); m.src = u.media;
  if (v) { m.muted = true; m.loop = true; m.playsInline = true; m.setAttribute('playsinline', ''); m.preload = 'metadata'; if (big) m.controls = true; if (big || !STILL) m.autoplay = true; if (u.mediaAlt) m.setAttribute('aria-label', u.mediaAlt); }
  else { m.alt = u.mediaAlt || ''; m.loading = 'lazy'; m.decoding = 'async'; }
  return m;
}
function snippet(u) {
  var b = mk('button', 'upmedia'); b.type = 'button'; b.setAttribute('aria-label', 'Enlarge: ' + (u.mediaAlt || u.title)); b.appendChild(mediaEl(u, false));
  b.addEventListener('click', function () { openViewer(u); }); return b;
}
function openViewer(u) {
  var dlg = document.getElementById('upviewer');
  if (!dlg) {
    dlg = document.createElement('dialog'); dlg.id = 'upviewer'; dlg.className = 'upviewer';
    var x = mk('button', 'upclose', 'Close'); x.type = 'button'; x.addEventListener('click', function () { dlg.close(); });
    dlg.appendChild(x); dlg.appendChild(mk('div', 'upstage')); dlg.appendChild(mk('p', 'upcap'));
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { dlg.querySelector('.upstage').textContent = ''; });
    (document.querySelector('.p') || document.body).appendChild(dlg);
  }
  var st = dlg.querySelector('.upstage'); st.textContent = ''; st.appendChild(mediaEl(u, true));
  dlg.querySelector('.upcap').textContent = u.title + (u.mediaAlt ? '. ' + u.mediaAlt : '');
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
}
function renderUpdates() {
  var box = document.getElementById('nowList'); if (!box) return;
  loadUpdates().then(function (items) {
    items = items.filter(function (u) { return u.visible !== false; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 3);
    box.textContent = '';
    items.forEach(function (u) {
      var row = mk('div', 'uprow'); row.appendChild(mk('span', 'lbl', fmtDate(u.date))); row.appendChild(mk('span', 'upst' + (u.status === 'In progress' ? ' go' : ''), u.status));
      var d = mk('div'); d.appendChild(mk('h3', 'upt', u.title)); d.appendChild(mk('p', 'upn', u.note || '')); row.appendChild(d);
      if (u.media) { row.classList.add('has-media'); row.appendChild(snippet(u)); }
      box.appendChild(row);
    });
  });
}
function renderStrip() {
  var box = document.getElementById('wpStrip'); if (!box) return;
  loadWallpapers().then(function (items) {
    box.textContent = '';
    items.filter(function (w) { return w.visible !== false; }).slice(0, 4).forEach(function (w) {
      var a = mk('a', 'wcard'); a.href = 'wallpapers.html';
      var m = mk('div', 'mosaic'); (w.images || []).slice(0, 4).forEach(function (im) { var i = document.createElement('img'); i.src = im.preview; i.alt = ''; m.appendChild(i); });
      var meta = mk('div', 'wmeta'); meta.appendChild(mk('span', 'lbl', 'Pack of ' + (w.images || []).length)); meta.appendChild(mk('span', 'wprice', money(w.price, w.currency)));
      a.appendChild(m); a.appendChild(meta); a.appendChild(mk('h3', 'wnm', w.name)); box.appendChild(a);
    });
  });
}
if (document.getElementById('nowList')) { renderUpdates(); setInterval(renderUpdates, 60000); }
renderStrip();
