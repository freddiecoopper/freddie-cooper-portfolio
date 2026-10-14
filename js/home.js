/* Home page behaviour: hero images, divider slider and site modes, About, skills, process, ripple grid.
   Content comes from the dashboard's Home page tab (/api/site), or js/content.js until that is saved. */
const CONFIG = {
  "gridSize": 11,
  "gridArea": 160,
  "gridStrength": 0.6,
  "gridLineWidth": 0.6,
  "gridWaveHeight": 0.15,
  "gridWaveSpeed": 150,
  "gridWaveWidth": 19,
  "gridWaveLength": 60,
  "gridFadeTime": 4,
  "gridFluidity": 0.07,
  "gridCrest": 0,
  "gridTextFade": 1,
  "gridTextRange": 10,
  "gridColor": "#7b7b7b",
  "gridCrestColor": "#df4d1c",
  "darkGridColor": "#ffffff"
};
const $ = (id) => document.getElementById(id);
const state = { ripples: true };
let HERO = SITE.hero;

/* ---- Hero: each side steps through its folder. Left changes at 10s, 30s, 50s...; right at 20s, 40s...
        so every side changes every 20 seconds, one after the other. Waiting images sit fully behind the divider. */
function buildStack(el, list) {
  el.textContent = '';
  list.forEach(function (im) {
    var w = document.createElement('div'); w.className = 'hiw';
    var i = document.createElement('img'); i.className = 'hi'; i.src = im.src; i.alt = im.alt || '';
    i.style.left = (im.x || 0) + '%'; i.style.top = (im.y || 0) + '%'; i.style.width = (im.w == null ? 100 : im.w) + '%';
    w.appendChild(i); el.appendChild(w);
  });
}
function showStack(el, list, active, left) {
  Array.prototype.forEach.call(el.children, function (w, n) {
    var im = list[n], x = im.x || 0, ww = im.w == null ? 100 : im.w, T = left ? 102 - x : x + ww + 2;
    w.style.transform = n === active ? 'none' : 'translateX(' + (left ? '' : '-') + T + '%)';
  });
}
var heroStep = 0;
function heroRender() {
  var nL = HERO.viz.length, nR = HERO.id.length;
  var li = nL ? Math.floor((heroStep + 1) / 2) % nL : 0, ri = nR ? Math.floor(heroStep / 2) % nR : 0;
  showStack($('stackL'), HERO.viz, li, true); showStack($('stackR'), HERO.id, ri, false);
  $('capL').textContent = (HERO.viz[li] && HERO.viz[li].caption) || 'Photoreal visualization, animation and physics simulation';
  $('capR').textContent = (HERO.id[ri] && HERO.id[ri].caption) || 'Mechanical modeling and engineering-led product design';
}

/* ---- The editable parts of the page: hero, About, skills, How I work, Book a call ---- */
function cellList(box, items) { box.textContent = ''; (items || []).forEach(function (t) { var c = document.createElement('div'); c.className = 'cell'; c.textContent = t; box.appendChild(c); }); }
function applyHome(h) {
  HERO = { viz: (h.hero && h.hero.viz) || [], id: (h.hero && h.hero.id) || [] };
  buildStack($('stackL'), HERO.viz); buildStack($('stackR'), HERO.id); heroRender();
  $('about').textContent = h.about || '';
  if (h.portrait && h.portrait.src) { $('portrait').src = h.portrait.src; $('portrait').alt = h.portrait.alt || 'Portrait of Freddie Cooper'; }
  cellList($('skL'), h.skills && h.skills.viz); cellList($('skR'), h.skills && h.skills.id);
  var st = $('steps'), steps = h.process || []; st.textContent = ''; st.style.gridTemplateColumns = 'repeat(' + Math.max(1, Math.min(steps.length, 4)) + ',1fr)';
  steps.forEach(function (p, i) {
    var d = document.createElement('div'); d.className = 'step'; var b = document.createElement('b'); b.textContent = (i < 9 ? '0' : '') + (i + 1);
    var l = document.createElement('div'); l.className = 'lbl'; l.style.marginBottom = '12px'; l.textContent = p.title || '';
    var t = document.createElement('p'); t.className = 'body'; t.style.fontSize = '15px'; t.textContent = p.text || '';
    d.appendChild(b); d.appendChild(l); d.appendChild(t); st.appendChild(d);
  });
  if (h.calendly) $('callBtn').href = h.calendly;
}
var homeShown = '';
function showHome(h) { var k = JSON.stringify(h); if (k === homeShown) return; homeShown = k; applyHome(h); }
showHome(siteHome(null));
loadHome().then(showHome);
if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) setInterval(function () { heroStep++; heroRender(); }, 10000);

