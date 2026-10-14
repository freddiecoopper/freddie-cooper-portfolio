/* Projects page. The list comes from the dashboard (/api/projects), or js/content.js until projects are saved there. */
var LABELS = { viz: 'Product visualization', id: 'Industrial design' };
var cur = 'all', PROJECTS = SITE.projects.filter(function (p) { return p.visible !== false; });
try { var m = sessionStorage.getItem('fc-mode'); if (m === 'viz' || m === 'id') cur = m; } catch (e) {}
var q = new URLSearchParams(window.location.search).get('mode'); if (q === 'viz' || q === 'id') cur = q;
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function render() {
  var f = document.getElementById('filters'); f.textContent = '';
  [['all', 'All'], ['viz', 'Product visualization'], ['id', 'Industrial design']].forEach(function (t) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fb' + (cur === t[0] ? ' on' : ''); b.textContent = t[1]; b.setAttribute('aria-pressed', cur === t[0]);
    b.addEventListener('click', function () { cur = t[0]; render(); }); f.appendChild(b);
  });
  var list = PROJECTS.map(function (p, i) { return Object.assign({ n: i + 1 }, p); }).filter(function (p) { return cur === 'all' || p.kind === cur; });
  var g = document.getElementById('grid'); g.textContent = '';
  list.forEach(function (p, i) {
    var href = projectHref(p), a = document.createElement(href ? 'a' : 'div'); a.className = 'card'; if (href) a.href = href; a.style.animationDelay = (i * 0.07).toFixed(2) + 's';
    var t = document.createElement('div'); t.className = 'thumb'; var im = document.createElement('img'); im.src = p.src; im.alt = p.alt || ''; t.appendChild(im); colourLayer(t, p.srcColor);
    var meta = document.createElement('div'); meta.className = 'meta'; [pad(p.n), LABELS[p.kind]].forEach(function (x) { var s = document.createElement('span'); s.className = 'lbl'; s.textContent = x; meta.appendChild(s); });
    var h = document.createElement('h2'); h.className = 'nm'; h.textContent = p.name; var bl = document.createElement('p'); bl.className = 'bl'; bl.textContent = p.blurb || '';
    [t, meta, h, bl].forEach(function (x) { a.appendChild(x); }); g.appendChild(a);
  });
  document.getElementById('count').textContent = pad(list.length) + (list.length === 1 ? ' project' : ' projects');
}
render();
loadProjects().then(function (items) { if (JSON.stringify(items) !== JSON.stringify(PROJECTS)) { PROJECTS = items; render(); } });
