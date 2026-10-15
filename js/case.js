/* Case study page: Story and Presentation views, built from the project's case study.
   The address picks the project: case-study.html?p=arcs. Without one it shows the first project that has a case study.
   Case studies are edited in the dashboard (Projects tab), or in js/content.js until projects are saved there. */
var CASE = {
  "presWidth": 65,
  "presHeight": 80,
  "presPad": 0,
  "presGap": 0,
  "presCaptions": false,
  "storyW": 75
};   /* the old design tweaks: image width %, max height vh, padding px, gap px, captions, story image width % */
var $ = function (id) { return document.getElementById(id); };
var KIND = { viz: 'Product visualization', id: 'Industrial design' };
function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
function img(src, alt, cls) { var i = document.createElement('img'); i.className = cls || 'fig'; i.src = src; i.alt = alt || ''; return i; }
/* Paragraphs: a blank line in the text starts a new paragraph. */
function paras(text) { var d = h('div'); String(text || '').split(/\n\s*\n/).forEach(function (t, n) { if (!t.trim()) return; var p = h('p', 'body', t.trim()); if (n) p.style.marginTop = '20px'; d.appendChild(p); }); return d; }

function build(p) {
  var c = p.caseStudy, kind = KIND[p.kind] || '';
  document.title = p.name + ' | Freddie Cooper';
  var st = $('story'); st.textContent = '';
  var head = h('div', 'in rv'); head.style.paddingTop = 'clamp(48px,9vw,110px)'; head.style.paddingBottom = 'clamp(32px,5vw,56px)';
  head.appendChild(h('span', 'lbl', kind)); var t = h('h1', 'd', p.name); t.style.fontSize = 'clamp(56px,10vw,150px)'; t.style.marginTop = '20px'; head.appendChild(t);
  if (c.intro) { var ip = h('p', 'body', c.intro); ip.style.marginTop = '28px'; ip.style.maxWidth = '560px'; head.appendChild(ip); }
  st.appendChild(head);

  var meta = [['Discipline', kind], ['Role', c.role], ['Tools', c.tools], ['Year', c.year]].filter(function (m) { return m[1]; });
  if (meta.length) { var mw = h('div', 'in rv'), m4 = h('div', 'meta4'); meta.forEach(function (m) { var d = h('div'); d.appendChild(h('span', 'lbl', m[0])); d.appendChild(h('p', '', m[1])); m4.appendChild(d); }); mw.appendChild(m4); st.appendChild(mw); }

  if (c.cover) { var cw = h('div', 'in rv'), stage = h('div', 'stage'), ci = img(c.cover, c.coverAlt || p.alt); ci.style.width = CASE.storyW + '%'; stage.appendChild(ci); cw.appendChild(stage); st.appendChild(cw); }

  var rows = h('div', 'in');
  (c.sections || []).forEach(function (s) {
    var r = h('div', 'row rv'); r.appendChild(h('span', 'lbl', s.label || ''));
    var body = paras(s.text); if (s.image) { var si = img(s.image, s.alt); si.style.maxWidth = '760px'; if (s.text) si.style.marginTop = '40px'; body.appendChild(si); }
    r.appendChild(body); rows.appendChild(r);
  });
  var tools = String(c.tools || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  if (tools.length) { var tr = h('div', 'row rv'), tg = h('div', 'tags'); tr.appendChild(h('span', 'lbl', 'Tools')); tools.forEach(function (x) { var s = h('span', 'lbl', x); s.style.color = 'var(--t)'; tg.appendChild(s); }); tr.appendChild(tg); rows.appendChild(tr); }
  st.appendChild(rows);

  $('presTitle').textContent = p.name; $('presKind').textContent = kind;
  var col = $('mcol'); col.textContent = ''; col.style.gap = CASE.presGap + 'px';
  (c.slides || []).forEach(function (s) {
    var f = document.createElement('figure'); f.className = 'mc'; f.style.padding = CASE.presPad + 'px'; f.style.background = s.bg || 'transparent';
    var m = document.createElement(s.type === 'video' ? 'video' : 'img');
    m.src = s.src; if (s.type === 'video') { m.controls = true; m.setAttribute('playsinline', ''); m.preload = 'metadata'; if (s.poster) m.poster = s.poster; if (s.alt) m.setAttribute('aria-label', s.alt); } else m.alt = s.alt || '';
    m.style.width = CASE.presWidth + '%'; m.style.maxHeight = CASE.presHeight + 'vh'; f.appendChild(m);
    if (CASE.presCaptions && s.caption) f.appendChild(h('figcaption', 'pcap', s.caption));
    col.appendChild(f);
  });
  if (!(c.slides || []).length) col.appendChild(h('p', 'body', 'No presentation images yet.'));
}
function missing() {
  var st = $('story'); st.textContent = ''; var w = h('div', 'in'); w.style.padding = 'clamp(48px,9vw,110px) 0';
  var t = h('h1', 'd', 'Case study not found.'); t.style.fontSize = 'clamp(40px,6vw,88px)'; w.appendChild(t);
  var p = h('p', 'body', 'It may have moved or been taken down. '); var a = h('a', 'back', 'See all projects'); a.href = '/work'; p.style.marginTop = '28px'; p.appendChild(a); w.appendChild(p); st.appendChild(w);
  $('bPres').style.display = 'none';
}
var want = new URLSearchParams(location.search).get('p');
function pick(list) { var has = list.filter(function (p) { return p.caseStudy && p.caseStudy.on !== false; }); return want ? has.filter(function (p) { return p.id === want; })[0] : has[0]; }
var shown = '';
function show(list) { var p = pick(list), key = JSON.stringify(p || null); if (key === shown) return; shown = key; if (p) build(p); else missing(); }
var local = SITE.projects.filter(function (p) { return p.visible !== false; });
if (pick(local)) show(local);   /* otherwise keep Loading until the saved projects arrive */
loadProjects().then(show);

function mode(pres) {
  $('story').style.display = pres ? 'none' : 'block'; $('pres').style.display = pres ? 'block' : 'none';
  $('bStory').className = 'fb' + (pres ? '' : ' on'); $('bPres').className = 'fb' + (pres ? ' on' : '');
  $('bStory').setAttribute('aria-pressed', !pres); $('bPres').setAttribute('aria-pressed', pres);
}
$('bStory').addEventListener('click', function () { mode(false); }); $('bPres').addEventListener('click', function () { mode(true); });