/* ---- Divider slider. Right end: product visualization only. Left end: industrial design only. ---- */
const el = { slider: $('slider'), clipL: $('clipL'), clipR: $('clipR'), handle: $('handle'), vline: $('vline'), hcl: $('hcl'), hcr: $('hcr'), count: $('count'), g5: $('g5'), dg: $('dg'), dgl: $('dgl'), dgr: $('dgr') };
function setPos(pos) {
  var idMode = pos <= 1, vizMode = pos >= 99, split = !idMode && !vizMode;
  try { sessionStorage.setItem('fc-mode', idMode ? 'id' : (vizMode ? 'viz' : 'split')); } catch (e) {}
  el.clipL.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)'; el.clipR.style.clipPath = 'inset(0 0 0 ' + pos + '%)'; el.handle.style.left = pos + '%';
  el.vline.style.opacity = split ? 1 : 0;
  el.hcl.style.display = idMode ? 'none' : 'block'; el.hcl.style.width = split ? '50%' : '100%';
  el.hcr.style.display = vizMode ? 'none' : 'block'; el.hcr.style.width = split ? '50%' : '100%';
  var shown = FEATURED.filter(function (p) { return split || p.kind === (vizMode ? 'viz' : 'id'); }).length;
  el.count.textContent = (shown < 10 ? '0' : '') + shown + (shown === 1 ? ' project' : ' projects');
  el.g5.style.justifyContent = split ? 'flex-start' : 'center';
  document.querySelectorAll('[data-zone="id"]').forEach(function (n) { n.style.display = vizMode ? 'none' : 'block'; });
  document.querySelectorAll('[data-zone="viz"]').forEach(function (n) { n.style.display = idMode ? 'none' : 'block'; });
  el.dg.style.gridTemplateColumns = split ? '1fr 1fr' : '1fr';
  el.dgl.style.display = idMode ? 'none' : 'block'; el.dgl.style.paddingRight = split ? '40px' : '0';
  el.dgr.style.display = vizMode ? 'none' : 'block'; el.dgr.style.paddingLeft = split ? '40px' : '0';
}
el.slider.addEventListener('input', function (e) { setPos(Number(e.target.value)); });

/* ---- Featured work: projects marked featured in the dashboard (or js/content.js), up to five, in project order ---- */
var FEATURED = [];
function renderFeatured(list) {
  FEATURED = list.filter(function (p) { return p.featured && p.feature; }).slice(0, 5);
  var g = el.g5; g.textContent = '';
  FEATURED.forEach(function (p, i) {
    var href = projectHref(p) || 'projects.html', a = document.createElement('a'); a.className = 'wp'; a.href = href; a.setAttribute('data-zone', p.kind);
    var ph = document.createElement('span'); ph.className = 'ph' + (p.featureFade === false ? '' : ' fd');
    var im = document.createElement('img'); im.src = p.feature; im.alt = p.alt || (p.name + ' render'); ph.appendChild(im); colourLayer(ph, p.featureColor);
    var l = document.createElement('span'); l.className = 'lbl wl'; l.textContent = (i < 9 ? '0' : '') + (i + 1) + ' ' + p.name;
    a.appendChild(ph); a.appendChild(l); g.appendChild(a);
  });
  setPos(Number(el.slider.value));
}
renderFeatured(SITE.projects.filter(function (p) { return p.visible !== false; }));
loadProjects().then(function (items) { renderFeatured(items); });

/* ---- Contact: Send an email opens a small composer, Book a call goes to Calendly ---- */
$('mailBtn').addEventListener('click', function () { var o = $('cmp').hidden; $('cmp').hidden = !o; $('mailBtn').setAttribute('aria-expanded', o); $('mMsg').textContent = ''; });
$('mCancel').addEventListener('click', function () { $('cmp').hidden = true; $('mailBtn').setAttribute('aria-expanded', false); });
function mailReady() { $('mSend').disabled = !($('mSubject').value.trim() && $('mBody').value.trim()); }
$('mSubject').addEventListener('input', mailReady); $('mBody').addEventListener('input', mailReady);
$('mSend').addEventListener('click', function () {
  var su = $('mSubject').value.trim(), bo = $('mBody').value.trim(); if (!su || !bo) return;
  $('mMsg').textContent = 'Your email app should open with your message ready to send. If nothing opens, copy your message and use the email link in the footer.';
  window.location.href = 'mailto:' + SITE.contact.to + '?subject=' + encodeURIComponent(su) + '&body=' + encodeURIComponent(bo);
});

/* ---- Cursor ripple grid ---- */
function initRipples(el) {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rp = { el: el, ctx: el.getContext('2d'), ripples: [], target: null, sm: null, lastEmit: null, lastMove: -1e9, prev: 0, raf: 0, w: 0, h: 0, dpr: 1, ink: '#000', acc: '#e8590c', inkAt: -1e9, rects: [], rectAt: -1e9, n: 0, cols: 0, rows: 0, S: 0 };
  if (reduce) return;
  const resize = () => {
    const r = el.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2);
    rp.w = r.width; rp.h = r.height; rp.dpr = dpr;
    el.width = Math.round(r.width * dpr); el.height = Math.round(r.height * dpr);
  };
  resize(); rp.onResize = resize; window.addEventListener('resize', resize);
  rp.onMove = (e) => {
    if (state.ripples === false) return;
    const r = el.getBoundingClientRect(); if (!r.width) return;
    rp.target = { x: (e.clientX - r.left) * (rp.w / r.width), y: (e.clientY - r.top) * (rp.h / r.height) };
    rp.lastMove = performance.now();
    if (!rp.sm) { rp.sm = { x: rp.target.x, y: rp.target.y }; rp.lastEmit = { x: rp.sm.x, y: rp.sm.y }; }
  };
  window.addEventListener('pointermove', rp.onMove, { passive: true });
  const P = (k, d) => { const v = CONFIG[k]; return (v == null || isNaN(Number(v))) ? d : Number(v); };
  const SEL = 'h1:not(.hh),h2,p,.lbl,.hl,.sbtn,.sbtn2,.cell,.rtog,.btn,.hcap,.shint,.lnk,.cmp,.cin';
  const frame = (now) => {
    rp.raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, rp.prev ? (now - rp.prev) / 1000 : 0.016); rp.prev = now;
    const S = Math.max(4, P('gridSize', 11)), area = P('gridArea', 90), strength = P('gridStrength', 0.6);
    const amp = P('gridWaveHeight', 0.6) * S * 0.8, speed = P('gridWaveSpeed', 150), sigma = Math.max(4, P('gridWaveWidth', 22));
    const tau = Math.max(0.2, P('gridFadeTime', 1.4)), flu = Math.min(0.97, Math.max(0, P('gridFluidity', 0.8)));
    const lw = P('gridLineWidth', 0.7), crest = P('gridCrest', 0.5), tf = P('gridTextFade', 0.85), tr = Math.max(4, P('gridTextRange', 40));
    const k = (2 * Math.PI) / Math.max(4, P('gridWaveLength', 16));
    const ctx = rp.ctx, w = rp.w, h = rp.h;
    ctx.setTransform(rp.dpr, 0, 0, rp.dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    if (state.ripples === false) { rp.ripples.length = 0; return; }
    const R = rp.ripples;
    if (rp.sm && rp.target) {
      const a = 1 - Math.pow(flu, dt * 60);
      rp.sm.x += (rp.target.x - rp.sm.x) * a; rp.sm.y += (rp.target.y - rp.sm.y) * a;
      const spacing = Math.max(3, S * 0.55);
      let dx = rp.sm.x - rp.lastEmit.x, dy = rp.sm.y - rp.lastEmit.y, dist = Math.hypot(dx, dy), n = 0;
      const power = 0.35 + 0.65 * Math.min(1, (dist / Math.max(dt, 0.001)) / 700);
      while (dist >= spacing && n < 8) {
        const f = spacing / dist; rp.lastEmit.x += dx * f; rp.lastEmit.y += dy * f;
        R.push({ x: rp.lastEmit.x, y: rp.lastEmit.y, t: now, a: power });
        dx = rp.sm.x - rp.lastEmit.x; dy = rp.sm.y - rp.lastEmit.y; dist = Math.hypot(dx, dy); n++;
      }
      if (n === 8) { rp.lastEmit.x = rp.sm.x; rp.lastEmit.y = rp.sm.y; }
      while (R.length > 90) R.shift();
    }
    while (R.length && now - R[0].t > tau * 3000) R.shift();
    const halo = rp.target ? Math.exp(-(now - rp.lastMove) / 1100) : 0;
    if (!R.length && halo < 0.03) return;
    if (now - rp.inkAt > 600) {
      const cs = getComputedStyle(el); rp.ink = cs.color || rp.ink;
      const o = cs.getPropertyValue('--o').trim(); if (o) rp.acc = o; rp.inkAt = now;
    }
    if (tf > 0 && now - rp.rectAt > 120) {
      rp.rectAt = now; const root = el.parentElement, r0 = el.getBoundingClientRect(), sx = r0.width ? w / r0.width : 1, sy = r0.height ? h / r0.height : 1, out = [];
      if (root) root.querySelectorAll(SEL).forEach((n) => {
        const b = n.getBoundingClientRect(); if (b.width < 3 || b.height < 3) return;
        const l = (b.left - r0.left) * sx, t = (b.top - r0.top) * sy, rr = (b.right - r0.left) * sx, bb = (b.bottom - r0.top) * sy;
        if (rr < -tr || bb < -tr || l > w + tr || t > h + tr) return; out.push([l, t, rr, bb]);
      });
      rp.rects = out;
    }
    const cols = Math.ceil(w / S) + 2, rows = Math.ceil(h / S) + 2, n = cols * rows;
    if (rp.n !== n || rp.S !== S) { rp.n = n; rp.S = S; rp.cols = cols; rp.rows = rows; rp.px = new Float32Array(n); rp.py = new Float32Array(n); rp.pa = new Float32Array(n); rp.mk = new Uint8Array(n); rp.bx = new Float32Array(n); rp.by = new Float32Array(n); for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { rp.bx[j * cols + i] = i * S - S / 2; rp.by[j * cols + i] = j * S - S / 2; } }
    const px = rp.px, py = rp.py, pa = rp.pa, mk = rp.mk, bx = rp.bx, by = rp.by;
    px.set(bx); py.set(by); pa.fill(0); mk.fill(0);
    const act = []; const touch = (idx, v) => { if (!mk[idx]) { mk[idx] = 1; act.push(idx); } pa[idx] += v; };
    const reach = area * 2.2, fall = 2 * (area * 0.8) * (area * 0.8);
    for (let q = 0; q < R.length; q++) {
      const r = R[q], age = (now - r.t) / 1000, front = age * speed, decay = Math.exp(-age / tau) * r.a;
      if (decay < 0.02 || front - 3 * sigma > reach) continue;
      const Rr = Math.min(front + 3 * sigma, reach);
      const i0 = Math.max(0, Math.floor((r.x - Rr + S / 2) / S)), i1 = Math.min(cols - 1, Math.ceil((r.x + Rr + S / 2) / S));
      const j0 = Math.max(0, Math.floor((r.y - Rr + S / 2) / S)), j1 = Math.min(rows - 1, Math.ceil((r.y + Rr + S / 2) / S));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const idx = j * cols + i, dx = bx[idx] - r.x, dy = by[idx] - r.y, d2 = dx * dx + dy * dy;
        if (d2 > Rr * Rr) continue;
        const d = Math.sqrt(d2) + 0.001, delta = d - front; if (delta > 3 * sigma || delta < -3 * sigma) continue;
        const env = Math.exp(-(delta * delta) / (2 * sigma * sigma)) * decay * Math.exp(-d2 / fall);
        if (env < 0.004) continue;
        const disp = Math.sin(delta * k) * env * amp;
        px[idx] += (dx / d) * disp; py[idx] += (dy / d) * disp; touch(idx, env);
      }
    }
    if (rp.sm && halo > 0.03) {
      const c = rp.sm, Rr = area * 1.6;
      const i0 = Math.max(0, Math.floor((c.x - Rr + S / 2) / S)), i1 = Math.min(cols - 1, Math.ceil((c.x + Rr + S / 2) / S));
      const j0 = Math.max(0, Math.floor((c.y - Rr + S / 2) / S)), j1 = Math.min(rows - 1, Math.ceil((c.y + Rr + S / 2) / S));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const idx = j * cols + i, dx = bx[idx] - c.x, dy = by[idx] - c.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2) + 0.001;
        const hv = halo * Math.exp(-d2 / (2 * area * 0.5 * area * 0.5)); if (hv < 0.02) continue;
        px[idx] += (dx / d) * hv * amp * 0.6; py[idx] += (dy / d) * hv * amp * 0.6; touch(idx, hv * 0.9);
      }
    }
    if (tf > 0 && rp.rects.length) {
      const RC = rp.rects;
      for (let m = 0; m < act.length; m++) {
        const idx = act[m], x = bx[idx], y = by[idx]; let best = 1e9;
        for (let q = 0; q < RC.length; q++) {
          const b = RC[q], ddx = x < b[0] ? b[0] - x : (x > b[2] ? x - b[2] : 0), ddy = y < b[1] ? b[1] - y : (y > b[3] ? y - b[3] : 0);
          const dd = Math.sqrt(ddx * ddx + ddy * ddy); if (dd < best) { best = dd; if (dd === 0) break; }
        }
        const t = Math.min(1, best / tr), sm = t * t * (3 - 2 * t);
        pa[idx] *= 1 - tf * (1 - sm);
      }
    }
    const B = 6, buckets = []; for (let b = 0; b < B; b++) buckets.push([]);
    const seg = (a, b) => { const al = (Math.min(1, pa[a]) + Math.min(1, pa[b])) / 2; if (al < 0.03) return; buckets[Math.min(B - 1, Math.floor(al * B))].push(px[a], py[a], px[b], py[b]); };
    for (let m = 0; m < act.length; m++) {
      const a = act[m], i = a % cols, j = (a - i) / cols;
      if (i + 1 < cols) seg(a, a + 1); if (j + 1 < rows) seg(a, a + cols);
      if (i > 0 && !mk[a - 1]) seg(a, a - 1); if (j > 0 && !mk[a - cols]) seg(a, a - cols);
    }
    const inkCol = ((document.querySelector('.p').classList.contains('dark') ? CONFIG.darkGridColor : CONFIG.gridColor) || rp.ink), crestCol = CONFIG.gridCrestColor || rp.acc;
    ctx.lineWidth = lw; ctx.lineCap = 'round';
    for (let b = 0; b < B; b++) {
      const q = buckets[b]; if (!q.length) continue;
      const top = b === B - 1 && crest > 0;
      ctx.beginPath(); for (let t = 0; t < q.length; t += 4) { ctx.moveTo(q[t], q[t + 1]); ctx.lineTo(q[t + 2], q[t + 3]); }
      ctx.strokeStyle = top ? crestCol : inkCol; ctx.globalAlpha = Math.min(1, (b + 0.6) / B * strength * 0.9 * (top ? Math.max(0.3, crest) : 1)); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  rp.raf = requestAnimationFrame(frame);
}
$('rtog').addEventListener('click', function () { state.ripples = !state.ripples; $('rlabel').textContent = state.ripples ? 'on' : 'off'; });
initRipples($('ripples'));
